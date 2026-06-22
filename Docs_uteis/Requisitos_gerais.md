# Requisitos Gerais - DocuSmart Seguros

## Processamento inteligente de documentos de sinistro

Este documento consolida os requisitos gerais do projeto DocuSmart Seguros, desenvolvido para o Hack2Hire - Escola da Nuvem + AWS. A solucao segue a proposta do Case C, usando Strands Agents, Amazon Textract, Amazon Bedrock, AWS Lambda, Amazon S3, Amazon DynamoDB, API Gateway, IAM e CloudWatch.

---

## 1. Contexto

O DocuSmart Seguros tem como objetivo automatizar a analise inicial de documentos de sinistro. A solucao recebe documentos como boletins de ocorrencia, notas fiscais e laudos, extrai o texto, usa IA generativa para interpretar e estruturar as informacoes, e salva os resultados para consulta e rastreabilidade.

A proposta foi estruturada para demonstrar uma rotina operacional real em uma seguradora, reduzindo trabalho manual e acelerando a triagem documental.

---

## 2. Objetivo Geral

Transformar documentos de sinistro nao estruturados em dados estruturados, consultaveis e padronizados, usando servicos AWS gerenciados e inteligencia artificial generativa.

---

## 3. Publico-Alvo

- Equipes de sinistros.
- Analistas de atendimento.
- Times de back office.
- Gestores que precisam acompanhar volume, status e qualidade dos processos.
- Areas de auditoria e conformidade que necessitam de rastreabilidade.

---

## 4. Requisitos Funcionais

| ID | Requisito | Descricao |
|---|---|---|
| RF01 | Receber documento | O sistema deve permitir que um documento de sinistro seja enviado ou referenciado para processamento. |
| RF02 | Armazenar documento | O documento deve ser armazenado ou localizado no Amazon S3. |
| RF03 | Acionar processamento | Uma requisicao via API Gateway deve acionar a Lambda orquestradora. |
| RF04 | Extrair texto | O sistema deve usar Amazon Textract para extrair texto de documentos PDF, JPG ou PNG. |
| RF05 | Analisar com IA | O texto extraido deve ser enviado ao Amazon Bedrock para classificacao e estruturacao. |
| RF06 | Orquestrar com agente | O fluxo deve utilizar Strands Agents para organizar as etapas e ferramentas de processamento. |
| RF07 | Classificar documento | O sistema deve identificar o tipo de documento, como boletim de ocorrencia, laudo, nota fiscal ou documento geral. |
| RF08 | Extrair campos | O sistema deve extrair campos como data, local, valor estimado, envolvidos e resumo. |
| RF09 | Retornar JSON | A resposta deve ser devolvida em formato JSON padronizado. |
| RF10 | Persistir resultado | O resultado estruturado deve ser salvo no Amazon DynamoDB. |
| RF11 | Consultar resultado | A solucao deve permitir visualizacao ou consulta dos resultados processados. |
| RF12 | Registrar logs | A execucao deve gerar logs no Amazon CloudWatch. |

---

## 5. Requisitos Nao Funcionais

| ID | Requisito | Descricao |
|---|---|---|
| RNF01 | Arquitetura serverless | A solucao deve priorizar servicos gerenciados e serverless da AWS. |
| RNF02 | Escalabilidade | A arquitetura deve permitir aumento de volume sem gerenciar servidores. |
| RNF03 | Disponibilidade | Os documentos e resultados devem usar servicos com alta disponibilidade, como S3 e DynamoDB. |
| RNF04 | Baixa manutencao | A solucao deve reduzir necessidade de infraestrutura propria. |
| RNF05 | Observabilidade | Logs e metricas devem estar disponiveis no CloudWatch. |
| RNF06 | Seguranca | A Lambda deve acessar os servicos por permissoes IAM controladas. |
| RNF07 | Rastreabilidade | Cada processamento deve ter identificador, status e data de execucao. |
| RNF08 | Padronizacao | A saida deve seguir contrato JSON consistente. |
| RNF09 | Clareza de demonstracao | O fluxo deve ser simples de explicar em apresentacao e video. |
| RNF10 | Evolucao futura | A arquitetura deve permitir extensoes como fila, dashboard, autenticacao e revisao humana. |

---

## 6. Requisitos de Entrada

O sistema deve aceitar como entrada uma requisicao contendo, no minimo:

```json
{
  "bucket": "sinistros-upload",
  "key": "documentos/boletim-ocorrencia.pdf",
  "metadata": {
    "origem": "frontend",
    "tipo_esperado": "sinistro"
  }
}
```

Campos esperados:

| Campo | Obrigatorio | Descricao |
|---|---|---|
| `bucket` | Sim | Nome do bucket S3 onde o documento esta armazenado. |
| `key` | Sim | Caminho do arquivo dentro do bucket. |
| `metadata` | Nao | Informacoes adicionais para rastreabilidade ou contexto. |

Formatos de arquivo considerados:

- PDF.
- JPG.
- PNG.

---

## 7. Requisitos de Saida

