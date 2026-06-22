# 📊 Proposta Case C: Soluções Operacionais com Strands Agents

## Documento de Propostas para Rotinas Reais em Ambientes Corporativos

**Data:** 16 de junho de 2026  
**Evento:** Hack2Hire - Escola de Nuvem (EDN) + AWS

---

## Resumo Executivo

Este documento foca no **Case C** e apresenta três propostas de solução para um cenário operacional real. O objetivo é criar um material técnico e de produto voltado para rotinas internas de uma empresa: recepção de documentos, classificação de sinistros, extração de dados, registro de processos e apoio à decisão.

### O que será apresentado
- Problema comum em operações corporativas
- Alternativas técnicas para o mesmo case
- Rotinas que acontecem dentro da organização
- Ferramentas e arquitetura propostas
- Critérios de escolha para cada perfil de equipe

### Índice
1. ✅ Proposta 1: Operação Básica com Strands e Extração Automática
2. ⚠️ Proposta 2: Operação Corporativa com Persistência e Auditoria
3. 🚀 Proposta 3: Solução Avançada com Monitoramento e Q&A

---

## 1️⃣ PROPOSTA 1: Operação Básica com Strands e Extração Automática

### 🎯 Descrição
- **Contexto:** Case C como solução para rotinas de entrada de documentos em uma central de sinistros ou análise documental.
- **Objetivo:** transformar documentos recebidos em dados estruturados com mínimo esforço operacional.
- **Stack:** Python + Strands Agents SDK + Amazon Textract + Amazon Bedrock + AWS Lambda.

### 📋 Escopo Operacional
- Recepção de documentos (PDFs, imagens) via upload ou S3.
- Disparo automático de processo quando o arquivo chega.
- Classificação do tipo de documento.
- Extração dos campos principais (data, valor, partes envolvidas, descrição).
- Geração de JSON padronizado para sistemas downstream.
- Envio de resultado para uma fila de análise humana ou outro sistema de workflow.

### 🔧 Ferramentas Principais

| Ferramenta | Função |
|------------|--------|
| **Strands Agents SDK** | Orquestração inteligente do fluxo com tools definidas |
| **Amazon Textract** | OCR e extração de texto básico |
| **Amazon Bedrock** | Modelo LLM para decisão e normalização |
| **Amazon S3** | Armazenamento de documentos e resultados |
| **AWS Lambda** | Execução do handler e do agente |
| **Amazon DynamoDB** | Armazenamento simples de metadados e status |

### ✅ Vantagens
- **Entrega rápida:** solução MVP montada com poucas integrações.
- **Baixo risco:** fluxo simples, ideal para protótipo de hackathon.
- **Foco operacional:** resolve a rotina de entrada de documentos imediatamente.
- **Menos coordenação:** Strands cuida da lógica de orquestração.

### ❌ Limitações
- **Menos governança:** histórico de processo reduzido.
- **Sem interface final:** resultado é JSON, não há dashboard imediato.
- **Funções de negócio limitadas:** não há suporte nativo para revisões ou aprovação humana.
- **Poder analítico restrito:** não oferece consulta semântica nem painel gerencial.

### 📊 Complexidade Técnica
```
Curva de aprendizado:     ███░░░░░░░  (30%)
Configuração AWS:         ██░░░░░░░░  (20%)
Implementação Python:     ███░░░░░░░  (30%)
Debugging:                ██░░░░░░░░  (20%)
Entregáveis de qualidade: ███░░░░░░  (40%)
```

### ⏱️ Quando usar esta proposta
- Equipe pequena com prazo curto.
- Quer provar rapidamente que Case C funciona.
- Precisa de um MVP operacional simples.
- Deseja mostrar automação de rotina sem construir UI.

---

## 2️⃣ PROPOSTA 2: Operação Corporativa com Persistência e Auditoria

