# DGM-MAT-Mobile

## Papel

O DGM-MAT-Mobile é o cockpit remoto do DGM-MAT. Não é um cérebro separado.

O objetivo é proporcionar no telemóvel uma experiência de conversa contínua, semelhante à superfície de chat do ChatGPT:

- histórico de conversas;
- uma thread contínua por assunto;
- criar nova conversa;
- renomear conversa;
- contexto de projeto/repositório;
- indicador de ligação ao PC;
- compreensão inicial da intenção;
- mensagens pendentes quando o PC está offline;
- sincronização automática quando a ligação regressa;
- PWA instalável;
- operação leve no telemóvel.

## Arquitetura

TELEMÓVEL -> PWA -> VERCEL DISCOVERY -> TAILSCALE -> DGM-MAT PC

O PC é a autoridade de execução e a fonte de verdade das threads.

A Vercel serve apenas como control-plane/rendezvous para descobrir o PC ativo. Não recebe o conteúdo normal das conversas.

O histórico durável fica no runtime do DGM-MAT em:

C:\ProgramasGodMode\DGM-MAT\storage\runtime\sessions\mobile_conversations.json

## PC fraco / PC futuro

O cockpit não depende de LLM local.

No PC atual:

- 2 CPUs lógicas;
- ~3 GB RAM;
- Ollama instalado;
- modelos locais instalados, incluindo Qwen 1.5B, Qwen Coder 1.5B, DeepSeek-R1 1.5B, Llama 1B/3B e Gemma 2B;
- os modelos não são carregados automaticamente quando a RAM disponível é insuficiente.

No futuro PC com mais RAM, o DGM-MAT pode voltar a ativar o Ollama e selecionar automaticamente o melhor modelo.

## Tailscale

O PC atual anuncia:

https://pc-vazao-anjos.taild7e42f.ts.net

O acesso HTTPS através de Tailscale Serve ainda requer uma autorização única do administrador do tailnet. Até essa autorização, o cockpit mantém o modo offline/local cache.

## Fonte de verdade

- Execução: DGM-MAT no PC
- Memória persistente: AndreOS/andreos-memory
- Descoberta de nós: DGM-MAT-Deploy/Vercel
- Transporte privado: Tailscale
- UI móvel: este repositório
- LLM local: Ollama, opcional e condicionado aos recursos reais

## Desenvolvimento

A UI é vanilla HTML/CSS/JavaScript para minimizar dependências e consumo no PC antigo.

A versão publicada pode ser ligada à Vercel através do repositório GitHub. Quando o PC está acessível pelo Tailscale, o PWA descobre automaticamente o endpoint DGM-MAT.
