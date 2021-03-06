import { BlockCore, BlockPresetInfo } from './core';

export class Block extends BlockCore {
	footerlinks = {
		'Block templates': 'Template:Uw-block/doc/Block_templates',
		'Block policy': 'WP:BLOCK',
		'Block prefs': 'WP:TW/PREF#block',
		'Twinkle help': 'WP:TW/DOC#block',
		'Give feedback': 'WT:TW',
	};

	blockPresetsInfo: Record<string, BlockPresetInfo> = {
		'anonblock': {
			expiry: '31 hours',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{anonblock}}',
			sig: '~~~~',
		},
		'anonblock - school': {
			expiry: '36 hours',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{anonblock}} <!-- Likely a school based on behavioral evidence -->',
			templateName: 'anonblock',
			sig: '~~~~',
		},
		'blocked proxy': {
			expiry: '1 year',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			hardblock: true,
			reason: '{{blocked proxy}}',
			sig: null,
		},
		'CheckUser block': {
			expiry: '1 week',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{CheckUser block}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'checkuserblock-account': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{checkuserblock-account}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'checkuserblock-wide': {
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{checkuserblock-wide}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'colocationwebhost': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{colocationwebhost}}',
			sig: null,
		},
		'oversightblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			nonstandard: true,
			reason: '{{OversightBlock}}',
			sig: '~~~~',
			requireGroup: 'oversight',
		},
		'school block': {
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{school block}}',
			sig: '~~~~',
		},
		'spamblacklistblock': {
			forAnonOnly: true,
			expiry: '1 month',
			disabletalk: true,
			nocreate: true,
			reason:
				'{{spamblacklistblock}} <!-- editor only attempts to add blacklisted links, see [[Special:Log/spamblacklist]] -->',
		},
		'rangeblock': {
			reason: '{{rangeblock}}',
			nocreate: true,
			nonstandard: true,
			forAnonOnly: true,
			forRangeOnly: true,
			sig: '~~~~',
		},
		'tor': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{Tor}}',
			sig: null,
		},
		'webhostblock': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{webhostblock}}',
			sig: null,
		},
		// uw-prefixed
		'uw-3block': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: true,
			pageParam: true,
			reason: 'Violation of the [[WP:Three-revert rule|three-revert rule]]',
			summary: 'You have been blocked from editing for violation of the [[WP:3RR|three-revert rule]]',
		},
		'uw-ablock': {
			autoblock: true,
			expiry: '31 hours',
			forAnonOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'Your IP address has been blocked from editing',
			suppressArticleInSummary: true,
		},
		'uw-adblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Using Wikipedia for [[WP:Spam|spam]] or [[WP:NOTADVERTISING|advertising]] purposes',
			summary: 'You have been blocked from editing for [[WP:SOAP|advertising or self-promotion]]',
		},
		'uw-aeblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Arbitration enforcement|Arbitration enforcement]]',
			reasonParam: true,
			summary: 'You have been blocked from editing for violating an [[WP:Arbitration|arbitration decision]]',
		},
		'uw-bioblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Violations of the [[WP:Biographies of living persons|biographies of living persons]] policy',
			summary:
				"You have been blocked from editing for violations of Wikipedia's [[WP:BLP|biographies of living persons policy]]",
		},
		'uw-block': {
			autoblock: true,
			expiry: '24 hours',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'You have been blocked from editing',
			suppressArticleInSummary: true,
		},
		'uw-blockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'You have been indefinitely blocked from editing',
			suppressArticleInSummary: true,
		},
		'uw-blocknotalk': {
			disabletalk: true,
			pageParam: true,
			reasonParam: true,
			summary: 'You have been blocked from editing and your user talk page access has been disabled',
			suppressArticleInSummary: true,
		},
		'uw-botblock': {
			forRegisteredOnly: true,
			pageParam: true,
			reason: 'Running a [[WP:BOT|bot script]] without [[WP:BRFA|approval]]',
			summary:
				'You have been blocked from editing because it appears you are running a [[WP:BOT|bot script]] without [[WP:BRFA|approval]]',
		},
		'uw-botublock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-botublock}} <!-- Username implies a bot, soft block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] indicates this is a [[WP:BOT|bot]] account, which is currently not approved',
		},
		'uw-botuhblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-botuhblock}} <!-- Username implies a bot, hard block -->',
			summary:
				'You have been indefinitely blocked from editing because your username is a blatant violation of the [[WP:U|username policy]].',
		},
		'uw-causeblock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-causeblock}} <!-- Username represents a non-profit, soft block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] gives the impression that the account represents a group, organization or website',
		},
		'uw-compblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: 'Compromised account',
			summary:
				'You have been indefinitely blocked from editing because it is believed that your [[WP:SECURE|account has been compromised]]',
		},
		'uw-copyrightblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Copyright violations|Copyright violations]]',
			summary: 'You have been blocked from editing for continued [[WP:COPYVIO|copyright infringement]]',
		},
		'uw-dblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Persistent removal of content',
			pageParam: true,
			summary: 'You have been blocked from editing for continued [[WP:VAND|removal of material]]',
		},
		'uw-disruptblock': {
			autoblock: true,
			nocreate: true,
			reason: '[[WP:Disruptive editing|Disruptive editing]]',
			summary: 'You have been blocked from editing for [[WP:DE|disruptive editing]]',
		},
		'uw-efblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Repeatedly triggering the [[WP:Edit filter|Edit filter]]',
			summary:
				'You have been blocked from editing for disruptive edits that repeatedly triggered the [[WP:EF|edit filter]]',
		},
		'uw-ewblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Edit warring|Edit warring]]',
			summary:
				'You have been blocked from editing to prevent further [[WP:DE|disruption]] caused by your engagement in an [[WP:EW|edit war]]',
		},
		'uw-hblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:No personal attacks|Personal attacks]] or [[WP:Harassment|harassment]]',
			summary: 'You have been blocked from editing for attempting to [[WP:HARASS|harass]] other users',
		},
		'uw-ipevadeblock': {
			forAnonOnly: true,
			nocreate: true,
			reason: '[[WP:Blocking policy#Evasion of blocks|Block evasion]]',
			summary:
				'Your IP address has been blocked from editing because it has been used to [[WP:EVADE|evade a previous block]]',
		},
		'uw-lblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			reason: 'Making [[WP:No legal threats|legal threats]]',
			summary: 'You have been blocked from editing for making [[WP:NLT|legal threats or taking legal action]]',
		},
		'uw-nothereblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			reason: 'Clearly [[WP:NOTHERE|not here to build an encyclopedia]]',
			forRegisteredOnly: true,
			summary:
				'You have been indefinitely blocked from editing because it appears that you are not here to [[WP:NOTHERE|build an encyclopedia]]',
		},
		'uw-npblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Creating [[WP:Patent nonsense|patent nonsense]] or other inappropriate pages',
			summary: 'You have been blocked from editing for creating [[WP:PN|nonsense pages]]',
		},
		'uw-pablock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			reason: '[[WP:No personal attacks|Personal attacks]] or [[WP:Harassment|harassment]]',
			summary: 'You have been blocked from editing for making [[WP:NPA|personal attacks]] toward other users',
		},
		'uw-sblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Using Wikipedia for [[WP:SPAM|spam]] purposes',
			summary: 'You have been blocked from editing for using Wikipedia for [[WP:SPAM|spam]] purposes',
		},
		'uw-soablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Spam|Spam]] / [[WP:NOTADVERTISING|advertising]]-only account',
			summary:
				'You have been indefinitely blocked from editing because your account is being used only for [[WP:SPAM|spam, advertising, or promotion]]',
		},
		'uw-socialmediablock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Using Wikipedia as a [[WP:NOTMYSPACE|blog, web host, social networking site or forum]]',
			summary:
				'You have been blocked from editing for using user and/or article pages as a [[WP:NOTMYSPACE|blog, web host, social networking site or forum]]',
		},
		'uw-sockblock': {
			autoblock: true,
			forRegisteredOnly: true,
			nocreate: true,
			reason: 'Abusing [[WP:Sock puppetry|multiple accounts]]',
			summary: 'You have been blocked from editing for abusing [[WP:SOCK|multiple accounts]]',
		},
		'uw-softerblock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-softerblock}} <!-- Promotional username, soft block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] gives the impression that the account represents a group, organization or website',
		},
		'uw-spamublock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-spamublock}} <!-- Promotional username, promotional edits -->',
			summary:
				'You have been indefinitely blocked from editing because your account is being used only for [[WP:SPAM|spam or advertising]] and your username is a violation of the [[WP:U|username policy]]',
		},
		'uw-spoablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '[[WP:SOCK|Sock puppetry]]',
			summary: 'This account has been blocked as a [[WP:SOCK|sock puppet]] created to violate Wikipedia policy',
		},
		'uw-talkrevoked': {
			disabletalk: true,
			reason: 'Revoking talk page access: inappropriate use of user talk page while blocked',
			prependReason: true,
			summary: 'Your user talk page access has been disabled',
			useInitialOptions: true,
		},
		'uw-ublock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock}} <!-- Username violation, soft block -->',
			reasonParam: true,
			summary:
				'You have been indefinitely blocked from editing because your username is a violation of the [[WP:U|username policy]]',
		},
		'uw-ublock-double': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock-double}} <!-- Username closely resembles another user, soft block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] is too similar to the username of another Wikipedia user',
		},
		'uw-ucblock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			pageParam: true,
			reason: 'Persistent addition of [[WP:INTREF|unsourced content]]',
			summary: 'You have been blocked from editing for persistent addition of [[WP:INTREF|unsourced content]]',
		},
		'uw-uhblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-uhblock}} <!-- Username violation, hard block -->',
			reasonParam: true,
			summary:
				'You have been indefinitely blocked from editing because your username is a blatant violation of the [[WP:U|username policy]]',
		},
		'uw-ublock-wellknown': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock-wellknown}} <!-- Username represents a well-known person, soft block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] matches the name of a well-known living individual',
		},
		'uw-uhblock-double': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-uhblock-double}} <!-- Attempted impersonation of another user, hard block -->',
			summary:
				'You have been indefinitely blocked from editing because your [[WP:U|username]] appears to impersonate another established Wikipedia user',
		},
		'uw-upeblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:PAID|Undisclosed paid editing]] in violation of the WMF [[WP:TOU|Terms of Use]]',
			summary:
				'You have been indefinitely blocked from editing because your account is being used in violation of [[WP:PAID|Wikipedia policy on undisclosed paid advocacy]]',
		},
		'uw-vaublock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '{{uw-vaublock}} <!-- Username violation, vandalism-only account -->',
			summary:
				'You have been indefinitely blocked from editing because your account is being [[WP:VOA|used only for vandalism]] and your username is a blatant violation of the [[WP:U|username policy]]',
		},
		'uw-vblock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Vandalism|Vandalism]]',
			summary: 'You have been blocked from editing to prevent further [[WP:VAND|vandalism]]',
		},
		'uw-voablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Vandalism-only account|Vandalism-only account]]',
			summary:
				'You have been indefinitely blocked from editing because your account is being [[WP:VOA|used only for vandalism]]',
		},
		'zombie proxy': {
			expiry: '1 month',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{zombie proxy}}',
			sig: null,
		},

		// Begin partial block templates, accessed in Twinkle.block.blockGroupsPartial
		'uw-acpblock': {
			autoblock: true,
			expiry: '48 hours',
			nocreate: true,
			pageParam: false,
			reasonParam: true,
			reason: 'Misusing [[WP:Sock puppetry|multiple accounts]]',
			summary: 'You have been [[WP:PB|blocked from creating accounts]] for misusing [[WP:SOCK|multiple accounts]]',
		},
		'uw-acpblockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: false,
			reasonParam: true,
			reason: 'Misusing [[WP:Sock puppetry|multiple accounts]]',
			summary:
				'You have been indefinitely [[WP:PB|blocked from creating accounts]] for misusing [[WP:SOCK|multiple accounts]]',
		},
		'uw-aepblock': {
			autoblock: true,
			nocreate: false,
			pageParam: false,
			reason: '[[WP:Arbitration enforcement|Arbitration enforcement]]',
			reasonParam: true,
			summary:
				'You have been [[WP:PB|partially blocked]] from editing for violating an [[WP:Arbitration|arbitration decision]]',
		},
		'uw-epblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: false,
			noemail: true,
			pageParam: false,
			reasonParam: true,
			reason: 'Email [[WP:Harassment|harassment]]',
			summary: 'You have been [[WP:PB|blocked from emailing]] other editors for [[WP:Harassment|harassment]]',
		},
		'uw-ewpblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			reason: '[[WP:Edit warring|Edit warring]]',
			summary:
				'You have been [[WP:PB|partially blocked]] from editing certain areas of the encyclopedia to prevent further [[WP:DE|disruption]] due to [[WP:EW|edit warring]]',
		},
		'uw-pblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			summary: 'You have been [[WP:PB|partially blocked]] from certain areas of the encyclopedia',
		},
		'uw-pblockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			summary: 'You have been indefinitely [[WP:PB|partially blocked]] from certain areas of the encyclopedia',
		},
	};

	blockGroups: quickFormElementData[] = [
		{
			label: 'Common block reasons',
			list: [
				{ label: 'anonblock', value: 'anonblock' },
				{ label: 'anonblock - likely a school', value: 'anonblock - school' },
				{ label: 'school block', value: 'school block' },
				{ label: 'Generic block (custom reason)', value: 'uw-block' }, // ends up being default for registered users
				{ label: 'Generic block (custom reason) - IP', value: 'uw-ablock', selected: true }, // set only when blocking IP
				{ label: 'Generic block (custom reason) - indefinite', value: 'uw-blockindef' },
				{ label: 'Disruptive editing', value: 'uw-disruptblock' },
				{ label: 'Inappropriate use of user talk page while blocked', value: 'uw-talkrevoked' },
				{ label: 'Not here to build an encyclopedia', value: 'uw-nothereblock' },
				{ label: 'Unsourced content', value: 'uw-ucblock' },
				{ label: 'Vandalism', value: 'uw-vblock' },
				{ label: 'Vandalism-only account', value: 'uw-voablock' },
			],
		},
		{
			label: 'Extended reasons',
			list: [
				{ label: 'Advertising', value: 'uw-adblock' },
				{ label: 'Arbitration enforcement', value: 'uw-aeblock' },
				{ label: 'Block evasion - IP', value: 'uw-ipevadeblock' },
				{ label: 'BLP violations', value: 'uw-bioblock' },
				{ label: 'Copyright violations', value: 'uw-copyrightblock' },
				{ label: 'Creating nonsense pages', value: 'uw-npblock' },
				{ label: 'Edit filter-related', value: 'uw-efblock' },
				{ label: 'Edit warring', value: 'uw-ewblock' },
				{ label: 'Generic block with talk page access revoked', value: 'uw-blocknotalk' },
				{ label: 'Harassment', value: 'uw-hblock' },
				{ label: 'Legal threats', value: 'uw-lblock' },
				{ label: 'Personal attacks or harassment', value: 'uw-pablock' },
				{ label: 'Possible compromised account', value: 'uw-compblock' },
				{ label: 'Removal of content', value: 'uw-dblock' },
				{ label: 'Sock puppetry (master)', value: 'uw-sockblock' },
				{ label: 'Sock puppetry (puppet)', value: 'uw-spoablock' },
				{ label: 'Social networking', value: 'uw-socialmediablock' },
				{ label: 'Spam', value: 'uw-sblock' },
				{ label: 'Spam/advertising-only account', value: 'uw-soablock' },
				{ label: 'Unapproved bot', value: 'uw-botblock' },
				{ label: 'Undisclosed paid editing', value: 'uw-upeblock' },
				{ label: 'Violating the three-revert rule', value: 'uw-3block' },
			],
		},
		{
			label: 'Username violations',
			list: [
				{ label: 'Bot username, soft block', value: 'uw-botublock' },
				{ label: 'Bot username, hard block', value: 'uw-botuhblock' },
				{ label: 'Promotional username, hard block', value: 'uw-spamublock' },
				{ label: 'Promotional username, soft block', value: 'uw-softerblock' },
				{ label: 'Similar username, soft block', value: 'uw-ublock-double' },
				{ label: 'Username violation, soft block', value: 'uw-ublock' },
				{ label: 'Username violation, hard block', value: 'uw-uhblock' },
				{ label: 'Username impersonation, hard block', value: 'uw-uhblock-double' },
				{ label: 'Username represents a well-known person, soft block', value: 'uw-ublock-wellknown' },
				{ label: 'Username represents a non-profit, soft block', value: 'uw-causeblock' },
				{ label: 'Username violation, vandalism-only account', value: 'uw-vaublock' },
			],
		},
		{
			label: 'Templated reasons',
			list: [
				{ label: 'blocked proxy', value: 'blocked proxy' },
				{ label: 'CheckUser block', value: 'CheckUser block' },
				{ label: 'checkuserblock-account', value: 'checkuserblock-account' },
				{ label: 'checkuserblock-wide', value: 'checkuserblock-wide' },
				{ label: 'colocationwebhost', value: 'colocationwebhost' },
				{ label: 'oversightblock', value: 'oversightblock' },
				{ label: 'rangeblock', value: 'rangeblock' }, // Only for IP ranges, selected for non-/64 ranges in filtered_block_groups
				{ label: 'spamblacklistblock', value: 'spamblacklistblock' },
				{ label: 'tor', value: 'tor' },
				{ label: 'webhostblock', value: 'webhostblock' },
				{ label: 'zombie proxy', value: 'zombie proxy' },
			],
		},
	];

	blockGroupsPartial = [
		{
			label: 'Common partial block reasons',
			list: [
				{ label: 'Generic partial block (custom reason)', value: 'uw-pblock', selected: true },
				{ label: 'Generic partial block (custom reason) - indefinite', value: 'uw-pblockindef' },
				{ label: 'Edit warring', value: 'uw-ewpblock' },
			],
		},
		{
			label: 'Extended partial block reasons',
			list: [
				{ label: 'Arbitration enforcement', value: 'uw-aepblock' },
				{ label: 'Email harassment', value: 'uw-epblock' },
				{ label: 'Misusing multiple accounts', value: 'uw-acpblock' },
				{ label: 'Misusing multiple accounts - indefinite', value: 'uw-acpblockindef' },
			],
		},
	];

	// disable Gadget/Gadget definition and their talk namespaces
	disablePartialBlockNamespaces = [2300, 2301, 2302, 2303];

	toggle_see_alsos(e: QuickFormEvent) {
		let checkbox = e.target;
		var reason = checkbox.form.reason.value.replace(
			new RegExp('( <!--|;) ' + 'see also ' + this.seeAlsos.join(' and ') + '( -->)?'),
			''
		);

		this.seeAlsos = this.seeAlsos.filter((el) => el !== checkbox.value);

		if (checkbox.checked) {
			this.seeAlsos.push(checkbox.value);
		}
		var seeAlsoMessage = this.seeAlsos.join(' and ');

		if (!this.seeAlsos.length) {
			checkbox.form.reason.value = reason;
		} else if (reason.indexOf('{{') !== -1) {
			checkbox.form.reason.value = reason + ' <!-- see also ' + seeAlsoMessage + ' -->';
		} else {
			checkbox.form.reason.value = reason + '; see also ' + seeAlsoMessage;
		}
	}

	// XXX: partially move to twinkle-core
	getBlockNoticeWikitextAndSummary(params) {
		var text = '{{',
			settings = this.blockPresetsInfo[params.template];
		if (!settings.nonstandard) {
			text += 'subst:' + params.template;
			if (params.article && settings.pageParam) {
				text += '|page=' + params.article;
			}
			if (params.dstopic) {
				text += '|topic=' + params.dstopic;
			}

			if (!/te?mp|^\s*$|min/.exec(params.expiry)) {
				if (params.indefinite) {
					text += '|indef=yes';
				} else if (!params.blank_duration && !new Morebits.date(params.expiry).isValid()) {
					// Block template wants a duration, not date
					text += '|time=' + params.expiry;
				}
			}

			if (!this.isRegistered && !params.hardblock) {
				text += '|anon=yes';
			}

			if (params.reason) {
				text += '|reason=' + params.reason;
			}
			if (params.disabletalk) {
				text += '|notalk=yes';
			}

			// Currently, all partial block templates are "standard"
			// Building the template, however, takes a fair bit of logic
			if (params.partial) {
				if (params.pagerestrictions.length || params.namespacerestrictions.length) {
					text += '|area=' + (params.indefinite ? 'certain ' : 'from certain ');
					if (params.pagerestrictions.length) {
						text +=
							'pages (' +
							mw.language.listToText(
								params.pagerestrictions.map((p) => {
									return '[[:' + p + ']]';
								})
							);
						text += params.namespacerestrictions.length ? ') and certain ' : ')';
					}
					if (params.namespacerestrictions.length) {
						// 1 => Talk, 2 => User, etc.
						var namespaceNames = params.namespacerestrictions.map((id) => {
							return this.menuFormattedNamespaces[id];
						});
						text += '[[Wikipedia:Namespace|namespaces]] (' + mw.language.listToText(namespaceNames) + ')';
					}
				} else if (params.area) {
					text += '|area=' + params.area;
				} else {
					if (params.noemail) {
						text += '|email=yes';
					}
					if (params.nocreate) {
						text += '|accountcreate=yes';
					}
				}
			}
		} else {
			text += params.template;
		}

		if (settings.sig) {
			text += '|sig=' + settings.sig;
		}
		text += '}}';

		// build the edit summary
		var summary = params.messageData.summary as string;
		if (params.messageData.suppressArticleInSummary !== true && params.article) {
			summary += ' on [[:' + params.article + ']]';
		}
		summary += '.';

		return [text, summary] as [string, string];
	}

	dsinfo = {
		'': {
			code: '',
		},
		'Abortion': {
			code: 'ab',
			page: 'Wikipedia:Arbitration/Requests/Case/Abortion',
		},
		'American politics post-1992': {
			code: 'ap',
			page: 'Wikipedia:Arbitration/Requests/Case/American politics 2',
		},
		'Ancient Egyptian race controversy': {
			code: 'aerc',
			page: 'Wikipedia:Requests for arbitration/Ancient Egyptian race controversy',
		},
		'Arab-Israeli conflict': {
			code: 'a-i',
			page: 'Wikipedia:Arbitration/Index/Palestine-Israel articles',
		},
		'Armenia, Azerbaijan, or related conflicts': {
			code: 'a-a',
			page: 'Wikipedia:Requests for arbitration/Armenia-Azerbaijan 2',
		},
		'Biographies of Living Persons (BLPs)': {
			code: 'blp',
			page: 'Wikipedia:Requests for arbitration/Editing of Biographies of Living Persons',
		},
		'Climate change': {
			code: 'cc',
			page: 'Wikipedia:Arbitration/Requests/Case/Climate change',
		},
		'Complementary and alternative medicine': {
			code: 'com',
			page: 'Wikipedia:Arbitration/Requests/Case/Acupuncture',
		},
		'Eastern Europe or the Balkans': {
			code: 'e-e',
			page: 'Wikipedia:Requests for arbitration/Eastern Europe',
		},
		'Electronic cigarettes': {
			code: 'ecig',
			page: 'Wikipedia:Arbitration/Requests/Case/Editor conduct in e-cigs articles',
		},
		'Falun Gong': {
			code: 'fg',
			page: 'Wikipedia:Requests for arbitration/Falun Gong',
		},
		'Gender-related dispute or controversy and associated people (includes GamerGate)': {
			code: 'gas',
			page: 'Wikipedia:Arbitration/Requests/Case/Gender and sexuality',
		},
		'Genetically modified organisms (GMO)': {
			code: 'gmo',
			page: 'Wikipedia:Arbitration/Requests/Case/Genetically modified organisms',
		},
		'Gun control': {
			code: 'gc',
			page: 'Wikipedia:Arbitration/Requests/Case/Gun control',
		},
		'Horn of Africa (Ethiopia, Somalia, Eritrea, Djibouti)': {
			code: 'horn',
			page: 'Wikipedia:Arbitration/Requests/Case/Horn of Africa',
		},
		'India, Pakistan, and Afghanistan': {
			code: 'ipa',
			page: 'Wikipedia:Requests for arbitration/India-Pakistan',
		},
		'Infoboxes': {
			code: 'cid',
			page: 'Wikipedia:Arbitration/Requests/Case/Civility in infobox discussions',
		},
		'Kurds and Kurdistan': {
			code: 'kurd',
			page: 'Wikipedia:Arbitration/Requests/Case/Kurds and Kurdistan',
		},
		'Landmark Worldwide': {
			code: 'lw',
			page: 'Wikipedia:Arbitration/Requests/Case/Landmark Worldwide',
		},
		'Liancourt Rocks': {
			code: 'lr',
			page: 'Wikipedia:Requests for arbitration/Liancourt Rocks',
		},
		'Manual of Style and article titles': {
			code: 'mos',
			page: 'Wikipedia:Arbitration/Requests/Case/Article titles and capitalisation',
		},
		'Muhammad': {
			code: 'muh-im',
			page: 'Wikipedia:Arbitration/Requests/Case/Muhammad images',
		},
		'Pharmaceutical drug prices (medicine)': {
			code: 'med',
			page: 'Wikipedia:Arbitration/Requests/Case/Medicine',
		},
		'Prem Rawat': {
			code: 'pr',
			page: 'Wikipedia:Requests for arbitration/Prem Rawat',
		},
		'Pseudoscience and fringe science': {
			code: 'ps',
			page: 'Wikipedia:Requests for arbitration/Pseudoscience',
		},
		'Race/ethnicity and human abilities, behaviour, and intelligence': {
			code: 'r-i',
			page: 'Wikipedia:Arbitration/Requests/Case/Race and intelligence',
		},
		'Scientology': {
			code: 'sci',
			page: 'Wikipedia:Requests for arbitration/Scientology',
		},
		'Senkaku Islands dispute': {
			code: 'sen',
			page: 'Wikipedia:Arbitration/Requests/Case/Senkaku Islands',
		},
		'September 11 attacks': {
			code: '9/11',
			page: 'Wikipedia:Requests for arbitration/September 11 conspiracy theories',
		},
		'Shakespeare authorship question': {
			code: 'saq',
			page: 'Wikipedia:Arbitration/Requests/Case/Shakespeare authorship question',
		},
		'Transcendental Meditation movement': {
			code: 'tm',
			page: 'Wikipedia:Arbitration/Requests/Case/Transcendental Meditation movement',
		},
		'The Troubles': {
			code: 'tt',
			page: 'Wikipedia:Requests for arbitration/The Troubles',
		},
		'Waldorf education': {
			code: 'we',
			page: 'Wikipedia:Requests for arbitration/Waldorf education',
		},
	};
}
