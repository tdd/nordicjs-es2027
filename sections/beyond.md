---
layout: cover
background: /covers/jan-tinneberg-tVIv23vcuz4-unsplash.jpg
---

# ES2027 and beyond

---

# ES2027? Shadow Realms <span class="stage">stage "2.7"</span>

This provides the building blocks for having full control of **sandboxed JS evaluation** (among other things, you can customize available globals and standard library elements).

This is a **godsend** for web-based IDEs, DOM virtualisation, test frameworks, server-side rendering, secure end-user scripts, and more!

```js
const realm = new ShadowRealm()

const process = await realm.importValue('./utils/processor.js', 'process')
const processedData = process(data)

// True isolation!
globalThis.userLocation = 'Freiburg'
realm.evaluate('globalThis.userLocation = "Paris"')
globalThis.userLocation // => 'Freiburg'
```

Check out [this explainer](https://github.com/tc39/proposal-shadowrealm/blob/main/explainer.md) for full details.

---

# ES2027? Joint iteration <span class="stage">stage 2.7</span>

Advancing multiple iterators in lockstep, much like Ruby's or Lodash's `zip`. Default mode stops at shortest, but there is a `'longest'` mode (with optional `padding`) and a `'strict'` mode (matching sizes required).

```js
const codes = [400, 401]
const statuses = ['Bad request', 'Unauthorized']

Array.from(Iterator.zip([codes, statuses]))
// => [ [400, 'Bad request'], [401, 'Unauthorized'] ]

Array.from(Iterator.zipKeyed({ code: codes, status: statuses }))
// => [ { code: 400, status: 'Bad request' }, { code: 401, status: 'Unauthorized' } ]

Array.from(Iterator.zipKeyed(
  { code: [...codes, 403], status: statuses },
  { mode: 'longest', padding: { status: '???' } }
))
// => [ { code: 400, status: 'Bad request' }, ..., { code: 403, status: '???' } ]
```

There's a stage-1 proposal to expose this also as statics on `Array`, for convenience.

<!--

# "Thread vars" with `AsyncContext` <span class="stage">stage 2</span>

Reliable, collision-free references across the lifespan of async workflows (think `node:async_hooks`).

FIXME: Hard to create a slide-size, grokkable, non-convoluted example :(

-->

---

# ES2027? `Iterator.range` 🤩 <span class="stage">stage 2</span>

Finally an arithmetic sequence generator!  Coupled with iterator helpers, it's just too good…

```js
Iterator.range(0, 5).toArray()
// => [0, 1, 2, 3, 4]

Iterator.range(1, 10, 2).toArray()
// => [1, 3, 5, 7, 9]

Iterator.range(1, 7, { step: 3, inclusive: true })
  .map((n) => '*'.repeat(n))
  .toArray()
// => ['*', '****', '*******']
```

Go have fun in the [playground!](https://tc39.es/proposal-iterator.range/playground.html)

---

# ES2027? Iterator chunking <span class="stage">stage 2.7</span>

**Chunking**: max-size consecutive views (pagination, repeating layouts, stream processing, bucketing…)

```js
const prodIds = [0, 1, 2, 3, 4, 5]
const productRows = (rowSize: number) => Array.from(prodIds.values().chunks(rowSize))

productRows(2) // => [ [0, 1], [2, 3], [4, 5] ]
productRows(3) // => [ [0, 1, 2], [3, 4, 5] ]
productRows(5) // => [ [0, 1, 2, 3], [4, 5] ]
```

**Windowing**: max-size *sliding* views (running averages, pairwise comparisons, carousels…)


```js
const thumbIds = [0, 1, 2, 3, 4, 5, 6, 7]
const carouselWindows = (winSize: number) => Array.from(thumbIds.values().windows(winSize))

carouselWindows(2) // => [ [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7] ]
carouselWindows(3) // => [ [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7] ]
carouselWindows(4) // => [ [0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7] ]
```

---

# ES2027? import bytes <span class="stage">stage 2.7</span>

Import arbitrary assets natively, as bytes (`Uint8Array`).

```js
import icon from './icon.png' with { type: 'bytes' }

// or, dynamically:
const icon = await import('./icon.png', { with: { type: 'bytes' } })
```

---

# ES2027? Seeded PRNG <span class="stage">stage 2</span>

All standard-library random number generators (`Math.random()`, `crypto.getRandomValues()`, etc.) are automatically seeded: there is no reliable way of generating the same sequence from one run to the next. Tools that offer custom seeding for replayability (e.g. Jest, Vitest) use custom PRNGs to achieve this.

This provides a `Random.Seeded` class that can work in simple (8-bit unsigned int as `number`) or full-entropy modes, depending on your needs (simple or cryptographically secure). Instances have a `random()` method isomorphic to `Math.random()`.

```js
const seed = cli.get('--seed', { default: Math.trunc(Math.random() * 1000) })
const prng = Random.fromFixed(seed)

prng.random() // => number

// Get state to persist it (Uint8Array)
const state = prng.getState()

// Reset instance on state
prng.setState(state)
// or restore a fresh instance from state
const prng = Random.fromState(state)
```

---

# Composite keys and values <span class="stage">stage 1</span>

You know how `Map` keys and `Set` / `Array` values are compared using *SameValueZero*, and that doesn't let you use objects there

Check out this proposal:

```js
const pointA = Composite({ x: 1, y: 4 })
const pointB = Composite({ x: 1, y: 4 })
Composite.equal(pointA, pointB); // => true

new Set([pointA]).has(pointB) // => true
new Map([[pointA, 'Yes!']]).get(pointB) // => 'Yes!'
[pointA].includes(pointB) // => true
[pointA].indexOf(pointB) // => 0
```

---

# Object's property count <span class="stage">stage 1</span>

ZOMG, **finally!**  Don't you just hate having to build a full-fledged key set just to verify that an object is empty?  Of course, this native property would be **a lot more performant than that!**

```js
const conf = {
  name: 'Nordic.js', year: 2025, city: 'Stockholm',
  [Symbol.toStringTag]: () => '🇸🇪 🏣 🥰'
}
Object.defineProperty(conf, 'secret', { value: true })

Object.propertyCount({}) // => 0
Object.propertyCount(conf) // => 3
Object.propertyCount(conf, { keyTypes: ['all'] }) // => 4 (adds the symbol)
Object.propertyCount(conf, { keyTypes: ['all'], enumerable: 'all' }) // => 5 (also adds the secret)
```

---

# `await` dictionary <span class="stage">stage 1</span>

Because `const [x, y, z] = await Promise.all(…)` isn't so great to maintain…

```js
const { users, prefs, messages } = await Promise.allKeyed({
  users: fetchUsers(),
  prefs: fetchPreferences(),
  messages: fetchMessages(),
})
```

---
layout: cover
background: /covers/aubrey-odom-T1L9Q5g7eIQ-unsplash.jpg
---

# The Stuck But Cool Ones

---

# The pipeline operator 🪄 <span class="stage">stage 2 (Aug 21)</span>

Massive cleanup of processing chains based on nested calls, interpolation, arithmetic operators, etc.

<div style="display: flex; gap: 1em; justify-content: space-between">

```js
// BEFORE 🤮
console.log(
  chalk.dim(
    `$ ${Object.keys(envars)
      .map(envar =>
        `${envar}=${envars[envar]}`)
      .join(' ')
    }`,
    'node',
    args.join(' ')))

const result = Array.from(
  take(3,
    map((v) => v + 1,
      filter((v) => v % 2 === 0, numbers))))
```

```js
// AFTER 🤩
Object.keys(envars)
  .map(envar => `${envar}=${envars[envar]}`)
  .join(' ')
  |> `$ ${%}`
  |> chalk.dim(%, 'node', args.join(' '))
  |> console.log(%)


const result = numbers
  |> filter(%, (v) => v % 2 === 0)
  |> map(%, (v) => v + 1)
  |> take(%, 3)
  |> Array.from
```

</div>

<Footnote>

Note that the substitution syntax (`%`) is [nowhere near settled.](https://github.com/tc39/proposal-pipeline-operator/issues/91)

</Footnote>

---

# Pattern matching 🤯 <span class="stage">stage 1 (Mar 22)</span>

A `match` expression that provides sort of a shape-based `switch`.  Has equivalents in Rust, Python, F#, Elixir/Erlang, etc.  This is just a **tiny peak** at what it envisions:

```js
match (res) {
  when ({ status: 200, body, ...rest }): handleData(body, rest)
  when ({ status, destination: url }) if (300 <= status && status < 400):
    handleRedirect(url)
  when ({ status: 500 }) if (!this.hasRetried): do {
    retry(req)
    this.hasRetried = true
  }
  default: throwSomething()
}

const commandResult = match (command) {
  when ([ 'go', dir and ('north' or 'east' or 'south' or 'west')]): go(dir);
  when ([ 'take', item and /[a-z]+ ball/ and { weight }]): take(item);
  default: lookAround()
}
```

---

# Finally *truly* legible regexes! 🎉 <span class="stage">stage 1 (Oct 21)</span>

Perl, C#, Ruby have it…  JS might finally get fully extended regex syntax. This ignores whitespace (including carriage returns) and comments. Yummy!

```js
  const TAG_REGEX = new RegExp(String.raw`
    <
    # Tag name
    (?<tag>[\w-]+)
    \s+
    # Attributes
    (?<attrs>.+?)
    >
    # Contents
    (?<content>.+?)
    # Closing tag, matching the opening one
    </\k<tag>>
  `, 'x')
```