### 🎯 Descrição
- **Contexto:** Case C aplicado a uma operação real de sinistros, onde o processo deve suportar controle, histórico e visibilidade para analistas e gestores.
- **Objetivo:** transformar o fluxo de documentos em um processo empresarial robusto, com registro de etapas, validação e consulta.
- **Stack:** Python + Strands Agents SDK + Amazon Textract + Amazon Bedrock + AWS Lambda + DynamoDB + API Gateway + Step Functions.

### 📋 Escopo Operacional
- Ingestão de documentos em lote ou individual, via upload ou S3.
- Triagem automática e classificação de tipo de documento.
- Extração e normalização de campos críticos.
- Persistência de casos em DynamoDB com status e logs.
- API de consulta para equipes de atendimento e operação.
- Notificação de exceções e encaminhamento para revisão humana.

### 🔧 Ferramentas Principais

| Ferramenta | Função |
|------------|--------|
| **Strands Agents SDK** | Orquestração inteligente e decisão de ferramentas |
| **Amazon Textract** | OCR e extração de texto estruturado |
| **Amazon Bedrock** | Normalização de texto e verificação contextual |
| **AWS Lambda** | Execução serverless do fluxo |
| **Amazon DynamoDB** | Registro de casos e histórico operacional |
| **Amazon API Gateway** | Interface de consulta e ingestão |
| **AWS Step Functions** | Controle de processo e retries |
| **Amazon CloudWatch** | Monitoramento e alertas |

### ✅ Vantagens
- **Auditabilidade:** cada caso tem histórico e status rastreável.
- **Visibilidade operacional:** APIs permitem acompanhar o fluxo.
- **Resiliência:** retries e tratamento de erros alinhados a processos reais.
- **Modelagem corporativa:** atende back office, compliance e análise de sinistros.

### ❌ Limitações
- **Maior complexidade:** envolve mais componentes e integrações.
- **Tempo de entrega:** mais custoso que um MVP básico.
- **Mais custo operacional:** inclui DynamoDB, Step Functions e monitoramento.
- **Ainda sem front-end completo:** há interface de consulta, mas não dashboard avançado.

### 📊 Complexidade Técnica
```
Curva de aprendizado:     █████░░░░░  (50%)
Configuração AWS:         █████░░░░░  (50%)
Implementação Python:     █████░░░░░  (50%)
Debugging:                █████░░░░░  (50%)
Entregáveis de qualidade: █████░░░░░  (50%)
```

### 🎯 Arquitetura
```
Upload / API → S3 → Lambda → Strands Agent → Textract / Bedrock
                                         ↓
                                     DynamoDB
                                         ↓
                                 Step Functions
                                         ↓
                               API Gateway / CloudWatch
```

### ⏱️ Quando usar esta proposta
- Há necessidade de apresentar o case como solução corporativa.
- O projeto deve mostrar governança e controle operacional.
- A equipe tem capacidade para integrar múltiplos serviços.
- Deseja demonstrar processo, histórico e consulta de casos.

---

## 3️⃣ PROPOSTA 3: Solução Avançada com Monitoramento e Q&A

### 🎯 Descrição
- **Contexto:** Case C como solução de operação inteligente que vai além da extração e entrega suporte à análise e controle.
- **Objetivo:** combinar automação de documentos com consulta inteligente e visibilidade gerencial.
- **Stack:** Strands Agents SDK + Amazon Textract + Amazon Bedrock + DynamoDB + API Gateway + OpenSearch/Vector Store + QuickSight.

### 📋 Escopo Operacional
- Processamento automatizado de documentos e geração de JSON.
- Registro completo do fluxo e indicadores de qualidade.
- Exposição de API para consulta gerencial de casos.
- Motor de pesquisa semântica para perguntas sobre sinistros.
- Dashboard simples com métricas de volume, tempo e taxa de aprovação.

### 🔧 Ferramentas Principais

| Ferramenta | Função |
|------------|--------|
| **Amazon OpenSearch / S3 Vector Store** | Busca semântica e RAG |
| **Amazon QuickSight** | Dashboard de operação |
| **Amazon DynamoDB** | Histórico e metadata |
| **Amazon API Gateway** | Interface de consulta |
| **Strands Agents SDK** | Orquestração inteligente |
| **Amazon Bedrock** | Normalização e resposta a perguntas |

