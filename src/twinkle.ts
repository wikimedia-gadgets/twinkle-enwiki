import { Twinkle } from './core';

// import modules
import { Xfd } from './xfd';
import { Tag } from './tag';
import { Speedy } from './speedy';
import { Warn } from "./warn";
import { DiffCore as Diff } from './core'; // no customisation; import directly from core

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

Twinkle.userAgent = 'Twinkle ([[w:en:WP:TW]])';
Twinkle.changeTags = 'twinkle';
Twinkle.summaryAd = ' ([[WP:TW|TW]])';

Twinkle.init();

Twinkle.registeredModules = [
	Xfd,
	Tag,
	Speedy,
	Diff,
	Warn
];

for (let module of Twinkle.registeredModules) {
	Twinkle.addInitCallback(() => new module(), module.moduleName);
}


// allow global access
declare global {
	interface Window {
		Twinkle: typeof Twinkle
	}
}
window.Twinkle = Twinkle;
