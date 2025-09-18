---
layout: cover
background: /covers/aaron-burden-CKlHKtCJZKk-unsplash.jpg
---

# Quick refresher:<br/>ES2020–2023

A curated list of things too few people heard about 😉

---

# ES2020: `String#matchAll`

Captures **all groups** for a sticky or **global** regex.

```js
const text = 'Get in touch at tel:0983450176 or sms:478-555-1234'

text.match(/(?<protocol>[a-z]{3}):(?<number>[\d-]+)/g)
// => ['tel:0983450176', 'sms:478-555-1234'] -- 😞 DUDE, WHERE ARE MY GROUPS?!
```

```js
Array.from(text.matchAll(/([a-z]{3}):([\d-]+)/g)).map(
  ([, protocol, number]) => ({ protocol, number })
)
// => [{ number: '0983450176', protocol: 'tel' }, { number: '478-555-1234', protocol: 'sms' }]

Array.from(text.matchAll(/(?<protocol>[a-z]{3}):(?<number>[\d-]+)/g)).map((mr) => mr.groups)
// => [{ number: '0983450176', protocol: 'tel' }, { number: '478-555-1234', protocol: 'sms' }]
```

---

# ES2020 / ES2021: `Promise.allSettled`/`any`

The two missing combinators: `any` short-circuits on the **first fulfillment**, whilst `allSettled` doesn't short-circuit at all: you get all settlements for analysis.

Together with `all` (short-circuits on first rejection) and `race` (short-circuits on first settlement) from ES2015, we now cover all scenarios.

```js
// May the fastest strategy win!
const data = await Promise.any([fetchFromDB(), fetchFromCache(), fetchFromHighSpeedLAN()])

// Run all tests in parallel, no short-circuit!
await Promise.allSettled(tests)
// => [
//   { status: 'fulfilled', value: Response… },
//   { status: 'fulfilled', value: undefined },
//   { status: 'rejected', reason: Error: snapshot… }
// ]
```

---

# ES2022: `at()` on position-based native iterables 🤩

You know how `Array` and `String` let you use negative indices with `slice`, `splice`, etc. but not with `[…]`? This novelty lets you grab last elements without a cringe.

From now on, **all position-based native iterables** offer `.at(…)` that understands negative indices!

```js
const roomSeries = ['St-Laurent', 'Westmount', 'Outremount']
roomSeries.at(-1) // => 'Outremount'
roomSeries.at(-2) // => 'Westmount'
```

---

# ES2023: Change Array by Copy

A series of cool utilities that let you derive arrays (yay immutability). `Array`'s API so far exposed 8 derivative methods (producing new arrays) and 9 mutative methods (modifying arrays in place), including `reverse()` and `sort()`, which many folks didn't realize were mutative!

```js
const trackSpeakers = ['Nicolas', 'Hugh', 'Teiva', 'Simon', 'Sébastien']

trackSpeakers.toReversed()
// => ['Sébastien', 'Simon', 'Teiva', 'Hugh', 'Nicolas']
trackSpeakers.toSorted((s1, s2) => s1.localeCompare(s2))
// => ['Hugh', 'Nicolas', 'Sébastien', 'Simon', 'Teiva']
trackSpeakers.toSpliced(-2, 2)
// => ['Nicolas', 'Hugh', 'Teiva']
trackSpeakers.with(-2, 'Yann')
// => ['Nicolas', 'Hugh', 'Teiva', 'Yann', 'Sébastien']

trackSpeakers // => ['Nicolas', 'Hugh', 'Teiva', 'Simon', 'Sébastien']
```

---

# ES2024: Array grouping 🎉

One more nail in Lodash's coffin.

```js
const thisSlot = [
  { title: 'Vertical Slice Architecture', mainTag: 'Architecture' },
  { title: 'On Inheriting Legacy Codebases', mainTag: 'Architecture' },
  { title: 'Introduction to OpenTelemetry…', maintag: 'DevOps' },
  { title: 'Writing Effective JUnit Tests', mainTag: 'Tests' },
  // …
]
schedule.group(({ mainTag }) => mainTag)
// {
//   Architecture: [{ title: 'Vertical Slice…'… }, { title: 'On Inheriting…'… }],
//   DevOps: [{ title: 'Introduction to OpenTelemetry…'… }, { title: 'Accélérez vos API…'… }],
//   Tests: [{ title: 'Writing Effective…'… }],
//   ...
// }

schedule.groupToMap(({ mainTag }) => mainTag)
// => Same thing, **as a Map** (so any grouping key type!)
```

