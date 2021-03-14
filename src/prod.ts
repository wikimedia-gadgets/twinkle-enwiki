import { Api, makeOptoutLink, Page, Twinkle, TwinkleModule } from './core';
import { hatnoteRegex, makeFindSourcesDiv, optoutTemplates } from './common';

export class Prod extends TwinkleModule {
	moduleName = 'prod';
	static moduleName = 'prod';

	portletName = 'PROD';
	portletId = 'twinkle-prod';
	portletTooltip = 'Propose deletion via WP:PROD';

	constructor() {
		super();
		if (
			([0, 6, 108].indexOf(mw.config.get('wgNamespaceNumber')) === -1 &&
				(mw.config.get('wgNamespaceNumber') !== 2 ||
					mw.config.get('wgCategories').indexOf('Wikipedia books (user books)') === -1)) ||
			!mw.config.get('wgCurRevisionId') ||
			Morebits.isPageRedirect()
		) {
			return;
		}
		this.addMenu();
	}

	// initially set in evaluate(), and
	// modified in various callback functions
	params: {
		usertalk?: boolean;
		reason?: string;
		blp?: boolean;
		book?: boolean;
		initialContrib?: string;
		logInitialContrib?: string;
		creation?: string; // creation timestamp
		oldProdPresent?: boolean;
		logEndorsing?: boolean;
	} = {};

	// Used in edit summaries, for comparisons, etc.
	namespace: 'article' | 'file' | 'book';

	defaultReason = Twinkle.getPref('prodReasonDefault');

	makeWindow() {
		switch (mw.config.get('wgNamespaceNumber')) {
			case 0:
				this.namespace = 'article';
				break;
			case 6:
				this.namespace = 'file';
				break;
			case 2:
			case 108:
				this.namespace = 'book';
				break;
			// no default
		}

		var Window = new Morebits.simpleWindow(800, 410);
		Window.setTitle('Proposed deletion (PROD)');
		Window.setScriptName('Twinkle');

		var form = new Morebits.quickForm(this.evaluate.bind(this));

		if (this.namespace === 'article') {
			Window.addFooterLink('Proposed deletion policy', 'WP:PROD');
			Window.addFooterLink('BLP PROD policy', 'WP:BLPPROD');
		} else if (this.namespace === 'file') {
			Window.addFooterLink('Proposed deletion policy', 'WP:PROD');
		} else {
			// if book
			Window.addFooterLink('Proposed deletion (books) policy', 'WP:BOOKPROD');
		}

		var field = form.append({
			type: 'field',
			label: 'PROD type',
			id: 'prodtype_fieldset',
		});

		field.append({
			type: 'div',
			label: '', // Added later by Twinkle.makeFindSourcesDiv()
			id: 'twinkle-prod-findsources',
			style: 'margin-bottom: 5px; margin-top: -5px;',
		});

		field.append({
			type: 'radio',
			name: 'prodtype',
			event: this.prodtypechanged.bind(this),
			list: [
				{
					label: 'PROD (proposed deletion)',
					value: 'prod',
					checked: true,
					tooltip: 'Normal proposed deletion, per [[WP:PROD]]',
				},
				{
					label: 'BLP PROD (proposed deletion of unsourced BLPs)',
					value: 'prodblp',
					tooltip: 'Proposed deletion of new, completely unsourced biographies of living persons, per [[WP:BLPPROD]]',
				},
			],
		});

		// Placeholder fieldset to be replaced in Prod.prodtypechanged
		form.append({
			type: 'field',
			name: 'parameters',
		});

		Window.addFooterLink('PROD prefs', 'WP:TW/PREF#prod');
		Window.addFooterLink('Twinkle help', 'WP:TW/DOC#prod');
		Window.addFooterLink('Give feedback', 'WT:TW');

		form.append({ type: 'submit', label: 'Propose deletion' });

		var result = form.render();
		Window.setContent(result);
		Window.display();

		// Hide fieldset for File and Book PROD types since only normal PROD is allowed
		if (this.namespace !== 'article') {
			$(result).find('#prodtype_fieldset').hide();
		}

		// Fake a change event on the first prod type radio, to initialize the type-dependent controls
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.prodtype[0].dispatchEvent(evt);
	}

