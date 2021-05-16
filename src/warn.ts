import { WarnCore, obj_entries, warningLevel, warning, getPref } from './core';

export class Warn extends WarnCore {
	footerlinks = {
		'Choosing a warning level': 'WP:UWUL#Levels',
		'Warn prefs': 'WP:TW/PREF#warn',
		'Twinkle help': 'WP:TW/DOC#warn',
		'Give feedback': 'WT:TW',
	};

	warningLevels: Record<
		string,
		{ label: string; summaryPrefix?: string; selected: (pref: number) => boolean; visible?: () => boolean }
	> = {
		level1: {
			label: '1: General note',
			selected: (pref) => pref === 1,
		},
		level2: {
			label: '2: Caution',
			selected: (pref) => pref === 2,
		},
		level3: {
			label: '3: Warning',
			selected: (pref) => pref === 3,
		},
		level4: {
			label: '4: Final warning',
			selected: (pref) => pref === 4,
		},
		level4im: {
			label: '4im: Only warning',
			selected: (pref) => pref === 5,
		},
		singlenotice: {
			label: 'Single-issue notices',
			selected: (pref) => pref === 6,
			visible: () => !getPref('combinedSingletMenus'),
		},
		singlewarn: {
			label: 'Single-issue warnings',
			selected: (pref) => pref === 7,
			visible: () => !getPref('combinedSingletMenus'),
		},
		singlecombined: {
			label: 'Single-issue messages',
			selected: (pref) => pref === 6 || pref === 7,
			visible: () => !!getPref('combinedSingletMenus'),
		},
		kitchensink: {
			label: 'All warning templates',
			selected: (pref) => pref === 10,
		},
		// unsupported
		autolevel: {
			label: 'Auto-select level (1-4)',
			selected: (pref) => pref === 11,
		},
		custom: {
			label: 'Custom warnings',
			selected: (pref) => pref === 9,
			visible: () => !!getPref('customWarningList')?.length,
		},
	};

