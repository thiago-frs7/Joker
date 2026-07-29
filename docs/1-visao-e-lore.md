# 1. Visão geral do conceito

## Nome do sistema

# ÂMBAR
### *o códice das coisas vivas*

O usuário é um **Ambarista**. Não um herói, não um aventureiro — um artesão de resina.

## Lore (o mito de fundação)

> Houve um tempo em que o mundo lembrava de tudo.
>
> Depois o mundo aprendeu a esquecer, e passou a esquecer bem demais. Os dias começaram a
> escorrer uns dentro dos outros até que ninguém mais soubesse dizer o que tinha feito, o que
> tinha lido, quem tinha se tornado.
>
> Só uma coisa resistiu: a **resina**.
>
> A resina é o que a árvore faz quando é ferida. Ela escorre devagar, cobre o corte, e endurece.
> E o que estava ali no momento em que ela endureceu — uma formiga, uma pena, uma semente, uma
> gota de chuva de sessenta milhões de anos atrás — fica. Intacto. Visível. Para sempre.
>
> **Ambaristas** são as pessoas que descobriram que a própria vida escorre igual.
>
> Cada coisa que você faz de verdade libera uma gota de **Seiva**. A Seiva é bonita e é volátil:
> some se ninguém a fixa. Mas quando você registra o que fez, ela endurece em **Âmbar** — e a
> partir daí nenhuma recaída, nenhuma semana perdida, nenhum mês ruim consegue tirá-la de você.
>
> Sua vida não é uma barra que sobe e desce. É um **estrato**: camada sobre camada de âmbar,
> e dentro de cada camada, presas e vivas, as coisas que você foi.

## Por que essa lore, e não outra

Cada peça do mito resolve um problema concreto de TDAH:

| Peça da lore | Problema de TDAH que resolve |
|---|---|
| Âmbar não pode ser retirado | **vergonha de recaída** — a maior causa de abandono de apps de hábito |
| A resina brota de uma **ferida** | reenquadra o dia difícil: o esforço vem justamente do que doeu |
| A Seiva **se perde se não for fixada** | dá urgência ao registro sem punir o esquecimento (a Seiva não registrada nunca existiu — não há dívida) |
| Camadas, não uma barra única | progresso **acumulativo e visível**, imune a comparação com o "eu ideal" |
| Coisas vivas presas dentro | dá corpo e cara às conquistas — memória episódica externalizada |
| A árvore é **uma só**, com Ramos | reforça que ler, treinar e trabalhar alimentam o mesmo organismo |
| **Poda** em vez de reset | mudar de rumo é jardinagem, não fracasso |

## Identidade visual: uma só

**"Herbário Vitoriano em Luz Baixa"** — manuscrito iluminado encontrando gabinete de
curiosidades. Escolhida e mantida; nada de mistura de estilos.

**Paleta**
```
Fundo         #100D0A  casca queimada, quase preto, quente (nunca azul-frio)
Superfície    #1B1611  papel velho na sombra
Traço         #3A2F23  bico de pena seco
Seiva         #E8A33D  âmbar líquido — a única cor que se move
Âmbar fixo    #C97B21  resina endurecida
Prisma        #7FD4C1  verde-vidro, reservado ao raríssimo
Texto         #EFE6D6  marfim
```

**Regras de estilo**
- **Uma cor viva por tela.** Âmbar é a única cor saturada. Tudo o mais é papel, tinta e sombra.
- **Tipografia:** serifa de manuscrito (títulos, números grandes) + sans humanista (UI). Duas
  famílias, quatro pesos, nunca mais.
- **Textura:** grão de papel a 4% de opacidade, vinheta suave. Sem glassmorphism, sem neon.
- **Ilustração:** gravura em linha (estilo prancha botânica) para Folhas, Fósseis e Nós.
- **3D:** as Inclusões são o único elemento tridimensional do app. Blocos de resina translúcida
  com uma criatura suspensa dentro, iluminação de vela, rotação por arraste.
- **Movimento:** tudo que se move, se move como líquido viscoso — `cubic-bezier(.22,.61,.36,1)`.
  Nada pisca. Nada quica.
- **Modo claro** existe e é papel-de-carta real (#F4EDE0), não uma inversão automática.

## Posicionamento em uma frase

> Todo app de produtividade te cobra pelos dias que você perdeu.
> **ÂMBAR só sabe contar o que você fez.**
