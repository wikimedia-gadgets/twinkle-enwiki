# twinke-enwiki

**This is not the deployed version of Twinkle on English Wikipedia, for that see [twinkle](https://github.com/wikimedia-gadgets/twinkle) instead.**

This is the enwiki localisation of [Twinkle core](https://github.com/wikimedia-gadgets/twinkle-core).

### Development

This project is written in TypeScript using ES modules format. Webpack is used as the module bundler.

Run `npm start` for development. This invokes [webpack-dev-server](https://webpack.js.org/configuration/dev-server/), which refreshes the application in the browser on every code change. The bundled application can be accessed via http://localhost:5500/, which you can import into your on-wiki common.js page. 

Add the following to your on-wiki common.js page:
```js
mw.loader.load('http://localhost:5500/'); 
```

A sourcemap is generated to allow debugging of TypeScript code using the browser's dev tools, in which you can place debug breakpoints.

It is also possible to debug using breakpoints set in your IDE rather than the browser. For WebStorm, [setup a debug configuration for external web server](https://www.jetbrains.com/help/webstorm/debugging-javascript-in-chrome.html#debugging_js_on_external_web_server). If using Chrome, this causes a default profile of Chrome to open (without your bookmarks or other customisations). This can be fixed by following instructions [here](https://www.jetbrains.com/help/webstorm/2017.3/debugging-javascript-in-chrome.html#ws_js_debug_chrome_default_profile). Something similar can be [done for VS Code](https://code.visualstudio.com/blogs/2016/02/23/introducing-chrome-debugger-for-vs-code) as well.

### Production build

Running `grunt build` generates the production build with minification. It takes care of escaping any nowiki tags and inserting gadget comments on top of the webpack output.

Webpack minification is done rather than leaving it to the MediaWiki ResourceLoader in order to take advantage of [tree-shaking](https://en.wikipedia.org/wiki/Tree_shaking). Any functions that twinkle-core provides which aren't applicable to enwiki and hence unused, are removed from the output bundle. This enables twinkle-core to provide a number of central functions and classes without worry of bloating every wiki's Twinkle gadget with code they are not using.
