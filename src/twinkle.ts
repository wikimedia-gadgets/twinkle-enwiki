import { Twinkle, loadMessages } from 'twinkle-core';

// import modules
import { Xfd } from './xfd';
import { Tag } from './tag';
import { Speedy } from './speedy';
import { Diff } from './core'; // no customisation; import directly from core

// import messages for core components
import messages from './messages';

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

Twinkle.userAgent = 'Twinkle ([[w:en:WP:TW]])';
Twinkle.changeTags = 'twinkle';
Twinkle.summaryAd = ' ([[WP:TW|TW]])';

Twinkle.init();

loadMessages(messages);

Twinkle.registeredModules = [
	Xfd,
	Tag,
	Speedy,
	Diff
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
