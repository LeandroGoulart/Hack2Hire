# Requisitos Gerais — Laboratório Guiado

## Contexto
Este é um **laboratório prático e guiado** como parte do **Hack2Hire 2026**. Todos os passos serão desenvolvidos pelos próprios alunos e posteriormente orientados por mentores, com instruções de correção.

---

## Pré-Requisitos

### 1. Conta AWS
-  Conta AWS ativa (pessoal ou fornecida pela Escola de Nuvem).
-  Acesso ao console AWS (https://console.aws.amazon.com).
-  Permissão para criar recursos (S3, Lambda, DynamoDB, API Gateway, IAM).
-  **Nota**: o laboratório usa serviços do **Free Tier** da AWS. Não há custo adicional esperado.

### 2. Navegador Web
-  Qualquer navegador moderno (Chrome, Firefox, Edge, Safari).
-  **Nenhuma instalação local necessária** — tudo é feito pelo console AWS.

### 3. Conhecimento Esperado
- **Nenhum pré-requisito técnico** — mentores guiam cada clique.
-  **NÃO é necessário saber**: Python, Git, AWS CLI ou qualquer framework externo.
-  **Você aprenderá**: como usar console AWS, criar recursos, conectá-los, testar APIs, ler resultados.

---

## O que o Laboratório Oferece

### Guia Prático
-  Instruções passo a passo para cada clique (console AWS).
-  Imagens/screenshots de referência com círculos destacando onde clicar.
-  Código-template já pronto — você só copia para o console.
-  Troubleshooting comum já documentado.

### Mentores Disponíveis
-  Suporte em tempo real durante o laboratório.
-  Resposta a dúvidas sobre AWS, arquitetura serverless, integração de serviços.
-  Ajuda com erros de configuração e testes de API.

### Material de Referência
-  Documentação AWS oficial (Lambda, S3, DynamoDB, API Gateway).
-  Exemplos de código prontos para copiar/colar.
-  Guias de troubleshooting comum.

---

## Cronograma Recomendado

| Fase | Duração | Atividade |
|------|---------|-----------|
| **Setup** | 15-20 min | Criar tabela DynamoDB, bucket S3, função Lambda |
| **Codificação** | 40-50 min | Desenvolver função Lambda + tratamento de erros |
| **Teste** | 20-30 min | Fazer upload de PDF teste, validar resultado, criar dashboard |
| **Apresentação** | 10-15 min | Demonstrar fluxo funcional + responder perguntas |
| **TOTAL** | ~90-120 min | MVP funcional e apresentável |

---

## Estrutura do Laboratório

### Fase 1: Preparação (15-20 min)
1. Abrir console AWS.
2. Criar tabela **DynamoDB** (`sinistros_resultados`).
3. Criar bucket **S3** (`sinistro-docs-<seu-nome>-2026`).
4. Criar função **Lambda** (`analisar-sinistro-agente`).
5. Configurar variáveis de ambiente e permissões IAM.

**Suporte**: mentores verificarão cada etapa.

### Fase 2: Desenvolvimento (40-50 min)
1. Abrir editor inline da Lambda no console AWS.
2. Copiar código-template (fornecido no repositório).
3. Colar no editor da Lambda.
4. Configurar variáveis de ambiente (nomes de tabela, bucket S3).
5. Testar função no console AWS ("Test" button).

**Suporte**: mentores fornecerão o código-template e ajudarão em erros.

### Fase 3: Integração e Teste (20-30 min)
1. Criar **API Gateway** com rota POST (no console AWS).
2. Copiar URL da API.
3. Usar **Postman** (web ou desktop) para testar a API.
4. Fazer upload de PDF de teste via Postman.
5. Validar resultado no **DynamoDB** (console AWS → visualizar tabela).
6. Conferir logs no **CloudWatch** (console AWS → visualizar execuções).

**Suporte**: mentores mostrarão exatamente onde clicar em cada etapa.

### Fase 4: Apresentação (10-15 min)
1. Demonstrar fluxo funcional: PDF → Resultado em JSON.
2. Mostrar registro no DynamoDB.
3. Responder perguntas da banca.

---

## O que Você Entrega

### Entregável Mínimo (MVP)
-  Função Lambda funcional que processa dados.
-  API Gateway ativa com rota POST.
-  Resultado estruturado armazenado em DynamoDB.
-  Código documentado com comentários.
-  Vídeo curto de demonstração (~2 min do fluxo completo).

### Entregável Expandido (Opcional)
-  Endpoint de consulta de casos.
-  Saída em JSON ou Excel.
-  Dashboard básico com métricas.
-  Plano de evolução futura.

---

## Restrições e Limitações

### Dentro do Free Tier
-  **Lambda**: 1 milhão de invocações/mês (mais que suficiente para testes).
-  **S3**: 5 GB de armazenamento.
-  **DynamoDB**: 25 GB de dados.
-  **API Gateway**: 1 milhão de requisições/mês.
-  **CloudWatch**: logs gratuitos para os primeiros 5GB/mês.

### Não Incluso (neste MVP)
-  Interface web/frontend (foco é backend + API).
-  Autenticação de usuários (apenas para prototipagem).
-  Banco de dados secundário ou replicação (simples é melhor).

---

## Dúvidas e Suporte

### Antes do Laboratório
-  Verificar se a conta AWS está ativa.
-  Confirmar acesso ao console AWS (https://console.aws.amazon.com).
-  Nenhuma instalação necessária.

### Durante o Laboratório
-  Chamar um mentor a qualquer momento — eles orientarão cada passo.
-  Usar o chat/Discord do hackathon para dúvidas rápidas.
-  Tirar screenshots de erros para referência.
-  Mentores farão junto com você — aprendizado prático e hands-on.

### Após o Laboratório
-  Documentação será disponibilizada.
-  Código-template fica no repositório.
-  Suporte continuará via mentores até o final do evento.

---

## Próximos Passos

1.  Confirmar que você tem uma **conta AWS** ativa.
2.  Abrir https://console.aws.amazon.com no navegador.
3.  **Nada mais para instalar** — tudo é feito no console.
4.  Preparar um **PDF de teste** (ex: boletim de ocorrência modelo ou documento simples).
5.  Avisar ao mentor que está pronto para começar.

**Tempo estimado para verificação**: 2-3 minutos.

---

**Bem-vindo ao laboratório! Vamos construir algo incrível juntos! **
