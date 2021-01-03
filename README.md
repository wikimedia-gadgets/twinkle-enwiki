# twinke-enwiki

**This is not the deployed version of Twinkle on English Wikipedia, for that see [twinkle](https://github.com/wikimedia-gadgets/twinkle) instead.**

This is the enwiki localisation of [Twinkle core](https://github.com/wikimedia-gadgets/twinkle-core).

### Development
This project is written in TypeScript using ES modules format. Webpack is used as the module bundler.
- Run `npm start` for development. This invokes [webpack-dev-server](https://webpack.js.org/configuration/dev-server/), which refreshes the live application in the browser on every code change. The bundled application can be accessed via http://localhost:5500/bundle.js, which you can import into your on-wiki common.js page. You'll need to provide the dependencies too:

The following can be used on the [testwiki](https://test.wikipedia.org/):
```js
mw.loader.using('ext.gadget.Twinkle-dependencies').then(function() {
  mw.loader.load('http://localhost:5500/bundle.js');
});
```
  
A sourcemap is generated to allow debugging of TypeScript code using the browser's dev tools, using which you can place debug breakpoints (works in Chrome, other browsers untested).
  
- Running `grunt build` generates the production build with minification. It takes care of escaping any nowiki tags and inserting gadget comments on top of the webpack output. 

Webpack minification is rather than leaving it to the MediaWiki ResourceLoader in order to take advantage of [tree-shaking](https://en.wikipedia.org/wiki/Tree_shaking). Any functions that twinkle-core provides which aren't applicable to enwiki and hence unused, are removed from the output bundle. This enables twinkle-core to provide a number of central functions and classes without worry of bloating every wiki's Twinkle gadget with code they are not using. 
