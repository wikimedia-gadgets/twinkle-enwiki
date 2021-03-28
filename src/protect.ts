import { NS_MAIN, ProtectCore } from './core';

export class Protect extends ProtectCore {
	footerlinks = {
		'Protection templates': 'Template:Protection templates',
		'Protection policy': 'WP:PROT',
		'Twinkle help': 'WP:TW/DOC#protect',
		'Give feedback': 'WT:TW',
	};

	getProtectionLevels() {
		return $.extend(true, super.getProtectionLevels(), {
			extendedconfirmed: {
				label: 'Extended confirmed',
				weight: 20,
				types: ['edit', 'move', 'create'],
			},
			templateeditor: {
				label: 'Template editors',
				weight: 30,
				applicable: this.isTemplate,
				types: ['edit', 'move'],
			},
			autoconfirmed: {
				// Per [[WP:ACPERM]]
				applicable: (type) => !(type === 'create' && mw.config.get('wgNamespaceNumber') === NS_MAIN),
			},
		});
	}

	getProtectionPresets(): quickFormElementData[] {
		return [
			{ label: 'Unprotection', value: 'unprotect' },
			{
				label: 'Full protection',
				list: [
					{ label: 'Generic (full)', value: 'pp-protected' },
					{ label: 'Content dispute/edit warring (full)', value: 'pp-dispute' },
					{ label: 'Persistent vandalism (full)', value: 'pp-vandalism' },
					{ label: 'User talk of blocked user (full)', value: 'pp-usertalk' },
				],
			},
			{
				label: 'Template protection',
				list: [{ label: 'Highly visible template (TE)', value: 'pp-template' }],
			},
			{
				label: 'Extended confirmed protection',
				list: [
					{ label: 'Arbitration enforcement (ECP)', selected: true, value: 'pp-30-500-arb' },
					{ label: 'Persistent vandalism (ECP)', value: 'pp-30-500-vandalism' },
					{ label: 'Disruptive editing (ECP)', value: 'pp-30-500-disruptive' },
					{ label: 'BLP policy violations (ECP)', value: 'pp-30-500-blp' },
					{ label: 'Sockpuppetry (ECP)', value: 'pp-30-500-sock' },
				],
			},
			{
				label: 'Semi-protection',
				list: [
					{ label: 'Generic (semi)', value: 'pp-semi-protected' },
					{ label: 'Persistent vandalism (semi)', selected: true, value: 'pp-semi-vandalism' },
					{ label: 'Disruptive editing (semi)', value: 'pp-semi-disruptive' },
					{ label: 'Adding unsourced content (semi)', value: 'pp-semi-unsourced' },
					{ label: 'BLP policy violations (semi)', value: 'pp-semi-blp' },
					{ label: 'Sockpuppetry (semi)', value: 'pp-semi-sock' },
					{ label: 'User talk of blocked user (semi)', value: 'pp-semi-usertalk' },
				],
			},
			{
				label: 'Pending changes',
				list: [
					{ label: 'Generic (PC)', value: 'pp-pc-protected' },
					{ label: 'Persistent vandalism (PC)', value: 'pp-pc-vandalism' },
					{ label: 'Disruptive editing (PC)', value: 'pp-pc-disruptive' },
					{ label: 'Adding unsourced content (PC)', value: 'pp-pc-unsourced' },
					{ label: 'BLP policy violations (PC)', value: 'pp-pc-blp' },
				],
			},
			{
				label: 'Move protection',
				list: [
					{ label: 'Generic (move)', value: 'pp-move' },
					{ label: 'Dispute/move warring (move)', value: 'pp-move-dispute' },
					{ label: 'Page-move vandalism (move)', value: 'pp-move-vandalism' },
					{ label: 'Highly visible page (move)', value: 'pp-move-indef' },
				],
			},
		].filter((type) => {
			// Filter for templates and flaggedrevs
			return (
				(this.isTemplate || type.label !== 'Template protection') &&
				(this.hasFlaggedRevs || type.label !== 'Pending changes')
			);
		});
	}

	getCreateProtectionPresets(): quickFormElementData[] {
		return [
			{ label: 'Unprotection', value: 'unprotect' },
			{
				label: 'Create protection',
				list: [
					{ label: 'Generic ({{pp-create}})', value: 'pp-create' },
					{ label: 'Offensive name', value: 'pp-create-offensive' },
					{ label: 'Repeatedly recreated', selected: true, value: 'pp-create-salt' },
					{ label: 'Recently deleted BLP', value: 'pp-create-blp' },
				],
			},
		];
	}

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