### ✅ Vantagens
- **Diferencial alto:** traz inteligência e consulta no mesmo case.
- **Maior impacto:** convence avaliadores com dashboard e pesquisa inteligente.
- **Suporte decisório:** negócio consegue responder perguntas operacionais rapidamente.
- **Escalável:** arquitetura preparada para evolução em BI e RAG.

### ❌ Limitações
- **Escopo maior:** exige mais tempo para integrar componentes.
- **Risco de implementação:** busca semântica e dashboards podem aumentar complexidade.
- **Custo mais alto:** inclui OpenSearch/Vector Store e QuickSight.
- **Dependência de dados:** resultados bons exigem dados consistentes.

### 📊 Complexidade Técnica
```
Curva de aprendizado:     █████░░░░░  (50%)
Configuração AWS:         █████░░░░░  (50%)
Implementação Python:     █████░░░░░  (50%)
Debugging:                ██████░░░░  (60%)
Entregáveis de qualidade: █████░░░░░  (50%)
```

### 🎯 Arquitetura
```
Upload / API → S3 → Lambda → Strands Agent → Textract / Bedrock
                                         ↓
                                     DynamoDB
                                         ↓
                            OpenSearch / Vector Store
                                         ↓
                     API Gateway / Dashboards / Q&A
```

### ⏱️ Quando usar esta proposta
- Existe tempo e interesse em impressionar com BI e inteligência.
- O projeto deve ser apresentado como solução de operação madura.
- A equipe pode entregar extras como painel e pesquisa.
- É necessário demonstrar valor além do processamento básico.

---

## 📊 Comparação das Propostas para Case C

| Critério | Proposta 1 | Proposta 2 | Proposta 3 |
|---|---|---|---|
| **Foco** | MVP operacional | Operação corporativa | Inteligência e Q&A |
| **Principal valor** | Automação rápida | Governança e auditoria | Decisão e visibilidade |
| **Complexidade** | Baixa | Média | Média-alta |
| **Tempo estimado** | 2-4 horas | 6-10 horas | 8-12 horas |
| **Equipe ideal** | 2-3 pessoas | 3-4 pessoas | 3-4 pessoas |
| **Serviços AWS** | 5-6 | 7-9 | 8-10 |
| **Persistência** | Básica | Completa | Completa |
| **Auditabilidade** | Baixa | Média | Alta |
| **Dashboard / BI** | Não | Opcional | Sim |
| **Q&A / Busca** | Não | Opcional | Sim |
| **Governança operacional** | Baixa | Média | Alta |
| **Risco de entrega** | Baixo | Médio | Médio |
| **Impacto em apresentação** | Bom | Forte | Muito forte |

---

## 🎓 Matriz de Decisão

### Você deve escolher **Proposta 1** se:
- A prioridade for validar o fluxo operacional rapidamente.
- O time quiser entregar o MVP mais simples possível.
- Não houver tempo para construir controle ou BI.

### Você deve escolher **Proposta 2** se:
- Precisa demonstrar solução corporativa com histórico e status.
- Deseja mostrar operação com governança e auditoria.
- A equipe tem capacidade para integrar serviços adicionais.

### Você deve escolher **Proposta 3** se:
- Quer impressionar com inteligência e consulta sobre o processo.
- Deseja apresentar dashboards e resposta a perguntas.
- Há disponibilidade para entregar um MVP com mais componentes.

---

## 🏆 Recomendações Finais

### Por Tipo de Contexto Operacional

#### 🟢 Centro de atendimento ou back office
→ **Proposta 1**
- Boa para operacionalizar a rotina inicial de documentos.
- Ideal quando o objetivo é mostrar processo simples e efetivo.

#### 🟡 Área de controle e conformidade
→ **Proposta 2**
- Ideal para operações que exigem histórico e auditoria.
- Mostra maturidade técnica e foco em processo.

#### 🔴 Área de inteligência e decisão
→ **Proposta 3**
- Excelente para demonstrar valor além do processamento.
- Útil quando o objetivo é transformar dados em insights.

