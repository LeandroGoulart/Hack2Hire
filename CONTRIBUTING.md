# Padrao de Contribuicao - DocuSmart Seguros

## Objetivo

Este documento define como organizar commits e evolucoes do projeto. O objetivo e manter um historico claro, facil de revisar e util para entender quando cada funcionalidade foi criada ou alterada.

---

## Regra Principal

Cada commit deve representar uma alteracao significativa e completa.

Um commit significativo pode ser:

- separacao ou criacao de um ambiente;
- criacao de uma funcionalidade;
- alteracao de um fluxo de negocio;
- reorganizacao estrutural;
- correcao de um comportamento;
- criacao ou revisao relevante de documentacao;
- configuracao de infraestrutura ou seguranca.

Evite criar commits para:

- ajuste isolado de espaco ou quebra de linha;
- troca de uma palavra sem impacto relevante;
- tentativa incompleta;
- arquivo temporario;
- correcao que ainda depende de outra mudanca para funcionar.

Pequenos ajustes relacionados devem ser agrupados no commit da funcionalidade correspondente.

---

## Formato

Use o formato:

```text
tipo(escopo): descricao objetiva
```

Exemplo:

```text
feat(client): cria ambiente independente do cliente
```

### Tipos permitidos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade ou novo modulo. |
| `fix` | Correcao de erro ou comportamento incorreto. |
| `refactor` | Reorganizacao sem alterar a finalidade da funcionalidade. |
| `docs` | Criacao ou atualizacao significativa de documentacao. |
| `style` | Alteracao visual relevante de interface. |
| `test` | Criacao ou alteracao de testes. |
| `chore` | Configuracao, organizacao ou manutencao do repositorio. |
| `build` | Dependencias, empacotamento ou processo de build. |
| `ci` | Pipeline, automacao e integracao continua. |
| `perf` | Melhoria de desempenho. |
| `security` | Permissoes, protecao de dados ou seguranca. |

### Escopos recomendados

| Escopo | Area |
|---|---|
| `client` | Ambiente e funcionalidades do cliente. |
| `analyst` | Dashboard e ferramentas do analista. |
| `doc-upload` | Upload, simulacao e analise documental. |
| `architecture` | Tela e documentacao de arquitetura. |
| `frontend` | Componentes compartilhados do frontend. |
| `backend` | Lambda e processamento backend. |
| `docs` | Documentos uteis e README. |
| `repo` | Estrutura, Git e arquivos de configuracao. |
| `infra` | Recursos e configuracoes AWS. |

---

## Exemplos

### Separacao de ambientes

```text
refactor(frontend): separa ambientes de cliente e analista
```

### Criacao de documentos

```text
docs(docs): adiciona arquitetura e requisitos gerais do projeto
```

### Nova funcionalidade

```text
feat(doc-upload): adiciona analise em lote e panorama geral
```

### Correcao

```text
fix(doc-upload): limpa documentos e selecoes ao reiniciar tela
```

### Seguranca

```text
security(repo): impede envio de configuracoes locais ao GitHub
```

### Estrutura futura

```text
chore(frontend): reserva entrada principal para pagina comercial
```

---

## Quando Separar Commits

Separe em commits diferentes quando as alteracoes:

1. Podem ser entendidas ou revertidas de forma independente.
2. Pertencem a areas diferentes do sistema.
3. Criam funcionalidades distintas.
4. Misturam codigo e uma grande revisao documental.
5. Alteram infraestrutura ou seguranca junto com interface.

Exemplo correto:

```text
refactor(frontend): separa ambientes de cliente e analista
feat(doc-upload): adiciona analise em lote e panorama geral
docs(docs): atualiza caminhos e estrutura do frontend
```

Evite:

```text
update geral
ajustes
mudancas frontend
teste novo
```

---

## Quando Agrupar

Agrupe no mesmo commit quando:

- HTML, CSS e JavaScript fazem parte da mesma funcionalidade;
- a documentacao alterada apenas explica a funcionalidade do commit;
- varios pequenos ajustes sao necessarios para concluir um unico fluxo;
- os arquivos nao funcionariam corretamente se separados.

Exemplo:

```text
feat(client): cria consulta de protocolo no ambiente do cliente
```

Esse commit pode conter:

- `client.html`;
- `client.css`;
- `client.js`;
- uma pequena atualizacao no README sobre como acessar a tela.

---

## Descricao Estendida

Use uma descricao estendida quando o titulo nao for suficiente:

```text
feat(doc-upload): adiciona analise em lote e panorama geral

- analisa todos os documentos quando nao ha selecao
- analisa somente documentos marcados quando houver selecao
- exibe totais, valores e tipos identificados
```

Nao e necessario adicionar corpo para mudancas simples e evidentes.

---

## Fluxo Recomendado

Antes de cada commit:

```bash
git status
git diff
```

Adicione somente os arquivos relacionados:

```bash
git add caminho/do/arquivo
```

Confira o que sera commitado:

```bash
git diff --cached
```

Crie o commit:

```bash
git commit -m "tipo(escopo): descricao objetiva"
```

Depois publique a branch:

```bash
git push
```

---

## Planejamento dos Commits Atuais

As alteracoes atuais devem ser organizadas aproximadamente assim:

### 1. Separacao estrutural

```text
refactor(frontend): separa ambientes de cliente e analista
```

Inclui:

- criacao de `Frontend/client`;
- criacao de `Frontend/analyst`;
- remocao das copias antigas em `Frontend/src`;
- fragmentacao do modulo de upload em `docUpload`;
- padronizacao de `architecture.html`;
- reserva de `Frontend/index.html`.

### 2. Funcionalidade de analise

```text
feat(doc-upload): adiciona simulacao, analise em lote e panorama
```

Inclui:

- carregamento de documentos pelo botao Simular;
- limpeza total da area de documentos;
- analise de todos ou dos selecionados;
- panorama geral da analise.

### 3. Ambiente do cliente

```text
feat(client): cria base independente para o ambiente do cliente
```

Inclui:

- `client.html`;
- `client.css`;
- `client.js`;
- copia inicial do fluxo documental para evolucao separada.

### 4. Documentacao

```text
docs(frontend): atualiza estrutura e caminhos dos ambientes
```

Inclui:

- `README.md`;
- `Frontend/README.md`;
- instrucoes de acesso aos modulos.

---

## Convencao de Idioma

- Titulos dos commits em portugues.
- Termos tecnicos podem permanecer em ingles.
- Use verbos no presente: `cria`, `adiciona`, `corrige`, `separa`, `atualiza`.
- Nao finalize o titulo com ponto.
- Mantenha o titulo curto e objetivo.
