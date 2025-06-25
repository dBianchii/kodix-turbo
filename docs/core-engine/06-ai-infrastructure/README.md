# 6. Infraestrutura de IA

Esta área do Core Engine centraliza todas as capacidades de Inteligência Artificial da plataforma, fornecendo-as como um serviço para outros SubApps.

## Funcionalidades Chave

- Gerenciamento centralizado de provedores de IA (OpenAI, Anthropic, etc.).
- Gerenciamento de modelos de linguagem (LLMs) e sua disponibilidade para cada time.
- Armazenamento seguro e criptografado de chaves de API.
- Fornece uma camada de serviço (`AiStudioService`) para que SubApps como o Chat possam consumir essas capacidades de forma segura e padronizada.

**Nota:** Embora seja uma parte do Core Engine, a implementação principal desta área está contida no **[AI Studio SubApp](../../subapps/ai-studio/README.md)**.