---

## 💻 COMPARAÇÃO DE CÓDIGO

### Proposta 1: Strands com fluxo simples
```python
from strands import Agent, tool
from strands.models import BedrockModel

@tool
def extrair_documento(bucket, key):
    return textract.detect_document_text(
        Bucket=bucket, 
        Document={'S3Object': {'Bucket': bucket, 'Name': key}}
    )

@tool
def salvar_json(resultado):
    return dynamodb.put_item(TableName='Sinistros', Item=resultado)

agent = Agent(
    model=BedrockModel('amazon-nova-pro'),
    tools=[extrair_documento, salvar_json],
    system_prompt='Você é um assistente de análise documental para sinistros.'
)

response = agent('Classifique o documento e extraia os campos principais.')
```

### Proposta 2: Strands com persistência e controle
```python
from strands import Agent, tool
from strands.models import BedrockModel

@tool
def extrair_texto(bucket, key):
    return textract.detect_document_text(...)

@tool
def validar_campos(payload):
    # valida e normaliza datas, valores e tipos
    return normalize_payload(payload)

@tool
def registrar_caso(payload):
    return dynamodb.put_item(TableName='CasosSinistros', Item=payload)

agent = Agent(
    model=BedrockModel('amazon-nova-pro'),
    tools=[extrair_texto, validar_campos, registrar_caso],
    system_prompt='Você é um agente operacional de sinistros que registra o fluxo e valida dados.'
)
```

### Proposta 3: Strands com BI e pesquisa inteligente
```python
from strands import Agent, tool
from strands.models import BedrockModel

@tool
def extrair_e_indexar(bucket, key):
    extracted = textract.detect_document_text(...)
    index_to_opensearch(extracted)
    return extracted

@tool
def responder_pergunta(query):
    return bedrock.invoke_model(
        model_id='amazon-nova-pro',
        input_text=query
    )

agent = Agent(
    model=BedrockModel('amazon-nova-pro'),
    tools=[extrair_e_indexar, responder_pergunta],
    system_prompt='Você é um agente de suporte a decisão para sinistros.'
)
```

---

## 🎯 CASO DE USO REAL: Fluxo de um Sinistro

### Entrada Comum (todas as 3):
```json
{
  "bucket": "sinistros-operacao",
  "key": "2026/06/15/boletim-ocorrencia-123.pdf"
}
```

### Saída Esperada (todas as 3):
```json
{
  "id": "sinistro-123",
  "tipo_documento": "Boletim de Ocorrência",
  "status": "Pendente revisão",
  "campos_extraidos": {
    "data_ocorrencia": "2026-06-15",
    "local": "Av. Paulista, 1000",
    "valor_estimado": "R$ 4.500,00",
    "envolvidos": ["João Silva", "Maria Souza"]
  },
  "resumo": "Acidente de trânsito com dois veículos, sem vítimas",
  "processado_em": "2026-06-16T10:30:00Z"
}
```

### O que cada proposta adiciona:

#### Proposta 1
- Retorna JSON estruturado ✓
- Salva resultado básico em DynamoDB ✓
- Executa fluxo automático simples ✓

#### Proposta 2
- Retorna JSON estruturado ✓
- Salva caso com status e histórico ✓
- Permite consulta de casos via API ✓
- Garante retries e tratamento de erros ✓

#### Proposta 3
- Retorna JSON estruturado ✓
- Salva caso com histórico ✓
- Permite pesquisas inteligentes ✓
- Gera insights e dashboards básicos ✓

---

## 🚀 PRÓXIMOS PASSOS

### Se escolheu **Proposta 1**:
1. Leia a documentação do Amazon Strands Agents SDK
2. Explore repositórios de samples: `aws-samples/bedrock-samples`
3. Crie um projeto na console AWS
4. Teste com os documentos fornecidos
5. **Mentor:** Escola de Nuvem (EDN)

