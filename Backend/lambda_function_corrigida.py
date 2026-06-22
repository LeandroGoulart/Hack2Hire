"""
Lambda para processamento de documentos sinistro
Trabalha com arquivos em S3 e armazena resultados em DynamoDB
Desenvolvido por estudantes Escola da Nuvem - Hack2Hire 2026
"""

import json
import boto3
import os
import uuid
from datetime import datetime, timedelta

# Configurações via variáveis de ambiente - SEGURANÇA

DYNAMO_TABLE = os.environ.get('DYNAMO_TABLE_NAME', 'sinistros_resultados')
DOCUMENTS_BUCKET = os.environ.get('DOCUMENTS_BUCKET', 'sinistro-docs-hack2hire-2026')
AWS_REGION = os.environ.get('AWS_REGION_NAME', 'us-east-1')

# Inicializar clientes AWS
s3_client = boto3.client('s3', region_name=AWS_REGION)
dynamo_client = boto3.resource('dynamodb', region_name=AWS_REGION)
table = dynamo_client.Table(DYNAMO_TABLE)

# Utilitários de extração

def extrair_texto_s3(bucket: str, key: str) -> str:
    """
    Extrai texto bruto de arquivo no S3.
    Suporta: TXT, JSON, CSV, ou tenta ler como texto.
    """
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        conteudo = response['Body'].read().decode('utf-8', errors='ignore')
        return conteudo.strip()
    except Exception as e:
        print(f"Erro ao ler S3: {str(e)}")
        return f"[Erro ao ler arquivo: {str(e)}]"


def estruturar_dados(texto: str, metadata: dict) -> dict:
    """
    Extrai e estrutura informações do texto.
    Procura por padrões comuns em documentos.
    """
    
    dados_estruturados = {
        "tipo_documento": "Documento Desconhecido",
        "resumo": texto[:200] if len(texto) > 200 else texto,
        "campos_extraidos": {
            "data": "Não encontrada",
            "local": "Não especificado",
            "valor_prejuizo": "Não especificado",
            "envolvidos": []
        },
        "texto_bruto": texto[:500]
    }
    
    # Classificação simples de documento
    
    texto_lower = texto.lower()
    
    if 'boletim' in texto_lower and 'ocorrência' in texto_lower:
        dados_estruturados['tipo_documento'] = 'Boletim de Ocorrência'
    elif 'laudo' in texto_lower and ('médico' in texto_lower or 'pericial' in texto_lower):
        dados_estruturados['tipo_documento'] = 'Laudo Médico/Pericial'
    elif 'nota' in texto_lower and ('fiscal' in texto_lower or 'nfe' in texto_lower):
        dados_estruturados['tipo_documento'] = 'Nota Fiscal'
    elif 'identidade' in texto_lower or 'cpf' in texto_lower:
        dados_estruturados['tipo_documento'] = 'Documento de Identidade'
    else:
        dados_estruturados['tipo_documento'] = 'Documento Geral'
    
    # Extração de campos comuns (regex simples)
    
    import re
    
    data_match = re.search(r'\d{2}/\d{2}/\d{4}', texto)
    if data_match:
        dados_estruturados['campos_extraidos']['data'] = data_match.group(0)
    
    valor_match = re.search(r'R\$\s*[\d.,]+', texto)
    if valor_match:
        dados_estruturados['campos_extraidos']['valor_prejuizo'] = valor_match.group(0)
    
    local_match = re.search(r'(Av\.|Rua|Pça|Travessa|Estrada|Alameda)\s+[^,\n]+', texto)
    if local_match:
        dados_estruturados['campos_extraidos']['local'] = local_match.group(0).strip()
    
    # Adicionar metadados fornecidos
    
    if metadata:
        for chave, valor in metadata.items():
            if valor and chave not in dados_estruturados['campos_extraidos']:
                dados_estruturados['campos_extraidos'][chave] = valor
    
    return dados_estruturados


