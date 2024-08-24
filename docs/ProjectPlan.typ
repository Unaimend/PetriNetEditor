#import "@preview/ctheorems:1.1.2": *
#import "@preview/dashy-todo:0.0.1": *

#import "@preview/fletcher:0.4.2" as fletcher: edge
#import "@local/petri:0.1.0": *

#import "@preview/dashy-todo:0.0.1": todo
#show: thmrules.with(qed-symbol: $square$)

#let definition = thmbox("definition", "Definition", inset: (x: 1.2em, top: 1em))

#let example = thmplain("example", "Example")

#set page (
  numbering: "1/1"
)

#let bar = (body) => context {
  [#box(
  height: 1pt,
  width: measure(body).width,
  fill: black,)]
  [#body ]
  [#box(
  height: 1pt,
  width: measure(body).width,
  fill: black,)]
}

// Example usage of the bar function


#align(center, text(27pt)[
  #bar[*Petri Nets in Metabolic Modelling*]
  #align(center, text(17pt)[
    Research Progress
  ])
])


//#align(center, text(27pt)[
//  #figure(
//    //image("pics/mdn.jpg", width: 80%)
//  )
//])

#pagebreak()

#set heading(numbering: "1.")

= Definitions
Definitions marked with a \* were adopted from @survey
#definition("Petri Net*")[
A (finite marked) _Petri Net_ is a tuple $N = (P, T, W, M_0)$ where
 $P$ is the set of _places_, $P = {p_0, dots, p_n}$.

 $T$ is the set of _transitions_, $T = {t_1, dots, t_m}$.

 $W$: $((P times T) union (T times P)) arrow.r.long NN$ is the _weight function_.
 when $W(x,y)$ = k, with $k gt 0$, then net includes an _arc_ from $x$ to $y$ with weight $k$.
 
 $M_0$ is an $n$-dimensional vector of non-negative integers which represents the _initial marking_ of the net.
]
#example("Petri Net Example")[
  #align(center)[
#fletcher.diagram(
  node-stroke: 0.5pt,

  t((0,1), $T_1$, fill: black),
  edge("-|>", text("2")),
  p((1,1), $P_1$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 0),
  t((2,0), $T_2$, fill: black),
  t((2,2), $T_5$, fill: black),
  p((3,1), $P_2$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 0),
  t((4,0), $T_4$, fill: black),
  t((5,1), $T_3$, fill: black),
  p((6,0), $P_3$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  p((6,2), $P_4$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  p((3,3), $P_5$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  t((5,3), $T_6$, fill: black),


  edge((1,1), (2,0), "-|>"),
  edge((2,2), (1,1), "-|>"),
  edge((2,0), (3,1), "-|>", 2),
  edge((3,1), (5,1), "-|>", 3),
  edge((4,0), (3,1), "-|>", 2),
  edge((3,1), (2,2), "-|>"),
  edge((6,0), (4,0), "-|>"),
  edge((5,1), (6,0), "-|>"),
  edge((5,1), (6,2), "-|>"),
  edge((2,2), (3,3), "-|>"),
  edge((3,3), (5,3), "-|>", 2),
)]] <cool_example>

#definition("Place*")[
Let $N = (P, T, W, M_0)$ be a Petri Net. 
We call an element $p in P$ a place.
It is represented as a circle in their respective graphical drawing. Due to the biological context of this document we will use metabolite and place interchangeably.
]

#definition("Transition*")[
Let $N = (P, T, W, M_0)$ be a Petri Net. 
We call an element $t in T$ a transition.
It is represented as a rectangle in their respective graphical drawing. Due to the biological context of this document we will use reaction and place interchangeably. 
]


#definition("Arc*")[
Let $N = (P, T, W, M_0)$ be a Petri Net. 
We call an element $a in ((P times T) union (T times P))$  an arc.
It is represented as an arrow in their respective graphical drawing.
]


#definition("Marking*")[
 Let  $N = (P, T, W, M_0)$ be a finite marked petri net with $|P| = n in N$.
 A vector $M = (m_1, dots, m_n) in ZZ^n_(gt.eq 0)$ is called a _marking_. 
A _marking_ M is graphically represented by inserting in each place $p_i$ a corresponding number $m_i$. This number is called the _tokens_ of $p_i$. Sometimes we represent this number as small circles in the place.
We call a marking $M'=(m'_1,dots, m'_n)$ a _cover_ of $M$ if $m_i lt.eq m'_i$ for $i in {1, dots, n}$.
In this case we write $M lt.eq M'$. In the biological context this describes the amount of $m_i$ of specific molecule $p_i$. We will sometimes not draw this information.
]


#definition("Precondition/input bag*")[
Let  $N = (P, T, W, M_0)$ be a finite marked petri net, $t in T$ a transition. The _precondition_  of the transition $t$ is denoted by $t^- = {i_1, dots, i_n} in ZZ^n_(gt.eq 0)$ where $i_j = W(p_j, t)$  for any $j in {1, dots, n}$.
]

