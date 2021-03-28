/**
 * Allow global access for certain objects for debugging and console-based testing
 */

import { msg, Twinkle, TwinkleModule, Api, Page } from './core';

window.Twinkle = Twinkle;

Twinkle.registerModule = TwinkleModule.register;
Twinkle.msg = msg;
Twinkle.page = Page;
Twinkle.api = Api;

// Make jQuery Deferred exceptions hit the source map during debugging
// XXX: there has to be a better way to do this ...
if (typeof __webpack_exports__ !== 'undefined') {
	jQuery.Deferred.exceptionHook = function (err) {
		throw err;
	};
}