	processWarnings() {
		type MessageConfig = {
			label: string;
			summary: string;
			heading?: string;
			suppressArticleInSummary?: true;
		};
		type MessagesType = {
			levels: Record<string, Record<string, Record<string, MessageConfig>>>;
			singlenotice: Record<string, MessageConfig>;
			singlewarn: Record<string, MessageConfig>;
		};

		const messages: MessagesType = {
			levels: {
				'Common warnings': {
					'uw-vandalism': {
						level1: {
							label: 'Vandalism',
							summary: 'General note: Unconstructive editing',
						},
						level2: {
							label: 'Vandalism',
							summary: 'Caution: Unconstructive editing',
						},
						level3: {
							label: 'Vandalism',
							summary: 'Warning: Vandalism',
						},
						level4: {
							label: 'Vandalism',
							summary: 'Final warning: Vandalism',
						},
						level4im: {
							label: 'Vandalism',
							summary: 'Only warning: Vandalism',
						},
					},
					'uw-disruptive': {
						level1: {
							label: 'Disruptive editing',
							summary: 'General note: Unconstructive editing',
						},
						level2: {
							label: 'Disruptive editing',
							summary: 'Caution: Unconstructive editing',
						},
						level3: {
							label: 'Disruptive editing',
							summary: 'Warning: Disruptive editing',
						},
					},
					'uw-test': {
						level1: {
							label: 'Editing tests',
							summary: 'General note: Editing tests',
						},
						level2: {
							label: 'Editing tests',
							summary: 'Caution: Editing tests',
						},
						level3: {
							label: 'Editing tests',
							summary: 'Warning: Editing tests',
						},
					},
					'uw-delete': {
						level1: {
							label: 'Removal of content, blanking',
							summary: 'General note: Removal of content, blanking',
						},
						level2: {
							label: 'Removal of content, blanking',
							summary: 'Caution: Removal of content, blanking',
						},
						level3: {
							label: 'Removal of content, blanking',
							summary: 'Warning: Removal of content, blanking',
						},
						level4: {
							label: 'Removal of content, blanking',
							summary: 'Final warning: Removal of content, blanking',
						},
						level4im: {
							label: 'Removal of content, blanking',
							summary: 'Only warning: Removal of content, blanking',
						},
					},
					'uw-generic': {
						level4: {
							label: 'Generic warning (for template series missing level 4)',
							summary: 'Final warning notice',
						},
					},
				},
				'Behavior in articles': {
					'uw-biog': {
						level1: {
							label: 'Adding unreferenced controversial information about living persons',
							summary: 'General note: Adding unreferenced controversial information about living persons',
						},
						level2: {
							label: 'Adding unreferenced controversial information about living persons',
							summary: 'Caution: Adding unreferenced controversial information about living persons',
						},
						level3: {
							label: 'Adding unreferenced controversial/defamatory information about living persons',
							summary: 'Warning: Adding unreferenced controversial information about living persons',
						},
						level4: {
							label: 'Adding unreferenced defamatory information about living persons',
							summary: 'Final warning: Adding unreferenced controversial information about living persons',
						},
						level4im: {
							label: 'Adding unreferenced defamatory information about living persons',
							summary: 'Only warning: Adding unreferenced controversial information about living persons',
						},
					},
					'uw-defamatory': {
						level1: {
							label: 'Addition of defamatory content',
							summary: 'General note: Addition of defamatory content',
						},
						level2: {
							label: 'Addition of defamatory content',
							summary: 'Caution: Addition of defamatory content',
						},
						level3: {
							label: 'Addition of defamatory content',
							summary: 'Warning: Addition of defamatory content',
						},
						level4: {
							label: 'Addition of defamatory content',
							summary: 'Final warning: Addition of defamatory content',
						},
						level4im: {
							label: 'Addition of defamatory content',
							summary: 'Only warning: Addition of defamatory content',
						},
					},
					'uw-error': {
						level1: {
							label: 'Introducing deliberate factual errors',
							summary: 'General note: Introducing factual errors',
						},
						level2: {
							label: 'Introducing deliberate factual errors',
							summary: 'Caution: Introducing factual errors',
						},
						level3: {
							label: 'Introducing deliberate factual errors',
							summary: 'Warning: Introducing deliberate factual errors',
						},
						level4: {
							label: 'Introducing deliberate factual errors',
							summary: 'Final warning: Introducing deliberate factual errors',
						},
					},
					'uw-genre': {
						level1: {
							label: 'Frequent or mass changes to genres without consensus or references',
							summary: 'General note: Frequent or mass changes to genres without consensus or references',
						},
						level2: {
							label: 'Frequent or mass changes to genres without consensus or references',
							summary: 'Caution: Frequent or mass changes to genres without consensus or references',
						},
						level3: {
							label: 'Frequent or mass changes to genres without consensus or reference',
							summary: 'Warning: Frequent or mass changes to genres without consensus or reference',
						},
						level4: {
							label: 'Frequent or mass changes to genres without consensus or reference',
							summary: 'Final warning: Frequent or mass changes to genres without consensus or reference',
						},
					},
					'uw-image': {
						level1: {
							label: 'Image-related vandalism in articles',
							summary: 'General note: Image-related vandalism in articles',
						},
						level2: {
							label: 'Image-related vandalism in articles',
							summary: 'Caution: Image-related vandalism in articles',
						},
						level3: {
							label: 'Image-related vandalism in articles',
							summary: 'Warning: Image-related vandalism in articles',
						},
						level4: {
							label: 'Image-related vandalism in articles',
							summary: 'Final warning: Image-related vandalism in articles',
						},
						level4im: {
							label: 'Image-related vandalism',
							summary: 'Only warning: Image-related vandalism',
						},
					},
					'uw-joke': {
						level1: {
							label: 'Using improper humor in articles',
							summary: 'General note: Using improper humor in articles',
						},
						level2: {
							label: 'Using improper humor in articles',
							summary: 'Caution: Using improper humor in articles',
						},
						level3: {
							label: 'Using improper humor in articles',
							summary: 'Warning: Using improper humor in articles',
						},
						level4: {
							label: 'Using improper humor in articles',
							summary: 'Final warning: Using improper humor in articles',
						},
						level4im: {
							label: 'Using improper humor',
							summary: 'Only warning: Using improper humor',
						},
					},
					'uw-nor': {
						level1: {
							label: 'Adding original research, including unpublished syntheses of sources',
							summary: 'General note: Adding original research, including unpublished syntheses of sources',
						},
						level2: {
							label: 'Adding original research, including unpublished syntheses of sources',
							summary: 'Caution: Adding original research, including unpublished syntheses of sources',
						},
						level3: {
							label: 'Adding original research, including unpublished syntheses of sources',
							summary: 'Warning: Adding original research, including unpublished syntheses of sources',
						},
						level4: {
							label: 'Adding original research, including unpublished syntheses of sources',
							summary: 'Final warning: Adding original research, including unpublished syntheses of sources',
						},
					},
					'uw-notcensored': {
						level1: {
							label: 'Censorship of material',
							summary: 'General note: Censorship of material',
						},
						level2: {
							label: 'Censorship of material',
							summary: 'Caution: Censorship of material',
						},
						level3: {
							label: 'Censorship of material',
							summary: 'Warning: Censorship of material',
						},
					},
					'uw-own': {
						level1: {
							label: 'Ownership of articles',
							summary: 'General note: Ownership of articles',
						},
						level2: {
							label: 'Ownership of articles',
							summary: 'Caution: Ownership of articles',
						},
						level3: {
							label: 'Ownership of articles',
							summary: 'Warning: Ownership of articles',
						},
						level4: {
							label: 'Ownership of articles',
							summary: 'Final warning: Ownership of articles',
						},
						level4im: {
							label: 'Ownership of articles',
							summary: 'Only warning: Ownership of articles',
						},
					},
					'uw-subtle': {
						level1: {
							label: 'Subtle vandalism',
							summary: 'General note: Possible unconstructive editing',
						},
						level2: {
							label: 'Subtle vandalism',
							summary: 'Caution: Likely unconstructive editing',
						},
						level3: {
							label: 'Subtle vandalism',
							summary: 'Warning: Subtle vandalism',
						},
						level4: {
							label: 'Subtle vandalism',
							summary: 'Final warning: Subtle vandalism',
						},
					},
					'uw-tdel': {
						level1: {
							label: 'Removal of maintenance templates',
							summary: 'General note: Removal of maintenance templates',
						},
						level2: {
							label: 'Removal of maintenance templates',
							summary: 'Caution: Removal of maintenance templates',
						},
						level3: {
							label: 'Removal of maintenance templates',
							summary: 'Warning: Removal of maintenance templates',
						},
						level4: {
							label: 'Removal of maintenance templates',
							summary: 'Final warning: Removal of maintenance templates',
						},
					},
					'uw-unsourced': {
						level1: {
							label: 'Addition of unsourced or improperly cited material',
							summary: 'General note: Addition of unsourced or improperly cited material',
						},
						level2: {
							label: 'Addition of unsourced or improperly cited material',
							summary: 'Caution: Addition of unsourced or improperly cited material',
						},
						level3: {
							label: 'Addition of unsourced or improperly cited material',
							summary: 'Warning: Addition of unsourced or improperly cited material',
						},
						level4: {
							label: 'Addition of unsourced or improperly cited material',
							summary: 'Final warning: Addition of unsourced or improperly cited material',
						},
					},
				},
				'Promotions and spam': {
					'uw-advert': {
						level1: {
							label: 'Using Wikipedia for advertising or promotion',
							summary: 'General note: Using Wikipedia for advertising or promotion',
						},
						level2: {
							label: 'Using Wikipedia for advertising or promotion',
							summary: 'Caution: Using Wikipedia for advertising or promotion',
						},
						level3: {
							label: 'Using Wikipedia for advertising or promotion',
							summary: 'Warning: Using Wikipedia for advertising or promotion',
						},
						level4: {
							label: 'Using Wikipedia for advertising or promotion',
							summary: 'Final warning: Using Wikipedia for advertising or promotion',
						},
						level4im: {
							label: 'Using Wikipedia for advertising or promotion',
							summary: 'Only warning: Using Wikipedia for advertising or promotion',
						},
					},
					'uw-npov': {
						level1: {
							label: 'Not adhering to neutral point of view',
							summary: 'General note: Not adhering to neutral point of view',
						},
						level2: {
							label: 'Not adhering to neutral point of view',
							summary: 'Caution: Not adhering to neutral point of view',
						},
						level3: {
							label: 'Not adhering to neutral point of view',
							summary: 'Warning: Not adhering to neutral point of view',
						},
						level4: {
							label: 'Not adhering to neutral point of view',
							summary: 'Final warning: Not adhering to neutral point of view',
						},
					},
					'uw-paid': {
						level1: {
							label: 'Paid editing without disclosure under the Wikimedia Terms of Use',
							summary: 'General note: Paid editing without disclosure under the Wikimedia Terms of Use',
						},
						level2: {
							label: 'Paid editing without disclosure under the Wikimedia Terms of Use',
							summary: 'Caution: Paid editing without disclosure under the Wikimedia Terms of Use',
						},
						level3: {
							label: 'Paid editing without disclosure under the Wikimedia Terms of Use',
							summary: 'Warning: Paid editing without disclosure under the Wikimedia Terms of Use',
						},
						level4: {
							label: 'Paid editing without disclosure under the Wikimedia Terms of Use',
							summary: 'Final warning: Paid editing without disclosure under the Wikimedia Terms of Use',
						},
					},
					'uw-spam': {
						level1: {
							label: 'Adding inappropriate external links',
							summary: 'General note: Adding inappropriate external links',
						},
						level2: {
							label: 'Adding spam links',
							summary: 'Caution: Adding spam links',
						},
						level3: {
							label: 'Adding spam links',
							summary: 'Warning: Adding spam links',
						},
						level4: {
							label: 'Adding spam links',
							summary: 'Final warning: Adding spam links',
						},
						level4im: {
							label: 'Adding spam links',
							summary: 'Only warning: Adding spam links',
						},
					},
				},
				'Behavior towards other editors': {
					'uw-agf': {
						level1: {
							label: 'Not assuming good faith',
							summary: 'General note: Not assuming good faith',
						},
						level2: {
							label: 'Not assuming good faith',
							summary: 'Caution: Not assuming good faith',
						},
						level3: {
							label: 'Not assuming good faith',
							summary: 'Warning: Not assuming good faith',
						},
					},
					'uw-harass': {
						level1: {
							label: 'Harassment of other users',
							summary: 'General note: Harassment of other users',
						},
						level2: {
							label: 'Harassment of other users',
							summary: 'Caution: Harassment of other users',
						},
						level3: {
							label: 'Harassment of other users',
							summary: 'Warning: Harassment of other users',
						},
						level4: {
							label: 'Harassment of other users',
							summary: 'Final warning: Harassment of other users',
						},
						level4im: {
							label: 'Harassment of other users',
							summary: 'Only warning: Harassment of other users',
						},
					},
					'uw-npa': {
						level1: {
							label: 'Personal attack directed at a specific editor',
							summary: 'General note: Personal attack directed at a specific editor',
						},
						level2: {
							label: 'Personal attack directed at a specific editor',
							summary: 'Caution: Personal attack directed at a specific editor',
						},
						level3: {
							label: 'Personal attack directed at a specific editor',
							summary: 'Warning: Personal attack directed at a specific editor',
						},
						level4: {
							label: 'Personal attack directed at a specific editor',
							summary: 'Final warning: Personal attack directed at a specific editor',
						},
						level4im: {
							label: 'Personal attack directed at a specific editor',
							summary: 'Only warning: Personal attack directed at a specific editor',
						},
					},
					'uw-tempabuse': {
						level1: {
							label: 'Improper use of warning or blocking template',
							summary: 'General note: Improper use of warning or blocking template',
						},
						level2: {
							label: 'Improper use of warning or blocking template',
							summary: 'Caution: Improper use of warning or blocking template',
						},
					},
				},
				'Removal of deletion tags': {
					'uw-afd': {
						level1: {
							label: 'Removing {{afd}} templates',
							summary: 'General note: Removing {{afd}} templates',
						},
						level2: {
							label: 'Removing {{afd}} templates',
							summary: 'Caution: Removing {{afd}} templates',
						},
						level3: {
							label: 'Removing {{afd}} templates',
							summary: 'Warning: Removing {{afd}} templates',
						},
						level4: {
							label: 'Removing {{afd}} templates',
							summary: 'Final warning: Removing {{afd}} templates',
						},
					},
					'uw-blpprod': {
						level1: {
							label: 'Removing {{blp prod}} templates',
							summary: 'General note: Removing {{blp prod}} templates',
						},
						level2: {
							label: 'Removing {{blp prod}} templates',
							summary: 'Caution: Removing {{blp prod}} templates',
						},
						level3: {
							label: 'Removing {{blp prod}} templates',
							summary: 'Warning: Removing {{blp prod}} templates',
						},
						level4: {
							label: 'Removing {{blp prod}} templates',
							summary: 'Final warning: Removing {{blp prod}} templates',
						},
					},
					'uw-idt': {
						level1: {
							label: 'Removing file deletion tags',
							summary: 'General note: Removing file deletion tags',
						},
						level2: {
							label: 'Removing file deletion tags',
							summary: 'Caution: Removing file deletion tags',
						},
						level3: {
							label: 'Removing file deletion tags',
							summary: 'Warning: Removing file deletion tags',
						},
						level4: {
							label: 'Removing file deletion tags',
							summary: 'Final warning: Removing file deletion tags',
						},
					},
					'uw-speedy': {
						level1: {
							label: 'Removing speedy deletion tags',
							summary: 'General note: Removing speedy deletion tags',
						},
						level2: {
							label: 'Removing speedy deletion tags',
							summary: 'Caution: Removing speedy deletion tags',
						},
						level3: {
							label: 'Removing speedy deletion tags',
							summary: 'Warning: Removing speedy deletion tags',
						},
						level4: {
							label: 'Removing speedy deletion tags',
							summary: 'Final warning: Removing speedy deletion tags',
						},
					},
				},
				'Other': {
					'uw-attempt': {
						level1: {
							label: 'Triggering the edit filter',
							summary: 'General note: Triggering the edit filter',
						},
						level2: {
							label: 'Triggering the edit filter',
							summary: 'Caution: Triggering the edit filter',
						},
						level3: {
							label: 'Triggering the edit filter',
							summary: 'Warning: Triggering the edit filter',
						},
						level4: {
							label: 'Triggering the edit filter',
							summary: 'Final warning: Triggering the edit filter',
						},
					},
					'uw-chat': {
						level1: {
							label: 'Using talk page as forum',
							summary: 'General note: Using talk page as forum',
						},
						level2: {
							label: 'Using talk page as forum',
							summary: 'Caution: Using talk page as forum',
						},
						level3: {
							label: 'Using talk page as forum',
							summary: 'Warning: Using talk page as forum',
						},
						level4: {
							label: 'Using talk page as forum',
							summary: 'Final warning: Using talk page as forum',
						},
					},
					'uw-create': {
						level1: {
							label: 'Creating inappropriate pages',
							summary: 'General note: Creating inappropriate pages',
						},
						level2: {
							label: 'Creating inappropriate pages',
							summary: 'Caution: Creating inappropriate pages',
						},
						level3: {
							label: 'Creating inappropriate pages',
							summary: 'Warning: Creating inappropriate pages',
						},
						level4: {
							label: 'Creating inappropriate pages',
							summary: 'Final warning: Creating inappropriate pages',
						},
						level4im: {
							label: 'Creating inappropriate pages',
							summary: 'Only warning: Creating inappropriate pages',
						},
					},
					'uw-mos': {
						level1: {
							label: 'Manual of style',
							summary: 'General note: Formatting, date, language, etc (Manual of style)',
						},
						level2: {
							label: 'Manual of style',
							summary: 'Caution: Formatting, date, language, etc (Manual of style)',
						},
						level3: {
							label: 'Manual of style',
							summary: 'Warning: Formatting, date, language, etc (Manual of style)',
						},
						level4: {
							label: 'Manual of style',
							summary: 'Final warning: Formatting, date, language, etc (Manual of style)',
						},
					},
					'uw-move': {
						level1: {
							label: 'Page moves against naming conventions or consensus',
							summary: 'General note: Page moves against naming conventions or consensus',
						},
						level2: {
							label: 'Page moves against naming conventions or consensus',
							summary: 'Caution: Page moves against naming conventions or consensus',
						},
						level3: {
							label: 'Page moves against naming conventions or consensus',
							summary: 'Warning: Page moves against naming conventions or consensus',
						},
						level4: {
							label: 'Page moves against naming conventions or consensus',
							summary: 'Final warning: Page moves against naming conventions or consensus',
						},
						level4im: {
							label: 'Page moves against naming conventions or consensus',
							summary: 'Only warning: Page moves against naming conventions or consensus',
						},
					},
					'uw-tpv': {
						level1: {
							label: "Refactoring others' talk page comments",
							summary: "General note: Refactoring others' talk page comments",
						},
						level2: {
							label: "Refactoring others' talk page comments",
							summary: "Caution: Refactoring others' talk page comments",
						},
						level3: {
							label: "Refactoring others' talk page comments",
							summary: "Warning: Refactoring others' talk page comments",
						},
						level4: {
							label: "Refactoring others' talk page comments",
							summary: "Final warning: Refactoring others' talk page comments",
						},
						level4im: {
							label: "Refactoring others' talk page comments",
							summary: "Only warning: Refactoring others' talk page comments",
						},
					},
					'uw-upload': {
						level1: {
							label: 'Uploading unencyclopedic images',
							summary: 'General note: Uploading unencyclopedic images',
						},
						level2: {
							label: 'Uploading unencyclopedic images',
							summary: 'Caution: Uploading unencyclopedic images',
						},
						level3: {
							label: 'Uploading unencyclopedic images',
							summary: 'Warning: Uploading unencyclopedic images',
						},
						level4: {
							label: 'Uploading unencyclopedic images',
							summary: 'Final warning: Uploading unencyclopedic images',
						},
						level4im: {
							label: 'Uploading unencyclopedic images',
							summary: 'Only warning: Uploading unencyclopedic images',
						},
					},
				},
			},
			singlenotice: {
				'uw-agf-sock': {
					label: 'Use of multiple accounts (assuming good faith)',
					summary: 'Notice: Using multiple accounts',
				},
				'uw-aiv': {
					label: 'Bad AIV report',
					summary: 'Notice: Bad AIV report',
				},
				'uw-autobiography': {
					label: 'Creating autobiographies',
					summary: 'Notice: Creating autobiographies',
				},
				'uw-badcat': {
					label: 'Adding incorrect categories',
					summary: 'Notice: Adding incorrect categories',
				},
				'uw-badlistentry': {
					label: 'Adding inappropriate entries to lists',
					summary: 'Notice: Adding inappropriate entries to lists',
				},
				'uw-bite': {
					label: '"Biting" newcomers',
					summary: 'Notice: "Biting" newcomers',
					suppressArticleInSummary: true, // non-standard (user name, not article), and not necessary
				},
				'uw-coi': {
					label: 'Conflict of interest',
					summary: 'Notice: Conflict of interest',
					heading: 'Managing a conflict of interest',
				},
				'uw-controversial': {
					label: 'Introducing controversial material',
					summary: 'Notice: Introducing controversial material',
				},
				'uw-copying': {
					label: 'Copying text to another page',
					summary: 'Notice: Copying text to another page',
				},
				'uw-crystal': {
					label: 'Adding speculative or unconfirmed information',
					summary: 'Notice: Adding speculative or unconfirmed information',
				},
				'uw-c&pmove': {
					label: 'Cut and paste moves',
					summary: 'Notice: Cut and paste moves',
				},
				'uw-dab': {
					label: 'Incorrect edit to a disambiguation page',
					summary: 'Notice: Incorrect edit to a disambiguation page',
				},
				'uw-date': {
					label: 'Unnecessarily changing date formats',
					summary: 'Notice: Unnecessarily changing date formats',
				},
				'uw-deadlink': {
					label: 'Removing proper sources containing dead links',
					summary: 'Notice: Removing proper sources containing dead links',
				},
				'uw-displaytitle': {
					label: 'Incorrect use of DISPLAYTITLE',
					summary: 'Notice: Incorrect use of DISPLAYTITLE',
				},
				'uw-draftfirst': {
					label: 'User should draft in userspace without the risk of speedy deletion',
					summary: 'Notice: Consider drafting your article in [[Help:Userspace draft|userspace]]',
				},
				'uw-editsummary': {
					label: 'New user not using edit summary',
					summary: 'Notice: Not using edit summary',
				},
				'uw-editsummary2': {
					label: 'Experienced user not using edit summary',
					summary: 'Notice: Not using edit summary',
				},
				'uw-elinbody': {
					label: 'Adding external links to the body of an article',
					summary: 'Notice: Keep external links to External links sections at the bottom of an article',
				},
				'uw-english': {
					label: 'Not communicating in English',
					summary: 'Notice: Not communicating in English',
				},
				'uw-hasty': {
					label: 'Hasty addition of speedy deletion tags',
					summary: 'Notice: Allow creators time to improve their articles before tagging them for deletion',
				},
				'uw-italicize': {
					label: 'Italicize books, films, albums, magazines, TV series, etc within articles',
					summary: 'Notice: Italicize books, films, albums, magazines, TV series, etc within articles',
				},
				'uw-lang': {
					label: 'Unnecessarily changing between British and American English',
					summary: 'Notice: Unnecessarily changing between British and American English',
					heading: 'National varieties of English',
				},
				'uw-linking': {
					label: 'Excessive addition of redlinks or repeated blue links',
					summary: 'Notice: Excessive addition of redlinks or repeated blue links',
				},
				'uw-minor': {
					label: 'Incorrect use of minor edits check box',
					summary: 'Notice: Incorrect use of minor edits check box',
				},
				'uw-notenglish': {
					label: 'Creating non-English articles',
					summary: 'Notice: Creating non-English articles',
				},
				'uw-notenglishedit': {
					label: 'Adding non-English content to articles',
					summary: 'Notice: Adding non-English content to articles',
				},
				'uw-notvote': {
					label: 'We use consensus, not voting',
					summary: 'Notice: We use consensus, not voting',
				},
				'uw-plagiarism': {
					label: 'Copying from public domain sources without attribution',
					summary: 'Notice: Copying from public domain sources without attribution',
				},
				'uw-preview': {
					label: 'Use preview button to avoid mistakes',
					summary: 'Notice: Use preview button to avoid mistakes',
				},
				'uw-redlink': {
					label: 'Indiscriminate removal of redlinks',
					summary: 'Notice: Be careful when removing redlinks',
				},
				'uw-selfrevert': {
					label: 'Reverting self tests',
					summary: 'Notice: Reverting self tests',
				},
				'uw-socialnetwork': {
					label: 'Wikipedia is not a social network',
					summary: 'Notice: Wikipedia is not a social network',
				},
				'uw-sofixit': {
					label: 'Be bold and fix things yourself',
					summary: 'Notice: You can be bold and fix things yourself',
				},
				'uw-spoiler': {
					label: 'Adding spoiler alerts or removing spoilers from appropriate sections',
					summary: "Notice: Don't delete or flag potential 'spoilers' in Wikipedia articles",
				},
				'uw-talkinarticle': {
					label: 'Talk in article',
					summary: 'Notice: Talk in article',
				},
				'uw-tilde': {
					label: 'Not signing posts',
					summary: 'Notice: Not signing posts',
				},
				'uw-toppost': {
					label: 'Posting at the top of talk pages',
					summary: 'Notice: Posting at the top of talk pages',
				},
				'uw-unattribcc': {
					label: 'Copying from compatibly-licensed sources without attribution',
					summary: 'Notice: Copying from compatibly-licensed sources without attribution',
				},
				'uw-userspace draft finish': {
					label: 'Stale userspace draft',
					summary: 'Notice: Stale userspace draft',
				},
				'uw-vgscope': {
					label: 'Adding video game walkthroughs, cheats or instructions',
					summary: 'Notice: Adding video game walkthroughs, cheats or instructions',
				},
				'uw-warn': {
					label: 'Place user warning templates when reverting vandalism',
					summary: 'Notice: You can use user warning templates when reverting vandalism',
				},
				'uw-wrongsummary': {
					label: 'Using inaccurate or inappropriate edit summaries',
					summary: 'Warning: Using inaccurate or inappropriate edit summaries',
				},
			},
			singlewarn: {
				'uw-3rr': {
					label: 'Potential three-revert rule violation; see also uw-ew',
					summary: 'Warning: Three-revert rule',
				},
				'uw-affiliate': {
					label: 'Affiliate marketing',
					summary: 'Warning: Affiliate marketing',
				},
				'uw-attack': {
					label: 'Creating attack pages',
					summary: 'Warning: Creating attack pages',
					suppressArticleInSummary: true,
				},
				'uw-botun': {
					label: 'Bot username',
					summary: 'Warning: Bot username',
				},
				'uw-canvass': {
					label: 'Canvassing',
					summary: 'Warning: Canvassing',
				},
				'uw-copyright': {
					label: 'Copyright violation',
					summary: 'Warning: Copyright violation',
				},
				'uw-copyright-link': {
					label: 'Linking to copyrighted works violation',
					summary: 'Warning: Linking to copyrighted works violation',
				},
				'uw-copyright-new': {
					label: 'Copyright violation (with explanation for new users)',
					summary: 'Notice: Avoiding copyright problems',
					heading: 'Wikipedia and copyright',
				},
				'uw-copyright-remove': {
					label: 'Removing {{copyvio}} template from articles',
					summary: 'Warning: Removing {{copyvio}} templates',
				},
				'uw-efsummary': {
					label: 'Edit summary triggering the edit filter',
					summary: 'Warning: Edit summary triggering the edit filter',
				},
				'uw-ew': {
					label: 'Edit warring (stronger wording)',
					summary: 'Warning: Edit warring',
				},
				'uw-ewsoft': {
					label: 'Edit warring (softer wording for newcomers)',
					summary: 'Warning: Edit warring',
				},
				'uw-hijacking': {
					label: 'Hijacking articles',
					summary: 'Warning: Hijacking articles',
				},
				'uw-hoax': {
					label: 'Creating hoaxes',
					summary: 'Warning: Creating hoaxes',
				},
				'uw-legal': {
					label: 'Making legal threats',
					summary: 'Warning: Making legal threats',
				},
				'uw-login': {
					label: 'Editing while logged out',
					summary: 'Warning: Editing while logged out',
				},
				'uw-multipleIPs': {
					label: 'Usage of multiple IPs',
					summary: 'Warning: Vandalism using multiple IPs',
				},
				'uw-pinfo': {
					label: 'Personal info (outing)',
					summary: 'Warning: Personal info',
				},
				'uw-salt': {
					label: 'Recreating salted articles under a different title',
					summary: 'Notice: Recreating creation-protected articles under a different title',
				},
				'uw-socksuspect': {
					label: 'Sockpuppetry',
					summary: 'Warning: You are a suspected [[WP:SOCK|sockpuppet]]', // of User:...
				},
				'uw-upv': {
					label: 'Userpage vandalism',
					summary: 'Warning: Userpage vandalism',
				},
				'uw-username': {
					label: 'Username is against policy',
					summary: 'Warning: Your username might be against policy',
					suppressArticleInSummary: true, // not relevant for this template
				},
				'uw-coi-username': {
					label: 'Username is against policy, and conflict of interest',
					summary: 'Warning: Username and conflict of interest policy',
					heading: 'Your username',
				},
				'uw-userpage': {
					label: 'Userpage or subpage is against policy',
					summary: 'Warning: Userpage or subpage is against policy',
				},
			},
		};

		let groupObject: warningLevel['list'] = {
			'Common warnings': [],
			'Behavior in articles': [],
			'Promotions and spam': [],
			'Behavior towards other editors': [],
			'Removal of deletion tags': [],
			'Other': [],
		};

		let groups: Record<string, warningLevel> = {
			level1: { label: '1: General note', list: $.extend(true, {}, groupObject) },
			level2: { label: '2: Caution', list: $.extend(true, {}, groupObject) },
			level3: { label: '3: Warning', list: $.extend(true, {}, groupObject) },
			level4: { label: '4: Final warning', list: $.extend(true, {}, groupObject) },
			level4im: { label: '4im: Only warning', list: $.extend(true, {}, groupObject) },
		};

		if (getPref('combinedSingletMenus')) {
			groups.singlecombined = {
				label: 'Single-issue messages',
				list: obj_entries(messages.singlenotice)
					.concat(obj_entries(messages.singlewarn))
					.sort((a, b) => (a.name < b.name ? -1 : 1))
					.map(([name, data]) => {
						return $.extend(
							{
								template: name,
							},
							data
						);
					}),
			};
		} else {
			groups.singlenotice = {
				label: 'Singe-issue notices',
				list: obj_entries(messages.singlenotice).map(([name, data]) => {
					return $.extend(
						{
							template: name,
						},
						data
					);
				}),
			};
			groups.singlewarn = {
				label: 'Single-issue warnings',
				list: obj_entries(messages.singlewarn).map(([name, data]) => {
					return $.extend(
						{
							template: name,
						},
						data
					);
				}),
			};
		}

		for (let [subgroupName, templateSet] of obj_entries(messages.levels)) {
			for (let [templateName, templateLevels] of obj_entries(templateSet)) {
				for (let [level, templateData] of obj_entries(templateLevels)) {
					groups[level].list[subgroupName].push(
						$.extend(
							{
								template: templateName + level.slice('level'.length),
							},
							templateData
						)
					);
				}
			}
		}

		this.warnings = groups;
	}

