# rollup-plugin-off-main-thread

Use Rollup with workers and ES6 modules _today_.

```
$ npm install --save rollup-plugin-off-main-thread
```

Workers are JavaScript’s version of threads. [Workers are important to use][when workers] as the main thread is already overloaded, especially on slower or older devices.

This plugin takes care of shimming module support in workers and allows you to use `new Worker()`.

OMT is the result of merging loadz0r and workz0r.

## Usage

```js
// rollup.config.js
import OMT from "rollup-plugin-off-main-thread";

export default {
  input: ["src/main.js"],
  output: {
    dir: "dist",
    // You _must_ use “amd” as your format
    format: "amd"
  },
  plugins: [OMT()]
};
```

I set up [a gist] to show a full setup with OMT.

## Options

```js
{
  // ...
  plugins: [OMT(options)];
}
```

- `loader`: A string containing the EJS template for the amd loader. If `undefined`, OMT will use `loader.ejs`.
- `useEval`: Use `fetch()` + `eval()` to load dependencies instead of `<script>` tags and `importScripts()`. _This is not CSP compliant, but is required if you want to use dynamic imports in ServiceWorker_.
- `marker`: A string that is temporarily injected to mark `new Worker()` calls. It’s only purpose is to be unique enough that the string sequence can’t appear by coincidence in ohter places. The default should be fine 99% of the time.
- `workerRegexp`: A RegExp to find `new Workers()` calls. The second capture group _must_ capture the provided file name without the quotes.
- `filenameRegexp`: A RegExp that finds the file name after Rollup has transformed dynamic imports.
- `amdFunctionName`: Function name to use instead of AMD’s `define`

[when workers]: https://dassur.ma/things/when-workers
[a gist]: https://gist.github.com/surma/a02db7b53eb3e7870bf539b906ff6ff6

---

License Apache-2.0
