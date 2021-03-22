import { Twinkle, loadMessages, init, addInitCallback, Config } from './core';
import messages from './messages.json';

// import modules
import { Xfd } from './xfd';
import { Tag } from './tag';
import { Speedy } from './speedy';
import { Warn } from './warn';
import { Fluff } from './fluff';
import { BatchDelete } from './batchdelete';
import { Protect } from './protect';
import { Block } from './block';
import { Prod } from './prod';
import { Deprod } from './deprod';
import { Welcome } from './welcome';
import { Shared } from './shared';
import { Talkback } from './talkback';
import { Arv } from './arv';
import { Unlink } from './unlink';
import { BatchUndelete } from './batchundelete';

// no customisation; import directly from core
import { DiffCore as Diff } from './core';

// Make jQuery Deferred exceptions hit the source map during debugging
// XXX: there has to be a better way to do this ...
// @ts-ignore
if (typeof __webpack_exports__ !== 'undefined') {
	jQuery.Deferred.exceptionHook = function (err) {
		throw err;
	};
}

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

loadMessages(messages);

Twinkle.userAgent = 'Twinkle ([[w:en:WP:TW]])';
Twinkle.changeTags = 'twinkle';
Twinkle.summaryAd = ' ([[WP:TW|TW]])';

init();

Twinkle.registeredModules = [
	Xfd,
	Tag,
	Speedy,
	Diff,
	Warn,
	Fluff,
	BatchDelete,
	Protect,
	Block,
	Prod,
	Deprod,
	Arv,
	Welcome,
	Shared,
	Talkback,
	Unlink,
	BatchUndelete,
];

for (let module of Twinkle.registeredModules) {
	addInitCallback(() => new module(), module.moduleName);
}

// Has any effect only on WP:TWPREF
Config.init();

// allow global access
declare global {
	interface Window {
		Twinkle: typeof Twinkle;
	}
}
window.Twinkle = Twinkle;