	prodtypechanged(event) {
		// prepare frame for prod type dependant controls
		var field = new Morebits.quickForm.element({
			type: 'field',
			label: 'Parameters',
			name: 'parameters',
		});
		// create prod type dependant controls
		switch (event.target.values) {
			case 'prod':
				field.append({
					type: 'checkbox',
					list: [
						{
							label: 'Notify page creator if possible',
							value: 'notify',
							name: 'notify',
							tooltip: "A notification template will be placed on the creator's talk page if this is true.",
							checked: true,
						},
					],
				});
				field.append({
					type: 'textarea',
					name: 'reason',
					label: 'Reason for proposed deletion:',
					value: this.defaultReason,
				});
				break;

			case 'prodblp':
				// first, remember the prod value that the user entered in the textarea, in case they want to switch back. We can abuse the config field for that.
				if (event.target.form.reason) {
					this.defaultReason = event.target.form.reason.value;
				}

				field.append({
					type: 'checkbox',
					list: [
						{
							label: 'Notify page creator if possible',
							value: 'notify',
							name: 'notify',
							tooltip: 'Creator of article has to be notified.',
							checked: true,
							disabled: true,
						},
					],
				});
				// temp warning, can be removed down the line once BLPPROD is more established. Amalthea, May 2010.
				var boldtext = document.createElement('b');
				boldtext.appendChild(
					document.createTextNode(
						'Please note that only unsourced biographies of living persons are eligible for this tag, narrowly construed.'
					)
				);
				field.append({
					type: 'div',
					label: boldtext,
				});
				break;

			default:
				break;
		}

		makeFindSourcesDiv('#twinkle-prod-findsources');

		event.target.form.replaceChild(field.render(), $(event.target.form).find('fieldset[name="parameters"]')[0]);
	}

	checkPriors() {
		var talk_title = new mw.Title(mw.config.get('wgPageName')).getTalkPage().getPrefixedText();
		// Talk page templates for PROD-able discussions
		var blocking_templates =
			'Template:Old XfD multi|Template:Old MfD|Template:Oldffdfull|' + // Common prior XfD talk page templates
			'Template:Oldpuffull|' + // Legacy prior XfD template
			'Template:Olddelrev|' + // Prior DRV template
			'Template:Old prod';
		var query = {
			action: 'query',
			titles: talk_title,
			prop: 'templates',
			tltemplates: blocking_templates,
			format: 'json',
		};

		var wikipedia_api = new Api('Checking talk page for prior nominations', query);
		return wikipedia_api.post().then((apiobj) => {
			var statelem = apiobj.getStatusElement();

			// Check talk page for templates indicating prior XfD or PROD
			var templates = apiobj.getResponse().query.pages[0].templates;
			var numTemplates = templates && templates.length;
			if (numTemplates) {
				var template = templates[0].title;
				if (numTemplates === 1 && template === 'Template:Old prod') {
					this.params.oldProdPresent = true; // Mark for reference later, when deciding if to endorse
					// if there are multiple templates, at least one of them would be a prior xfd template
				} else {
					statelem.warn('Previous XfD template found on talk page, aborting procedure');
					return $.Deferred().reject();
				}
			}
		});
	}

	fetchCreationInfo() {
		var params = this.params;
		var ts = new Page(mw.config.get('wgPageName'), 'Looking up page creator');
		ts.setFollowRedirect(true); // for NPP, and also because redirects are ineligible for PROD
		ts.setLookupNonRedirectCreator(true); // Look for author of first non-redirect revision
		return ts.lookupCreation().then(() => {
			params.initialContrib = ts.getCreator();
			params.creation = ts.getCreationTimestamp();
			ts.getStatusElement().info('Done, found ' + params.initialContrib);
		});
	}