A resposta deve retornar dados estruturados para uso pelo frontend, pela API ou por sistemas futuros.

Exemplo:

```json
{
  "status": "processado",
  "id": "sin-001",
  "arquivo": "boletim-ocorrencia.pdf",
  "resultado": {
    "tipo_documento": "Boletim de Ocorrencia",
    "resumo": "Acidente de transito com dois veiculos, sem vitimas fatais.",
    "campos_extraidos": {
      "data": "2026-06-15",
      "local": "Av. Paulista, 1000",
      "valor_prejuizo": "R$ 4.500,00",
      "envolvidos": ["Joao Silva", "Maria Souza"]
    }
  }
}
```

Campos principais:

| Campo | Descricao |
|---|---|
| `status` | Estado do processamento. |
| `id` | Identificador unico do registro. |
| `arquivo` | Nome ou chave do documento analisado. |
| `tipo_documento` | Classificacao do documento. |
| `resumo` | Sintese gerada pela IA. |
| `campos_extraidos` | Dados relevantes estruturados em JSON. |

---

## 8. Requisitos de Infraestrutura AWS

| Servico | Uso no projeto |
|---|---|
| Amazon S3 | Armazenamento dos documentos enviados. |
| API Gateway | Endpoint REST para receber requisicoes. |
| AWS Lambda | Orquestracao do processamento. |
| Amazon Textract | OCR e extracao de texto dos documentos. |
| Amazon Bedrock / Nova | Analise generativa, resumo e estruturacao. |
| Strands Agents | Organizacao do fluxo agentico e chamada de ferramentas. |
| Amazon DynamoDB | Persistencia dos resultados estruturados. |
| AWS IAM | Controle de permissoes entre servicos. |
| Amazon CloudWatch | Logs, metricas e acompanhamento tecnico. |

---

## 9. Requisitos de Seguranca

- A Lambda deve usar uma role IAM propria.
- As permissoes devem permitir acesso apenas aos servicos necessarios.
- O acesso ao S3 deve ser restrito ao bucket utilizado no projeto.
- O DynamoDB deve ser acessado somente pela Lambda ou por servicos autorizados.
- Logs devem evitar exposicao desnecessaria de dados sensiveis.
- Em uma versao produtiva, o endpoint deve usar autenticacao, como Cognito, IAM authorizer ou API Key.
- Dados pessoais devem seguir boas praticas de privacidade e retencao.

---

## 10. Requisitos de Demonstracao

Para a apresentacao do projeto, a solucao deve evidenciar:

- Upload ou referencia de documento de sinistro.
- Chamada ao endpoint de processamento.
- Uso de OCR com Amazon Textract.
- Uso de IA generativa com Amazon Bedrock.
- Orquestracao do fluxo com Strands Agents.
- Retorno em JSON estruturado.
- Registro salvo em DynamoDB.
- Visualizacao do resultado no frontend ou material de demonstracao.
- Logs ou evidencias de execucao no CloudWatch.

A apresentacao final esta na pasta:

```text
Docs_uteis/Apresentacao
```

Os videos de demonstracao ja foram realizados e fazem parte da entrega final.

---

## 11. Restricoes e Limitacoes do MVP

- O projeto tem foco em demonstracao e validacao do conceito.
- Autenticacao completa de usuarios nao faz parte do MVP.
- Revisao humana integrada nao faz parte do MVP.
- Dashboard gerencial completo fica como evolucao futura.
- Busca semantica e RAG nao fazem parte da entrega atual.
- O custo de Textract e Bedrock deve ser monitorado em ambientes reais.
- A qualidade da extracao depende da legibilidade dos documentos.

---

## 12. Criterios de Aceite

O projeto e considerado aderente quando:

- A arquitetura usa servicos AWS gerenciados.
- A solucao inclui pelo menos um servico GenAI AWS.
- O fluxo documenta uso de Strands Agents, Textract e Bedrock.
- A API retorna JSON estruturado.
- O resultado e persistido em DynamoDB.
- A demonstracao mostra o fluxo principal de ponta a ponta.
- A documentacao explica problema, arquitetura, requisitos, beneficios e limitacoes.
- A apresentacao e os videos apoiam a narrativa tecnica e de negocio.

---

## 13. Evolucoes Futuras

- Criar endpoint de consulta por ID.
- Criar listagem por status, data e tipo de documento.
- Adicionar SQS para processamento assincrono.
- Adicionar Step Functions para orquestracao visual.
- Implementar autenticacao com Cognito ou API Key.
- Criar dashboard operacional com metricas.
- Adicionar revisao humana para casos de baixa confianca.
- Aplicar infraestrutura como codigo.
- Refinar politicas IAM com menor privilegio.

---

## 14. Conclusao

Os requisitos gerais do DocuSmart Seguros consolidam uma solucao serverless e orientada por IA para transformar documentos de sinistro em dados estruturados. O projeto atende ao Case C ao combinar agentes, OCR, IA generativa, persistencia e observabilidade em uma arquitetura AWS clara e demonstravel.
