import { Twinkle, loadMessages, init } from './core';
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

import './globals';

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

loadMessages(messages);

Twinkle.userAgent = 'Twinkle ([[w:en:WP:TW]])';
Twinkle.changeTags = 'twinkle';
Twinkle.summaryAd = ' ([[WP:TW|TW]])';

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

init();
