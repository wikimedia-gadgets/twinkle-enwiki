import { ProtectCore } from './core';

export class Protect extends ProtectCore {
	footerlinks = {
		'Protection templates': 'Template:Protection templates',
		'Protection policy': 'WP:PROT',
		'Twinkle help': 'WP:TW/DOC#protect',
		'Give feedback': 'WT:TW',
	};

	// NOTICE: keep this synched with [[MediaWiki:Protect-dropdown]]
	// Also note: stabilize = Pending Changes level
	// expiry will override any defaults
	protectionPresetsInfo = {
		'pp-protected': {
			edit: 'sysop',
			move: 'sysop',
			reason: null,
		},
		'pp-dispute': {
			edit: 'sysop',
			move: 'sysop',
			reason: '[[WP:PP#Content disputes|Edit warring / content dispute]]',
		},
		'pp-vandalism': {
			edit: 'sysop',
			move: 'sysop',
			reason: 'Persistent [[WP:Vandalism|vandalism]]',
		},
		'pp-usertalk': {
			edit: 'sysop',
			move: 'sysop',
			expiry: 'infinity',
			reason: '[[WP:PP#Talk-page protection|Inappropriate use of user talk page while blocked]]',
		},
		'pp-template': {
			edit: 'templateeditor',
			move: 'templateeditor',
			expiry: 'infinity',
			reason: '[[WP:High-risk templates|Highly visible template]]',
		},
		'pp-30-500-arb': {
			edit: 'extendedconfirmed',
			move: 'extendedconfirmed',
			expiry: 'infinity',
			reason: '[[WP:30/500|Arbitration enforcement]]',
			template: 'pp-30-500',
		},
		'pp-30-500-vandalism': {
			edit: 'extendedconfirmed',
			move: 'extendedconfirmed',
			reason: 'Persistent [[WP:Vandalism|vandalism]] from (auto)confirmed accounts',
			template: 'pp-30-500',
		},
		'pp-30-500-disruptive': {
			edit: 'extendedconfirmed',
			move: 'extendedconfirmed',
			reason: 'Persistent [[WP:Disruptive editing|disruptive editing]] from (auto)confirmed accounts',
			template: 'pp-30-500',
		},
		'pp-30-500-blp': {
			edit: 'extendedconfirmed',
			move: 'extendedconfirmed',
			reason:
				'Persistent violations of the [[WP:BLP|biographies of living persons policy]] from (auto)confirmed accounts',
			template: 'pp-30-500',
		},
		'pp-30-500-sock': {
			edit: 'extendedconfirmed',
			move: 'extendedconfirmed',
			reason: 'Persistent [[WP:Sock puppetry|sock puppetry]]',
			template: 'pp-30-500',
		},
		'pp-semi-vandalism': {
			edit: 'autoconfirmed',
			reason: 'Persistent [[WP:Vandalism|vandalism]]',
			template: 'pp-vandalism',
		},
		'pp-semi-disruptive': {
			edit: 'autoconfirmed',
			reason: 'Persistent [[WP:Disruptive editing|disruptive editing]]',
			template: 'pp-protected',
		},
		'pp-semi-unsourced': {
			edit: 'autoconfirmed',
			reason: 'Persistent addition of [[WP:INTREF|unsourced or poorly sourced content]]',
			template: 'pp-protected',
		},
		'pp-semi-blp': {
			edit: 'autoconfirmed',
			reason: 'Violations of the [[WP:BLP|biographies of living persons policy]]',
			template: 'pp-blp',
		},
		'pp-semi-usertalk': {
			edit: 'autoconfirmed',
			move: 'autoconfirmed',
			expiry: 'infinity',
			reason: '[[WP:PP#Talk-page protection|Inappropriate use of user talk page while blocked]]',
			template: 'pp-usertalk',
		},
		'pp-semi-template': {
			// removed for now
			edit: 'autoconfirmed',
			move: 'autoconfirmed',
			expiry: 'infinity',
			reason: '[[WP:High-risk templates|Highly visible template]]',
			template: 'pp-template',
		},
		'pp-semi-sock': {
			edit: 'autoconfirmed',
			reason: 'Persistent [[WP:Sock puppetry|sock puppetry]]',
			template: 'pp-sock',
		},
		'pp-semi-protected': {
			edit: 'autoconfirmed',
			reason: null,
			template: 'pp-protected',
		},
		'pp-pc-vandalism': {
			stabilize: 'autoconfirmed', // stabilize = Pending Changes
			reason: 'Persistent [[WP:Vandalism|vandalism]]',
			template: 'pp-pc',
		},
		'pp-pc-disruptive': {
			stabilize: 'autoconfirmed',
			reason: 'Persistent [[WP:Disruptive editing|disruptive editing]]',
			template: 'pp-pc',
		},
		'pp-pc-unsourced': {
			stabilize: 'autoconfirmed',
			reason: 'Persistent addition of [[WP:INTREF|unsourced or poorly sourced content]]',
			template: 'pp-pc',
		},
		'pp-pc-blp': {
			stabilize: 'autoconfirmed',
			reason: 'Violations of the [[WP:BLP|biographies of living persons policy]]',
			template: 'pp-pc',
		},
		'pp-pc-protected': {
			stabilize: 'autoconfirmed',
			reason: null,
			template: 'pp-pc',
		},
		'pp-move': {
			move: 'sysop',
			reason: null,
		},
		'pp-move-dispute': {
			move: 'sysop',
			reason: '[[WP:MOVP|Move warring]]',
		},
		'pp-move-vandalism': {
			move: 'sysop',
			reason: '[[WP:MOVP|Page-move vandalism]]',
		},
		'pp-move-indef': {
			move: 'sysop',
			expiry: 'infinity',
			reason: '[[WP:MOVP|Highly visible page]]',
		},
		'unprotect': {
			edit: 'all',
			move: 'all',
			stabilize: 'none',
			create: 'all',
			reason: null,
			template: 'none',
		},
		'pp-create-offensive': {
			create: 'sysop',
			reason: '[[WP:SALT|Offensive name]]',
		},
		'pp-create-salt': {
			create: 'extendedconfirmed',
			reason: '[[WP:SALT|Repeatedly recreated]]',
		},
		'pp-create-blp': {
			create: 'extendedconfirmed',
			reason: '[[WP:BLPDEL|Recently deleted BLP]]',
		},
		'pp-create': {
			create: 'extendedconfirmed',
			reason: '{{pp-create}}',
		},
	};