	getWarningWikitext(templateName, article, reason, isCustom) {
		var text = '{{subst:' + templateName;

		// add linked article for user warnings
		if (article) {
			// c&pmove has the source as the first parameter
			if (templateName === 'uw-c&pmove') {
				text += '|to=' + article;
			} else {
				text += '|1=' + article;
			}
		}
		if (reason && !isCustom) {
			// add extra message
			if (
				templateName === 'uw-csd' ||
				templateName === 'uw-probation' ||
				templateName === 'uw-userspacenoindex' ||
				templateName === 'uw-userpage'
			) {
				text += "|3=''" + reason + "''";
			} else {
				text += "|2=''" + reason + "''";
			}
		}
		text += '}}';

		if (reason && isCustom) {
			// we assume that custom warnings lack a {{{2}}} parameter
			text += " ''" + reason + "''";
		}

		return text + ' ~~~~';
	}

	validateInputs(params) {
		if (params.sub_group === 'uw-username' && !params.article) {
			return 'You must supply a reason for the {{uw-username}} template.';
		}
	}

	getHistoryRegex(): RegExp {
		return /<!--\s?Template:([uU]w-.*?)\s?-->.*?(\d{1,2}:\d{1,2}, \d{1,2} \w+ \d{4} \(UTC\))/g;
	}