def salvar_resultado_dynamodb(resultado: dict) -> str:
    """
    Salva resultado estruturado no DynamoDB.
    Retorna o ID do documento processado.
    """
    
    processo_id = str(uuid.uuid4())
    agora = datetime.utcnow().isoformat() + 'Z'
    
    ttl_dias = int(os.environ.get('TTL_DIAS', '90'))
    ttl_timestamp = int((datetime.utcnow() + timedelta(days=ttl_dias)).timestamp())
    
    item = {
        'processId': processo_id,
        'tipo_documento': resultado.get('tipo_documento', 'Desconhecido'),
        'resumo': resultado.get('resumo', '')[:500],
        'campos_extraidos': resultado.get('campos_extraidos', {}),
        'status': 'COMPLETED',
        'createdAt': agora,
        'updatedAt': agora,
        'ttl': ttl_timestamp
    }
    
    if 'bucket_s3' in resultado:
        item['bucket_s3'] = resultado['bucket_s3']
    if 'chave_s3' in resultado:
        item['chave_s3'] = resultado['chave_s3']
    if 'texto_bruto' in resultado:
        item['texto_bruto'] = resultado['texto_bruto']
    
    try:
        table.put_item(Item=item)
        print(f"Documento salvo em DynamoDB: {processo_id}")
        return processo_id
    except Exception as e:
        print(f"Erro ao salvar em DynamoDB: {str(e)}")
        raise


def mover_arquivo_s3(bucket: str, chave_origem: str, pasta_destino: str) -> bool:
    """
    Move arquivo de um local para outro dentro do S3.
    Pastas aceitas: processed ou rejected
    """
    try:
        nome_arquivo = chave_origem.split('/')[-1]
        chave_destino = f"{pasta_destino}/{nome_arquivo}"
        
        s3_client.copy_object(
            Bucket=bucket,
            CopySource={'Bucket': bucket, 'Key': chave_origem},
            Key=chave_destino
        )
        
        s3_client.delete_object(Bucket=bucket, Key=chave_origem)
        print(f"Arquivo movido de {chave_origem} para {chave_destino}")
        return True
        
    except Exception as e:
        print(f"Erro ao mover arquivo: {str(e)}")
        return False


def processar_documento(bucket: str, key: str, metadata: dict = None) -> dict:
    """
    Pipeline completa de processamento do documento conforme especificado na arquitetura.
    
    Etapas:
    1. Receber evento do API Gateway (já feito)
    2. Validar entrada
    3. Ler arquivo PDF do S3
    4. Extrair texto/dados brutos
    5. Parsear e estruturar dados
    6. Validar qualidade dos dados
    7. Salvar resultado em DynamoDB
    8. Mover arquivo para pasta processed ou rejected
    9. Registrar em CloudWatch (via logs)
    10. Retornar resultado
    """
    
    print(f"Iniciando processamento de documento: s3://{bucket}/{key}")
    
    try:
        # Etapa 1: Validação básica (já feita no handler)
        # Etapa 2: Ler do S3
        print(f"Etapa 1: Lendo documento do S3 ({key})")
        texto = extrair_texto_s3(bucket, key)
        
        if not texto or "[Erro" in texto:
            raise Exception(f"Falha ao ler arquivo: {texto}")
        
        print(f"Documento lido com sucesso ({len(texto)} caracteres)")
        
        # Etapa 3: Estruturar e validar dados
        print("Etapa 2: Estruturando dados do documento")
        dados = estruturar_dados(texto, metadata or {})
        
        # Etapa 4: Validar qualidade
        print("Etapa 3: Validando qualidade dos dados")
        if not dados.get('tipo_documento') or dados['tipo_documento'] == 'Documento Desconhecido':
            print("Aviso: Tipo de documento não identificado com precisão")
        
        campos_obrigatorios = dados.get('campos_extraidos', {})
        if not campos_obrigatorios:
            raise Exception("Nenhum campo foi extraído do documento")
        
        # Etapa 5: Adicionar metadados
        dados['bucket_s3'] = bucket
        dados['chave_s3'] = key
        dados['origem'] = 'api'
        
        # Etapa 6: Salvar em DynamoDB
        print("Etapa 4: Salvando resultado em DynamoDB")
        processo_id = salvar_resultado_dynamodb(dados)
        
        # Etapa 7: Mover arquivo para pasta processed
        print("Etapa 5: Movendo arquivo para pasta processed")
        arquivo_movido = mover_arquivo_s3(bucket, key, "processed")
        
        if not arquivo_movido:
            print("Aviso: Arquivo não foi movido, mas dados foram salvos com sucesso")
        
        # Etapa 8: Preparar resultado final
        resultado_final = {
            'processId': processo_id,
            'status': 'COMPLETED',
            'tipo_documento': dados['tipo_documento'],
            'resumo': dados['resumo'],
            'campos_extraidos': dados['campos_extraidos'],
            'processado_em': datetime.utcnow().isoformat() + 'Z',
            'arquivo_movido': arquivo_movido
        }
        
        print(f"Processamento concluído com sucesso: {processo_id}")
        return resultado_final
        
    except Exception as e:
        erro_msg = str(e)
        print(f"Erro durante processamento: {erro_msg}")
        
        # Mover arquivo para pasta rejected em caso de erro
        try:
            print(f"Movendo arquivo para rejected debido a erro: {erro_msg}")
            mover_arquivo_s3(bucket, key, "rejected")
        except:
            print("Nao foi possivel mover arquivo para rejected")
        
        return {
            'status': 'FAILED',
            'erro': erro_msg,
            'bucket_s3': bucket,
            'chave_s3': key
        }