	protectionTags = [
		{
			label: 'None (remove existing protection templates)',
			value: 'none',
		},
		{
			label: 'None (do not remove existing protection templates)',
			value: 'noop',
		},
		{
			label: 'Edit protection templates',
			list: [
				{ label: '{{pp-vandalism}}: vandalism', value: 'pp-vandalism' },
				{ label: '{{pp-dispute}}: dispute/edit war', value: 'pp-dispute' },
				{ label: '{{pp-blp}}: BLP violations', value: 'pp-blp' },
				{ label: '{{pp-sock}}: sockpuppetry', value: 'pp-sock' },
				{ label: '{{pp-template}}: high-risk template', value: 'pp-template' },
				{ label: '{{pp-usertalk}}: blocked user talk', value: 'pp-usertalk' },
				{ label: '{{pp-protected}}: general protection', value: 'pp-protected' },
				{ label: '{{pp-semi-indef}}: general long-term semi-protection', value: 'pp-semi-indef' },
				{ label: '{{pp-30-500}}: extended confirmed protection', value: 'pp-30-500' },
			],
		},
		{
			label: 'Pending changes templates',
			list: [{ label: '{{pp-pc}}: pending changes', value: 'pp-pc' }],
		},
		{
			label: 'Move protection templates',
			list: [
				{ label: '{{pp-move-dispute}}: dispute/move war', value: 'pp-move-dispute' },
				{ label: '{{pp-move-vandalism}}: page-move vandalism', value: 'pp-move-vandalism' },
				{ label: '{{pp-move-indef}}: general long-term', value: 'pp-move-indef' },
				{ label: '{{pp-move}}: other', value: 'pp-move' },
			],
		},
	].filter((type) => {
		// Filter FlaggedRevs
		return this.hasFlaggedRevs || type.label !== 'Pending changes templates';
	});
}