	getInputConfig(template: string) {
		let input = super.getInputConfig(template);

		// Tags that don't take a linked article, but something else (often a username).
		// The value of each tag is the label next to the input field
		switch (template) {
			case 'uw-agf-sock':
				input.label = 'Optional username of other account (without User:) ';
				input.className = 'userInput';
				break;
			case 'uw-bite':
				input.label = "Username of 'bitten' user (without User:) ";
				input.className = 'userInput';
				break;
			case 'uw-socksuspect':
				input.label = 'Username of sock master, if known (without User:) ';
				input.className = 'userInput';
				break;
			case 'uw-username':
				input.label = 'Username violates policy because... ';
				break;
			case 'uw-aiv':
				input.label = 'Optional username that was reported (without User:) ';
				input.className = 'userInput';
				break;
			// no default
		}

		return input;
	}

	customiseSummaryWithInput(summary: string, input: string, messageData: warning) {
		// these templates require a username
		if (['uw-agf-sock', 'uw-socksuspect', 'uw-aiv'].includes(messageData.template)) {
			return summary + ' of [[:User:' + input + ']]';
		}
		return super.customiseSummaryWithInput(summary, input, messageData);
	}

	perWarningNotices(template): JQuery {
		switch (template) {
			case 'uw-username':
				return $(
					"<div style='color: red;' id='tw-warn-red-notice'>{{uw-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
						"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
						'{{uw-username}} should only be used in edge cases in order to engage in discussion with the user.</div>'
				);
			case 'uw-coi-username':
				return $(
					"<div style='color: red;' id='tw-warn-red-notice'>{{uw-coi-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
						"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
						'{{uw-coi-username}} should only be used in edge cases in order to engage in discussion with the user.</div>'
				);
			default:
				return $();
		}
	}
}
