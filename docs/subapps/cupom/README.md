# Cupom - Documentação

O **Cupom** é o sistema de gestão de cupons e promoções integrado ao Kodix, oferecendo funcionalidades para criação e gerenciamento de descontos.

## 🎫 Sobre o Cupom

O subapp Cupom oferece:

- **Gestão de Cupons**: Criação, edição e desativação de cupons
- **Tipos de Desconto**: Percentual, valor fixo, frete grátis
- **Regras de Aplicação**: Condições e restrições personalizáveis
- **Relatórios**: Acompanhamento de uso e performance

## 🚀 Localização no Código

```
apps/kdx/src/app/[locale]/(authed)/apps/cupom/
```

## 💰 Funcionalidades Principais

### Criação de Cupons

- Códigos personalizáveis ou gerados automaticamente
- Definição de valores e tipos de desconto
- Configuração de validade e limites de uso

### Regras de Negócio

- Valor mínimo de compra
- Produtos ou categorias específicas
- Limite de uso por cliente
- Combinação com outras promoções

### Gestão e Controle

- Status de cupons (ativo, inativo, expirado)
- Histórico de utilizações
- Relatórios de performance
- Notificações de vencimento

### Integração

- Aplicação automática no checkout
- Integração com sistema de e-commerce
- Sincronização com módulos de vendas

## 🔗 Documentação Relacionada

Para desenvolvimento e implementação:

- `docs/development-setup.md` - Configuração do ambiente
- `docs/architecture/coding-standards.md` - Práticas de desenvolvimento
- `docs/architecture/backend-guide.md` - Implementação backend

## 📖 Status da Documentação

Esta seção está preparada para receber documentação específica do Cupom conforme novas funcionalidades forem desenvolvidas ou documentadas.
