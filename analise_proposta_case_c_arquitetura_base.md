# Arquitetura Base - Case C

## Visão Geral
Este documento adapta a proposta do Case C para os critérios de avaliação do Hack2Hire, usando os documentos apresentados como base e priorizando uma arquitetura serverless, gerenciada e alinhada a requisitos corporativos.

### Objetivo
Criar uma solução operacional para análise de PDFs de sinistro que:
- recebe documentos via upload;
- extrai informações com OCR e IA generativa;
- estrutura dados em JSON;
- persiste resultados e metadata em banco gerenciado;
- oferece rastreabilidade e monitoramento.

### Equipe e Tempo
- Equipe recomendada: 4-6 pessoas
- Escopo inicial: MVP em 90-120 minutos
- Evolução possível: prova de conceito → operação corporativa → inteligência/Q&A

---

## Arquitetura Base

### Fluxo principal
1. Cliente faz upload de PDF no **Amazon S3**.
2. O evento de upload dispara uma **AWS Lambda** ou chama o endpoint do **API Gateway**.
3. A **Lambda** executa o agente **Strands Agents**.
4. O agente chama **Amazon Textract** para OCR e extração inicial.
5. O agente usa **Amazon Bedrock (Nova Pro)** para normalizar e classificar os dados extraídos.
6. Os resultados estruturados são gravados no **Amazon DynamoDB**.
7. Logs e métricas são enviados para **Amazon CloudWatch**.

### Diagrama lógico

```
Cliente → API Gateway → Lambda Agent → Strands Agent
                                           ↓
                                       Textract
                                           ↓
                                        Bedrock
                                           ↓
                                      DynamoDB
                                           ↓
                                     CloudWatch
```

### Componentes principais
- **Amazon S3**: armazenamento seguro dos PDFs de sinistro.
- **Amazon API Gateway**: endpoint HTTP para upload e ingestão de documentos.
- **AWS Lambda**: execução serverless do agente e orquestração do pipeline.
- **Strands Agents SDK**: lógica de ferramenta/ação e fluxo de decisão.
- **Amazon Textract**: extração OCR de texto e tabelas dos documentos.
- **Amazon Bedrock**: modelo **Nova Pro** para normalização, extração contextual e classificação.
- **Amazon DynamoDB**: persistência de resultados, status de processamento e histórico.
- **Amazon CloudWatch**: monitoramento, logs, métricas e alertas.

---

## Alinhamento com as Regras de Avaliação

### 1. Entendendo a necessidade do cliente
- Cliente definido: operação de sinistros / back office.
- Problema claro: automação de documentos, redução de retrabalho e aceleração de decisão.
- Solução adequada: pipeline de documentos que entrega dados estruturados e histórico.
- Benefícios comunicados: velocidade, confiabilidade, rastreabilidade, menor custo operacional.
- Métricas possíveis: tempo de processamento, taxa de extração correta, volume de documentos por hora, tempo de resposta de API.

### 2. Desenvolvimento Técnico da Solução
- Diagrama de arquitetura presente e simples.
- Usa serviço GenAI da AWS: **Amazon Bedrock** com modelo **Nova Pro**.
- Aproveita funcionalidades nativas: agent orchestration com **Strands**, OCR com **Textract**.
- Prioriza serviços serverless/gerenciados: **Lambda**, **S3**, **DynamoDB**, **API Gateway**, **CloudWatch**.
- Considera IA Responsável:
  - modelo AWS gerenciado;
  - uso de prompts controlados;
  - validação de qualidade antes do armazenamento.
- Regras Well-Architected:
  - operação com redundância e monitoramento;
  - segurança via IAM mínimo;
  - escalabilidade por Lambda e DynamoDB;
  - custo otimizado com serviços serverless.

### 3. Vídeo demonstração da Solução
- Fluxo esperável:
  - upload do PDF;
  - execução do POST via API;
  - resultado gravado no DynamoDB;
  - logs de execução no CloudWatch.
- Deve focar nos benefícios e nos dados entregues.

### 4. Extra
- Orçamento inicial: baixo custo por usar serverless e pay-per-use.
- Possível caso de negócio: redução de tempo de análise de sinistros e menor retrabalho humano.
- Evoluções futuras: dashboards, busca semântica, análise de tendência.

---

## Regras de Construção da Arquitetura

### Priorização
- Usar serviços AWS gerenciados sempre que possível.
- Preferir versões serverless e sem manutenção de infraestrutura.
- Minimizar customização de componentes que a AWS já oferece.

### Segurança e Governança
- IAM com menor privilégio para Lambda, Textract, DynamoDB, S3 e Bedrock.
- S3 com bloqueio por objeto e controle de acesso.
- DynamoDB com chaves e atributos claros: `sinistro_id`, `status`, `dados`, `processado_em`.
- Logs de execução no CloudWatch Logs e métricas no CloudWatch Metrics.

### Performance e custo
- Lambda com timeout estendido apenas quando necessário.
- DynamoDB em demanda ou com capacidade provisionada mínima inicial.
- Evitar chamadas redundantes a Bedrock/Textract.
- Usar triggers AWS e orquestração leve para reduzir latência.

---

## Base de Implementação Recomendada

1. Criar tabela DynamoDB `sinistros_resultados` com chave primária `sinistro_id`.
2. Criar bucket S3 `sinistro-docs-<nome>-2026`.
3. Criar função Lambda `analisar-sinistro-agente` com runtime Python 3.12.
4. Adicionar Layer **Strands Agents** e bibliotecas AWS (boto3, bedrock, textract).
5. Configurar variáveis de ambiente: `DYNAMODB_TABLE`, `S3_BUCKET`, `BEDROCK_MODEL`, `AWS_REGION`.
6. Configurar IAM restrito para S3, Textract, Bedrock, DynamoDB, CloudWatch.
7. Desenvolver o handler Lambda com:
   - recebimento de evento S3 ou payload API;
   - execução do agente Strands;
   - chamada Textract;
   - normalização Bedrock;
   - gravação DynamoDB;
   - retorno JSON.
8. Criar API Gateway com rota `/analisar-sinistro` POST para ingestão direta.
9. Configurar alarmes CloudWatch para falhas e timeout.

---

## Evolução sugerida após MVP

### 1. Governança com persistência e auditoria
- adicionar status de workflow;
- armazenar logs de cada etapa em DynamoDB ou S3;
- disponibilizar endpoint de consulta de caso.

### 2. Inteligência e visão gerencial
- integrar **OpenSearch** ou vector store para busca semântica;
- adicionar **QuickSight** para dashboard operacional;
- permitir consultas em linguagem natural sobre casos.

### 3. IA responsável e qualidade
- incluir validação humana para saídas críticas;
- armazenar prompts e versões do modelo;
- monitorar qualidade dos dados extraídos.

---

## Conclusão
A arquitetura base para o Case C deve ser uma solução serverless simples e funcional, com foco em:
- execução rápida;
- uso de AWS managed services;
- alinhamento com critérios de avaliação;
- maturidade técnica e operacional.

Essa proposta é a base ideal para o projeto apresentado e pode evoluir para uma solução corporativa robusta conforme o tempo permitir.
