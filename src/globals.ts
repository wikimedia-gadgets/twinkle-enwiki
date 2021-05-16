/**
 * Allow global access for certain objects for debugging and console-based testing.
 * In addition to this, {@link registerModule} exposes initialised module class
 * objects (eg. Twinkle.tag is the tag class object).
 */

import { msg, Twinkle, registerModule, Api, Page, SiteConfig } from './core';

// @ts-ignore
window.Twinkle = Twinkle;

$.extend(Twinkle, {
	registerModule,
	msg,
	Page,
	Api,
	SiteConfig,
});

// Make jQuery Deferred exceptions hit the source map during debugging
// XXX: there has to be a better way to do this ...
// @ts-ignore
if (typeof __webpack_exports__ !== 'undefined') {
	jQuery.Deferred.exceptionHook = function (err) {
		throw err;
	};
}