---

# ES2024: `v` flag for regexes

Allows for **nested classes** (classes represent possibilities for a single character match), which in turn allows **difference** and **intersection** of classes. Wicked cool.

Use the `v` flag instead of ES2015's Unicode flag (`u`) when you need that feature.

```js
// All of Unicode's decimal digits, except ASCII ones:
text.match(/[\p{Decimal_Number}--[0-9]]/gv)

// Equivalently:
text.match(/[\p{Decimal_Number}--\p{ASCII}]/gv)

// All Khmer letters (= Khmer Script + Letter Property)
text.match(/[\p{Script=Khmer}&&\p{Letter}]/gv)
```

---

# ES2024: `Promise.withResolvers()`

A common pattern rolled by hand anytime we need access to promise outcome methods outside of the `Promise` constructor callback.  Pretty neat to avoid scope juggling and when working with event-based underlying APIs for our async processing.

```js
const { promise, resolve, reject } = Promise.withResolvers()
```

⚠️ **Don't expose the outcome methods to your consumers!** It's only there to simplify your implementation code!

---

# E2025 Collection / iterator utilities

We're not going to stop processing data collections (and iterables in general) anytime soon, so we might as well have more tools in our standard toolbelt for this…

We're about to get many [**new `Set` methods**](https://github.com/tc39/proposal-set-methods#readme) (intersection, union, difference, disjunction, super/subset, etc.) and a ton of [**iterator helpers**](https://github.com/tc39/proposal-iterator-helpers#readme) (instead of having to roll our own generative functions for `take`, `filter` or `map`, for instance).

```js
function* fibonacci() { /* … */ }

const firstTens = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
const fibs = new Set(fibonacci().take(10))
const earlyFibs = firstTens.intersection(fibonacci) // => Set { 1, 2, 3, 5, 8 }
const earlyNonFibs = firstTens.difference(fibonacci) // => Set { 4, 6, 7, 9, 10 }
const evenFibs = earlyFibs.values().filter((n) => n % 2 === 0)
```

<Footnote>

Asynchronous versions are in the pipeline too, at stage 2 right now (September 2025).

</Footnote>

---

# ES2025: More flexible regular expressions

**Named capture groups** are a major readability / maintainability boost for regexes, but an oversight in their initial spec prevented **reusing the same group name** in multiple parts of an alternative.

It should have been ready for ES2023 but lacked some tests and a second native implementation.  Tests got there in time for 2024 feature freeze, but implementation missed the deadline by a few weeks. Still, it's now here!

```js {lines:false}
const year = dateText.match(/(?<year>[0-9]{4})-[0-9]{2}|[0-9]{2}-(?<year>[0-9]{4})/)?.groups.year

const mixedAlpha = /^[a-z](?-i:[a-z])$/i
mixedAlpha.test('ab') // => true
mixedAlpha.test('Ab') // => true
mixedAlpha.test('aB') // => false
```

---

# ES2025: Import / export attributes

Provides free-form metadata on imports, with an inline syntax.

The dominating use case, long discussed, is extra module types with matching type expectations for security reasons (a bit like HTTP's `X-Content-Type-Options: nosniff` response header).  We then use the `type` metadata, leveraged by engines.

```js
// Static imports
import config from '../config/config.json' with { type: 'json' }

// Dynamic imports
const { default: config } = await import('../config/config.json', { with: { type: 'json' } })
```

The spec suggests matching upgrades for Web Worker instantiation and HTML's `script` tag.

<Footnote>

This proposal supersedes the same-stage *JSON Modules* proposal, that used a more specific `assert` syntax.

</Footnote>

---

# ES2025: `Promise.try()`

A faster alternative to the usual `Promise.resolve().then(f)` or `new Promise((resolve) => resolve(f()))` shenanigans for allowing promise-based consumer semantics over a function that may be sync or async.

Ensures **same-tick** execution when synchronous whilst being a lot more ergonomic!

```js
// `init` is a value-returning function that may be sync or promise-based async
async function runProcess({ init... }) {
  const initial = await Promise.try(init)
  // ...
}
```

---

# ES2025: `RegExp.escape()`

You can **finally** natively escape regular expression text!

```js
RegExp.escape("😊 *_* +_+ ... 👍");
// => "😊\\ \\*_\\*\\ \\+_\\+\\ \\.\\.\\.\\ 👍"
```