	taggingPage() {
		var def = $.Deferred();
		var params = this.params;

		var pageobj = new Page(mw.config.get('wgPageName'), 'Tagging page');
		pageobj.setFollowRedirect(true); // for NPP, and also because redirects are ineligible for PROD
		return pageobj.load().then(() => {
			var statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error("It seems that the page doesn't exist. Perhaps it has already been deleted.");
				// reject, so that all dependent actions like notifyAuthor() and
				// addToLog() are cancelled
				return def.reject();
			}

			var text = pageobj.getPageText();

			// Check for already existing deletion tags
			var tag_re = /{{(?:db-?|delete|article for deletion\/dated|AfDM|ffd\b)|#invoke:Redirect for discussion/i;
			if (tag_re.test(text)) {
				statelem.warn('Page already tagged with a deletion template, aborting procedure');
				return def.reject();
			}

			// Remove tags that become superfluous with this action
			text = text.replace(
				/{{\s*(userspace draft|mtc|(copy|move) to wikimedia commons|(copy |move )?to ?commons)\s*(\|(?:{{[^{}]*}}|[^{}])*)?}}\s*/gi,
				''
			);
			var prod_re = /{{\s*(?:Prod blp|Proposed deletion|book-prod)\/dated(?: files)?\s*\|(?:{{[^{}]*}}|[^{}])*}}/i;
			var summaryText;

			if (!prod_re.test(text)) {
				// Page previously PROD-ed
				if (params.oldProdPresent) {
					if (params.blp) {
						if (
							!confirm('Previous PROD nomination found on talk page. Do you still want to continue applying BLPPROD? ')
						) {
							statelem.warn('Previous PROD found on talk page, aborted by user');
							return def.reject();
						}
						statelem.info('Previous PROD found on talk page, continuing');
					} else {
						statelem.warn('Previous PROD found on talk page, aborting procedure');
						return def.reject();
					}
				}

				// Alert if article is at least three days old, not in Category:Living people, and BLPPROD is selected
				if (params.blp) {
					var isMoreThan3DaysOld = new Morebits.date(params.creation)
						.add(3, 'days')
						.isAfter(new Date(pageobj.getLoadTime()));
					var blpcheck_re = /\[\[Category:Living people\]\]/i;
					if (!blpcheck_re.test(text) && isMoreThan3DaysOld) {
						if (
							!confirm(
								'Please note that the article is not in Category:Living people and hence may be ineligible for BLPPROD. Are you sure you want to continue? \n\nYou may wish to add the category if you proceed, unless the article is about a recently deceased person.'
							)
						) {
							return def.reject();
						}
					}
				}

				var tag;
				if (params.blp) {
					summaryText = 'Proposing article for deletion per [[WP:BLPPROD]].';
					tag = '{{subst:prod blp' + (params.usertalk ? '|help=off' : '') + '}}';
				} else if (params.book) {
					summaryText = 'Proposing book for deletion per [[WP:BOOKPROD]].';
					tag =
						'{{subst:book-prod|1=' +
						Morebits.string.formatReasonText(params.reason) +
						(params.usertalk ? '|help=off' : '') +
						'}}';
				} else {
					summaryText = 'Proposing ' + this.namespace + ' for deletion per [[WP:PROD]].';
					tag =
						'{{subst:prod|1=' +
						Morebits.string.formatReasonText(params.reason) +
						(params.usertalk ? '|help=off' : '') +
						'}}';
				}

				// Insert tag after short description or any hatnotes
				var wikipage = new Morebits.wikitext.page(text);
				text = wikipage.insertAfterTemplates(tag + '\n', hatnoteRegex).getText();
			} else {
				// already tagged for PROD, so try endorsing it
				var prod2_re = /{{(?:Proposed deletion endorsed|prod-?2).*?}}/i;
				if (prod2_re.test(text)) {
					statelem.warn(
						'Page already tagged with {{proposed deletion}} and {{proposed deletion endorsed}} templates, aborting procedure'
					);
					return def.reject();
				}
				var confirmtext =
					'A {{proposed deletion}} tag was already found on this page. \nWould you like to add a {{proposed deletion endorsed}} tag with your explanation?';
				if (params.blp && !/{{\s*Prod blp\/dated/.test(text)) {
					confirmtext =
						'A non-BLP {{proposed deletion}} tag was found on this article.\nWould you like to add a {{proposed deletion endorsed}} tag with explanation "article is a biography of a living person with no sources"?';
				}
				if (!confirm(confirmtext)) {
					statelem.warn('Aborted per user request');
					return def.reject();
				}

				summaryText =
					'Endorsing proposed deletion per [[WP:' + (params.blp ? 'BLP' : params.book ? 'BOOK' : '') + 'PROD]].';
				text = text.replace(
					prod_re,
					text.match(prod_re) +
						'\n{{Proposed deletion endorsed|1=' +
						(params.blp
							? 'article is a [[WP:BLPPROD|biography of a living person with no sources]]'
							: Morebits.string.formatReasonText(params.reason)) +
						'}}\n'
				);

				params.logEndorsing = true;
			}

			// curate/patrol the page
			if (Twinkle.getPref('markProdPagesAsPatrolled')) {
				pageobj.triage();
			}

			pageobj.setPageText(text);
			pageobj.setEditSummary(summaryText);
			pageobj.setWatchlist(Twinkle.getPref('watchProdPages'));
			pageobj.setCreateOption('nocreate');
			return pageobj.save();
		});
	}

	addOldProd() {
		if (this.params.oldProdPresent) {
			return $.Deferred().resolve();
		}

		// Add {{Old prod}} to the talk page
		var oldprodfull = '{{Old prod|nom=' + mw.config.get('wgUserName') + '|nomdate={{subst:#time: Y-m-d}}}}\n';
		var talktitle = new mw.Title(mw.config.get('wgPageName')).getTalkPage().getPrefixedText();
		var talkpage = new Page(talktitle, 'Placing {{Old prod}} on talk page');
		talkpage.setPrependText(oldprodfull);
		talkpage.setEditSummary('Adding {{Old prod}}');
		talkpage.setFollowRedirect(true); // match behavior for page tagging
		talkpage.setCreateOption('recreate');
		return talkpage.prepend();
	}

	notifyAuthor() {
		var def = $.Deferred();
		var params = this.params;

		if (!params.blp && !params.usertalk) {
			return def.resolve();
		}

		// Disallow warning yourself
		if (params.initialContrib === mw.config.get('wgUserName')) {
			Morebits.status.info(
				'Notifying creator',
				'You (' + params.initialContrib + ') created this page; skipping user notification'
			);
			return def.resolve();
		}
		// [[Template:Proposed deletion notify]] supports File namespace
		var notifyTemplate;
		if (params.blp) {
			notifyTemplate = 'prodwarningBLP';
		} else if (params.book) {
			notifyTemplate = 'bprodwarning';
		} else {
			notifyTemplate = 'proposed deletion notify';
		}
		var notifytext =
			'\n{{subst:' + notifyTemplate + '|1=' + Morebits.pageNameNorm + '|concern=' + params.reason + '}} ~~~~';

		var user = new Morebits.wiki.user(
			params.initialContrib,
			'Notifying initial contributor (' + params.initialContrib + ')'
		);
		user.setMessage(notifytext);
		user.setReason('Notification: proposed deletion of [[:' + Morebits.pageNameNorm + ']].');
		user.setChangeTags(Twinkle.changeTags);
		// Notify everyone for BLPPROD, allow optouts otherwise
		if (params.blp) {
			user.setNotifyBots(true);
			user.setNotifyIndef(true);
		} else {
			user.setNotifySkips(makeOptoutLink('prod'), optoutTemplates);
		}
		user.notify(function onNotifySuccess() {
			// add nomination to the userspace log, if the user has enabled it
			params.logInitialContrib = params.initialContrib;
			def.resolve();
		}, def.resolve); // resolves even if notification was unsuccessful

		return def;
	}

	addToLog() {
		if (!Twinkle.getPref('logProdPages')) {
			return $.Deferred().resolve();
		}
		var params = this.params;
		var usl = new Morebits.userspaceLogger(Twinkle.getPref('prodLogPageName'));
		usl.initialText =
			"This is a log of all [[WP:PROD|proposed deletion]] tags applied or endorsed by this user using [[WP:TW|Twinkle]]'s PROD module.\n\n" +
			'If you no longer wish to keep this log, you can turn it off using the [[Wikipedia:Twinkle/Preferences|preferences panel]], and ' +
			'nominate this page for speedy deletion under [[WP:CSD#U1|CSD U1]].\n';

		var logText = '# [[:' + Morebits.pageNameNorm + ']]';
		var summaryText;
		// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
		logText +=
			this.namespace === 'file'
				? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} log]): '
				: ': ';
		if (params.logEndorsing) {
			logText += 'endorsed ' + (params.blp ? 'BLP ' : params.book ? 'BOOK' : '') + 'PROD. ~~~~~';
			if (params.reason) {
				logText += "\n#* '''Reason''': " + params.reason + '\n';
			}
			summaryText = 'Logging endorsement of PROD nomination of [[:' + Morebits.pageNameNorm + ']].';
		} else {
			logText += (params.blp ? 'BLP ' : params.book ? 'BOOK' : '') + 'PROD';
			if (params.logInitialContrib) {
				logText += '; notified {{user|' + params.logInitialContrib + '}}';
			}
			logText += ' ~~~~~\n';
			if (!params.blp && params.reason) {
				logText += "#* '''Reason''': " + Morebits.string.formatReasonForLog(params.reason) + '\n';
			}
			summaryText = 'Logging PROD nomination of [[:' + Morebits.pageNameNorm + ']].';
		}
		usl.changeTags = Twinkle.changeTags;

		return usl.log(logText, summaryText);
	}

