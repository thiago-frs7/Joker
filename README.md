> **Dois apps moram neste repositório.**
> [`almas/`](almas/README.md) é a versão atual — React + Vite + TypeScript + Dexie, PWA offline,
> reescrita do zero a partir de uma especificação nova (vocabulário de Almas/camadas, Núcleo,
> Grimório, Ascensão e Troféus). [`app/`](app/README.md) é o ÂMBAR, o protótipo anterior sem build
> nem dependências, documentado abaixo e mantido intacto para consulta.

---

# ÂMBAR — o códice das coisas vivas

> Um RPG da vida real para cérebros que buscam dopamina.
> Nada que você conquistou pode ser tirado de você.

**Conceito 2.0** derivado das mecânicas de um app de gamificação pessoal (nível/XP, missões,
hábitos, grimório de mídias, relíquias 3D, sala de troféus), reinterpretado do zero para
neurodivergência — TDAH como premissa de design, não como "modo acessível".

---

## A metáfora única

Uma árvore produz **Seiva**. A seiva escorre e se perde — a menos que endureça.
Quando endurece, vira **Âmbar**: permanente, incorruptível, com coisas vivas presas dentro.

| Elemento | No app | Papel |
|---|---|---|
| 🩸 **Seiva** | moeda gastável | você investe para crescer |
| 🟡 **Âmbar** | registro permanente | define sua **Camada** (nível). Nunca diminui |
| 🌿 **Ramos** | atributos como árvore de talentos | Corpo, Mente, Ofício, Vínculo, Cultura, Ordem |
| 🫥 **Silhueta** | classe emergente | a forma que sua copa projeta — revelada, não escolhida |
| 🪲 **Inclusões** | colecionáveis 3D vivos | criaturas em âmbar que despertam com seu progresso |
| 🍃 **Herbário** | tracker de mídias | tudo que você consumiu, prensado em folhas |
| 🌱 **Enxertos** | síntese cultural | conectar duas obras gera bônus real de Ramo |
| 🪨 **Fósseis** | troféus | impressões permanentes, incluindo as ocultas |
| 🏛️ **Estufa** | santuário 2.5D | onde suas Inclusões vivem |
| ✂️ **Poda** | New Game+ | reformata a árvore, mantém a Camada |

---

## O app

Existe e roda. Local-first, offline, sem build, sem dependências.

```bash
open app/index.html                              # ou
cd app && node build.js && open dist/ambar.html  # arquivo único, 133 KB
```

Detalhes em [`app/README.md`](app/README.md) — inclusive o que ainda **não** está implementado.

## Documentos

| # | Entregável | Arquivo |
|---|---|---|
| 1 | Visão geral, nome e lore | [`docs/1-visao-e-lore.md`](docs/1-visao-e-lore.md) |
| 2 | Arquitetura das mecânicas | [`docs/2-arquitetura-das-mecanicas.md`](docs/2-arquitetura-das-mecanicas.md) |
| 3 | As 5 telas principais | [`docs/3-telas.md`](docs/3-telas.md) |
| 4 | Progressão e fórmulas | [`docs/4-progressao-matematica.md`](docs/4-progressao-matematica.md) |
| 5 | Mapeamento de APIs e importação | [`docs/5-apis-e-importacao.md`](docs/5-apis-e-importacao.md) |
| 6 | Checklist de acessibilidade TDAH | [`docs/6-checklist-tdah.md`](docs/6-checklist-tdah.md) |
| 7 | Os 3 diferenciais matadores | [`docs/7-diferenciais.md`](docs/7-diferenciais.md) |

## As três regras que não se negociam

1. **Nada é retirado.** Sem perda de nível, sem XP negativo, sem streak zerado. A ausência de
   punição é estrutural (duas moedas separadas), não uma configuração que se pode desligar.
2. **Dois toques, no máximo.** Registrar qualquer coisa — obra, hábito, sessão de foco —
   custa no máximo dois toques e zero digitação obrigatória além do nome.
3. **Nenhum número decorativo.** Toda métrica na tela aponta para uma ação real que você fez.