### Se escolheu **Proposta 2** (Full Stack + Workflows):
1. Aprenda Step Functions (diagrama visual)
2. Entenda o pipeline: Textract → Bedrock → DynamoDB
3. Configure API Gateway para consultas
4. Estude padrões de auditoria e retry
5. **Mentores:** Samuel Sá, Jusimar Silva, Wilian Uhlmann

### Se escolheu **Proposta 3** (Strands + Analytics):
1. Leia o guia Strands Agents SDK
2. Instale o Layer do Strands na Lambda
3. Crie 2-3 ferramentas simples (Textract, DynamoDB)
4. Configure busca semântica com OpenSearch
5. **Mentor:** Escola de Nuvem (EDN)

---

## 🎁 Dicas Ouro para Cada Proposta

### Proposta 1
- ✅ Defina o schema JSON logo no início
- ✅ Teste com um documento primeiro
- ✅ Não tente processar tudo de uma vez
- ⚠️ Monitore timeouts do Lambda

### Proposta 2
- ✅ Use Step Functions visual designer (não JSON manual)
- ✅ Comece com Textract, depois complique
- ✅ Salve TUDO no DynamoDB para auditoria
- ✅ Teste fluxo com 10 documentos antes de 1000
- ⚠️ Custos podem ser altos: monitore

### Proposta 3
- ✅ Teste seu agente localmente (sem Lambda primeiro)
- ✅ System prompt é CRUCIAL: seja bem específico
- ✅ Comece com 1 ferramenta, depois 2
- ✅ Aumente timeout Lambda para 60+ segundos
- ⚠️ Índices no OpenSearch precisam estar bem configurados

---

## 📊 Score Card Final

### Proposta 1
| Item | Score |
|------|-------|
| Simplicidade | ⭐⭐⭐⭐⭐ |
| Velocidade | ⭐⭐⭐ |
| Curva de aprendizado | ⭐⭐⭐⭐ |
| Inovação | ⭐⭐ |
| Escalabilidade | ⭐⭐ |
| **TOTAL** | **⭐⭐⭐⭐** |

### Proposta 2
| Item | Score |
|------|-------|
| Simplicidade | ⭐ |
| Velocidade | ⭐ |
| Curva de aprendizado | ⭐⭐⭐ |
| Inovação | ⭐⭐⭐⭐⭐ |
| Escalabilidade | ⭐⭐⭐⭐⭐ |
| **TOTAL** | **⭐⭐⭐** |

### Proposta 3
| Item | Score |
|------|-------|
| Simplicidade | ⭐⭐⭐⭐ |
| Velocidade | ⭐⭐⭐⭐⭐ |
| Curva de aprendizado | ⭐⭐⭐ |
| Inovação | ⭐⭐⭐⭐ |
| Escalabilidade | ⭐⭐⭐ |
| **TOTAL** | **⭐⭐⭐⭐** |

---

## 🎓 Perguntas Finais para sua Decisão

### 1. Qual é o seu prazo?
- **< 4h** → Proposta 1
- **4-8h** → Proposta 3
- **8h+** → Proposta 2

### 2. Qual é seu nível técnico?
- **Iniciante** → Proposta 1
- **Intermediário** → Proposta 3
- **Avançado** → Proposta 2

### 3. O que você quer apresentar?
- **"Automação rápida"** → Proposta 1
- **"Operação robusta"** → Proposta 2
- **"Inteligência + Operação"** → Proposta 3

---

## 💡 Conclusão

Para o **Case C**, a melhor estratégia é:

1. **Começar por Proposta 1** → MVP funcional em poucas horas
2. **Evoluir para Proposta 2** → Se houver time e tempo
3. **Finalizar com Proposta 3** → Se quiser impressionar com BI e Q&A

Isso garante MVP operacional, mantém o escopo alinhado ao contexto corporativo e permite iteração conforme o tempo disponível.

---

**Elaborado para:** Hack2Hire - Escola de Nuvem (EDN) + AWS  
**Data:** 16 de junho de 2026  
**Objetivo:** Propor soluções técnicas viáveis para Case C em ambientes operacionais reais
