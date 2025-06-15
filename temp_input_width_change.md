# Como Aumentar a Largura do Campo de Input "Digite sua mensagem..."

## 📍 Localização

**Arquivo:** `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/chat-window.tsx`
**Linha:** 435

## 🔧 Alteração Atual vs Opções

### Estado Atual (linha 435):

```tsx
<div className="mx-auto max-w-3xl">
```

### Opções de Largura:

| Classe       | Largura | Descrição     |
| ------------ | ------- | ------------- |
| `max-w-3xl`  | 768px   | **Atual**     |
| `max-w-4xl`  | 896px   | +128px        |
| `max-w-5xl`  | 1024px  | +256px        |
| `max-w-6xl`  | 1152px  | +384px        |
| `max-w-7xl`  | 1280px  | +512px        |
| `max-w-full` | 100%    | Largura total |

## 🎯 Recomendação: max-w-5xl

### Código para alterar:

```tsx
// ANTES:
<div className="mx-auto max-w-3xl">

// DEPOIS:
<div className="mx-auto max-w-5xl">
```

## 📋 Instruções:

1. Abra o arquivo `chat-window.tsx`
2. Vá para a linha 435
3. Altere `max-w-3xl` para `max-w-5xl`
4. Salve o arquivo

Isso aumentará a largura do campo de input de 768px para 1024px (+256px).