	evaluate(e) {
		var form = e.target;
		var input = Morebits.quickForm.getInputData(form);

		this.params = {
			usertalk: (input.notify as boolean) || input.prodtype === 'prodblp',
			blp: input.prodtype === 'prodblp',
			book: this.namespace === 'book',
			reason: (input.reason as string) || '', // using an empty string here as fallback will help with prod-2.
		};

		if (!this.params.blp && !this.params.reason) {
			if (!confirm('You left the reason blank, do you really want to continue without providing one?')) {
				return;
			}
		}

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);

		var tm = new Morebits.taskManager(this);

		// Disable Morebits.wiki.numberOfActionsLeft system
		Morebits.wiki.numberOfActionsLeft = 1000;

		// checkPriors() and fetchCreationInfo() have no dependencies, they'll run first
		tm.add(this.checkPriors, []);
		tm.add(this.fetchCreationInfo, []);
		// tag the page once we're clear of the pre-requisites
		tm.add(this.taggingPage, [this.checkPriors]);
		// notify the author once we know who's the author, and also wait for the
		// taggingPage() as we don't need to notify if tagging was not done, such as
		// there was already a tag and the user chose not to endorse.
		tm.add(this.notifyAuthor, [this.fetchCreationInfo, this.taggingPage]);
		// oldProd needs to be added only if there wasn't one before, so need to wait
		// for checkPriors() to finish. Also don't add oldProd if tagging itself was
		// aborted or unsuccessful
		tm.add(this.addOldProd, [this.taggingPage, this.checkPriors]);
		// add to log only after notifying author so that the logging can be adjusted if
		// notification wasn't successful. Also, don't run if tagging was not done.
		tm.add(this.addToLog, [this.notifyAuthor, this.taggingPage]);
		// All set, go!
		tm.execute().then(() => {
			Morebits.status.actionCompleted('Tagging complete');
			setTimeout(() => {
				window.location.href = mw.util.getUrl(mw.config.get('wgPageName'));
			}, Morebits.wiki.actionCompleted.timeOut);
		});
	}
}
