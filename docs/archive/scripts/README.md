# Documentação dos Scripts de Gerenciamento do Ambiente

Esta pasta contém a documentação para os scripts utilitários localizados na pasta `/scripts` do projeto.

---

## Visão Geral

Para simplificar e automatizar o gerenciamento do ambiente de desenvolvimento, foram criados quatro scripts principais. Eles trabalham em conjunto para iniciar, parar e verificar o status do servidor de forma robusta e eficiente.

A utilização desses scripts através do `sh ./scripts/<nome_do_script>.sh` foi adicionada à lista de aprovação automática do Cursor para permitir uma operação ágil e sem interrupções.

---

### 1. `start-dev-bg.sh`

**Propósito:** Iniciar o ambiente de desenvolvimento completo em segundo plano.

- **O que faz:** Executa o comando `pnpm dev:kdx`, que utiliza o Turborepo para orquestrar a inicialização de todos os serviços necessários (Next.js, Drizzle Studio, Docker, etc.).
- **Modo de Operação:**
  - Redireciona toda a saída (logs e erros) para um arquivo `dev.log` na raiz do projeto. Isso permite a depuração sem bloquear o terminal.
  - O `&` no final do comando o envia para o segundo plano (`background`), liberando o terminal imediatamente.

**Uso:**

```bash
sh ./scripts/start-dev-bg.sh
```

---

### 2. `stop-dev.sh`

**Propósito:** Parar o ambiente de desenvolvimento de forma forçada e garantida.

- **O que faz:** Encontra e encerra quaisquer processos que estejam ocupando as portas principais do ambiente (`3000` para o Next.js e `4983` para o Drizzle Studio).
- **Modo de Operação:**
  - Utiliza `kill -9` (`SIGKILL`), um sinal de terminação que não pode ser ignorado, para garantir que até mesmo processos "zumbi" ou presos sejam encerrados.
  - `2>/dev/null || true` garante que o script não retorne um erro caso nenhuma processo seja encontrado em uma das portas.

**Uso:**

```bash
sh ./scripts/stop-dev.sh
```

---

### 3. `check-dev-status.sh`

**Propósito:** Verificar de forma "inteligente" se o servidor está pronto para receber conexões.

- **O que faz:** Executa um loop que chama repetidamente o script `check-server-simple.sh` até que o status do servidor seja `RUNNING`.
- **Modo de Operação:**
  - Mostra a mensagem "Aguardando o servidor ficar RUNNING..." a cada 2 segundos enquanto o servidor não está pronto.
  - Assim que o servidor responde corretamente, ele exibe a confirmação e finaliza.
  - Este script é o "gerente" que utiliza o `check-server-simple.sh` como "trabalhador".

**Uso:**

```bash
sh ./scripts/check-dev-status.sh
```

---

### 4. `check-server-simple.sh`

**Propósito:** Fazer uma verificação única, rápida e atômica do estado do servidor.

- **O que faz:** Verifica a porta `3000` e retorna um dos três estados possíveis:
  - **`RUNNING`:** Se a porta está ocupada e o servidor responde a uma requisição `curl` com o código HTTP 200.
  - **`PORT_OCCUPIED`:** Se a porta está ocupada, mas o servidor não responde corretamente (indicando um estado instável ou "zumbi").
  - **`STOPPED`:** Se a porta não está em uso.
- **Modo de Operação:**
  - O `curl` possui um `timeout` de 2 segundos para não travar caso o servidor esteja instável.
  - É a ferramenta de diagnóstico fundamental usada pelo `check-dev-status.sh`.

**Uso:**

```bash
sh ./scripts/check-server-simple.sh
```

---

### 5. `check-log-errors.sh`

**Propósito:** Verificar rapidamente se ocorreram erros nos logs de desenvolvimento.

- **O que faz:** Executa `tail` para obter as últimas 200 linhas do `dev.log` e usa `grep` para filtrar apenas as linhas que contêm "error", "Error", "ERROR", "failed", "Failed", ou "FAILED".
- **Modo de Operação:**
  - `|| true` é usado para garantir que o script termine com um código de sucesso (0), mesmo que o `grep` não encontre nenhum erro. Isso evita que o fluxo de automação seja interrompido por um "não-erro".
  - É a forma mais rápida de diagnosticar problemas de compilação ou execução após reiniciar o servidor.

**Uso:**

```bash
sh ./scripts/check-log-errors.sh
```

---

## ⚠️ Regras de Uso e Boas Práticas

### **NÃO Encadear `sleep` com Scripts Aprovados**

Para garantir que o fluxo de trabalho com o assistente de IA (Cursor) seja eficiente, é crucial **não encadear** comandos de espera como o `sleep` com os scripts de gerenciamento que já estão na lista de aprovação automática.

- **❌ Incorreto:** `sleep 5 && sh ./scripts/check-dev-status.sh`

  - **Motivo:** O comando combinado não está na lista de aprovação, exigindo uma intervenção manual do usuário e quebrando o fluxo de automação.

- **✅ Correto:**
  1. Executar `sleep 5` em um passo.
  2. Executar `sh ./scripts/check-dev-status.sh` em um passo separado.

Esta prática garante que cada comando aprovado possa ser executado de forma independente e sem interrupções.