# ═══════════════════════════════════════════════════════════════════════════
# HANDLER PRINCIPAL - API GATEWAY
# ═══════════════════════════════════════════════════════════════════════════

def lambda_handler(event, context):
    """
    Handler principal da Lambda.
    Recebe evento do API Gateway com JSON: {bucket, key, metadata}
    
    Exemplo de entrada:
    {
        "bucket": "sinistro-docs-hack2hire-2026",
        "key": "incoming/sinistro_001.txt",
        "metadata": {
            "claim_number": "SC2026001",
            "customer_name": "João Silva"
        }
    }
    """
    
    print("Lambda iniciada")
    print(f"Evento recebido: {json.dumps(event)}")
    
    # Validar e extrair parâmetros do evento
    
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event
    except json.JSONDecodeError:
        print("Erro: Body JSON inválido")
        return {
            'statusCode': 400,
            'body': json.dumps({'erro': 'Body JSON inválido'}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    
    bucket = body.get('bucket')
    key = body.get('key')
    metadata = body.get('metadata', {})
    
    # Validar parâmetros obrigatórios
    if not bucket:
        print("Erro: parametro bucket nao informado")
        return {
            'statusCode': 400,
            'body': json.dumps({'erro': 'Parametro bucket obrigatorio'}),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        }
    
    if not key:
        print("Erro: parametro key nao informado")
        return {
            'statusCode': 400,
            'body': json.dumps({'erro': 'Parametro key obrigatorio'}),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        }
    
    # Processar documento
    
    try:
        resultado = processar_documento(bucket, key, metadata)
        
        status_code = 200 if resultado.get('status') == 'COMPLETED' else 400
        
        return {
            'statusCode': status_code,
            'body': json.dumps(resultado, ensure_ascii=False, indent=2),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        
    except Exception as e:
        erro_msg = str(e)
        print(f"Erro durante processamento: {erro_msg}")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'erro': 'Erro ao processar documento',
                'detalhe': erro_msg
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }


# Testes locais (para debug)

if __name__ == '__main__':
    """
    Para testar localmente:
    1. Definir variáveis de ambiente:
       export DYNAMO_TABLE_NAME=sinistros_resultados
       export DOCUMENTS_BUCKET=sinistro-docs-hack2hire-2026
    
    2. Ter credenciais AWS configuradas (aws configure)
    
    3. Executar: python lambda_function_corrigida.py
    """
    
    evento_teste = {
        'body': json.dumps({
            'bucket': 'sinistro-docs-hack2hire-2026',
            'key': 'incoming/exemplo.txt',
            'metadata': {
                'claim_number': 'SC2026001',
                'customer_name': 'Maria Silva'
            }
        })
    }
    
    resultado = lambda_handler(evento_teste, None)
    print("\n" + "="*80)
    print("RESULTADO DO TESTE:")
    print("="*80)
    print(json.dumps(json.loads(resultado['body']), indent=2, ensure_ascii=False))