#definition("Post-condition/output bag")[
Let  $N = (P, T, W, M_0)$ be a finite marked petri net, $t in T$ a transition.
The _post-condition_  of the transition $t$ is denoted by $t^+ = {o_1, dots, o_n} in ZZ^n_(gt.eq 0)$ where $o_j = W(t, p_j)$  for any $j in {1, dots, n}$.
]

Intuitively, $t^−$ indicates, for every place of the net, the number of tokens needed to enable transition $t$. The _firing_ of *t* removes such tokens and generates new ones, as indicated by $t^+$.

#definition("Enabled transition, firing*")[
Let $N = (P, T, W, M_0)$ be a Petri Net, $t  in T$ a transition. $t$ is called _enabled_ by the marking $m$ if $t^- lt.eq M$. In this case t can _fire_ and the net marking changes from $M$ to $M'$ as follows $M' = M - t^- + t^+$. We denote  this by $M arrow^t M'$.
]

= Simulation Approaches
Due to the nature of the project and petri nets different approaches can be used to simulate firing.
I have split those into two categories: _local firing approaches_ and _non-local firing_ approaches based on the fact if a transition only needs information about its own places (local) or also information about places from other transitions (non-local). For now we will only discuss local firing approaches. This section is mostly intended as a reference for tried-out approaches and their problems, advantages and disadvantages.

== Mathematical description 
Given a petri net N  = (P, T, W, M_0) we can describe the firing by matrix operations and a control vector $u$ that controls which transitions fire. #todo{what element i u}

#definition("matrix firing")[
  Let $A$ be the incidence matrix from the example given in @cool_example and $u_1$ some control vector. Thus we have 
  #align(center)[
  $A =  mat(
   2&,  0&,  0&,  0&, 0&;
  -1&,  2&,  0&,  0&, 0&;
   0&, -3&,  1&,  1&, 0&;
   0&,  2&, -1&,  0&, 0&;
   1&, -1&,  0&, -1&, 1&;
   0&,  0&,  0&,  0&, 2&
) $, $M_0 = mat( 
  0;
  0;
  1;
  1;
  1;
)$ and $u_1 = mat( 
  1;
  0;
  0;
  0;
  0;
)$]
Thus the first transition fires and we can reach the next state band y following equation $M_1 = M_0 + A^(t)u_1$. In general we can reach the k-th state with regards to some firing sequence $(u_1, u_2, dots u_k)$ by calculating $M_k = M_0 + A^(t)u_k$.

]

== Local firing approaches

==== Synchronous firing
The synchronous firing approach tries to fire all enabled transitions at the same time.
```js
var enabled = findAllActiveReaction()
fire(enabled)
```
  This results in an ordering-problem. The results of some firings will be dependend on the implementation of how the `enabled` list is being filed. Note the #todo{Is this just the inherent non-determinism of petri nets and we SHOULD accept that} following example. 

#example("Synchronous firing")[
  #align(center)[
#fletcher.diagram(
  node-stroke: 0.5pt,

  p((0,0), $P_1$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  p((0,2), $P_2$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  p((0,4), $P_3$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  t((1,1), $T_1$),
  t((1,3), $T_2$),
  p((2,1), $P_4$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),
  p((2,3), $P_5$, fill: teal.lighten(55%), stroke: teal.darken(15%), tokens: 1),


  edge((0,0), (1,1), "-|>"),
  edge((0,2), (1,1), "-|>"),
  edge((0,2), (1,3), "-|>"),
  edge((0,4), (1,3), "-|>"),
  edge((1,1), (2,1), "-|>"),
  edge((1,3), (2,3), "-|>"),
)]] <sync_fire>

Depending on the order in which $t_1$ and $t_2$ are saved in the program, one or the other transition will become _disabled_ after the firing of the other. Thus checking which transitions are _enabled_ before firing them is either impossible or necessitates a more complex resolution step. Thus we will focus on firing approaches that immediately fire transition if enabled.
#todo[Captions]

==== Non-deterministic firing
Non-deterministic firing describes an approach where the order in which transitions fire is different each timestep. It is either possible to permute all enabled transitions and fire them or to just pick a random enabled transition a fire it. When permuting all transitions one could either choose a synchronous approach where a permutation of all enabled transitions fires, this results in the same proble mentioned in the previous section, or one just fires one transition at a time.

==== Concentration Based
Due physical constraints enzymes usually do not go against the concentration gradient. Thus it would make sense to take the amount of tokens of the incoming and outgoing places of a transition into account. This could be done in synchronous or asynchronous manner. The advantage of this is the more realistic representation of biology.




#bibliography("ProjectPlan.bib")
