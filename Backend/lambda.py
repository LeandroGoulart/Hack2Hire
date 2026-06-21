import json
import boto3
import uuid
from datetime import datetime

# Configurações
REGION = "us-east-1"
BUCKET = "docsmart-grupo10"
TABELA = "docsmat"
MODEL_ID = "us.amazon.nova-pro-v1:0"

# Clientes AWS
textract = boto3.client("textract", region_name=REGION)
bedrock = boto3.client("bedrock-runtime", region_name=REGION)
dynamodb = boto3.resource("dynamodb", region_name=REGION)

table = dynamodb.Table(TABELA)

def extrair_texto(bucket, key):
    response = textract.detect_document_text(
        Document={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        }
    )

    linhas = []

    for bloco in response.get("Blocks", []):
        if bloco.get("BlockType") == "LINE":
            linhas.append(bloco["Text"])

    return "\n".join(linhas)

def analisar_documento(texto):
    prompt = f"""
Você é um analista de sinistros da DocSmart.

Analise o documento abaixo e retorne APENAS JSON válido.

Extraia:
- tipo_documento
- resumo
- data
- local
- valor_prejuizo
- envolvidos

Documento:

{texto}
"""

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        })
    )

    resultado = json.loads(
        response["body"].read()
    )

    return resultado

def salvar_dynamodb(resultado, bucket, key):

    item = {
        "id": str(uuid.uuid4()),
        "processado_em": datetime.utcnow().isoformat(),
        "bucket": bucket,
        "arquivo": key,
        "status": "processado",  
        "resultado": resultado
    }

    table.put_item(Item=item)

    return item["id"]

def lambda_handler(event, context):

    try:

        body = json.loads(event["body"])

        bucket = body.get("bucket", BUCKET)
        key = body.get("key")

        if not key:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "erro": "Informe a chave (key) do arquivo"
                })
            }

        texto = extrair_texto(bucket, key)

        resultado = analisar_documento(texto)

        registro_id = salvar_dynamodb(
            resultado,
            bucket,
            key
        )

        resposta = {
            "status": "processado",
            "id": registro_id,
            "bucket": bucket,
            "arquivo": key,
            "resultado": resultado
        }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(
                resposta,
                ensure_ascii=False
            )
        }

    except Exception as e:

        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "erro": str(e)
            })
        }