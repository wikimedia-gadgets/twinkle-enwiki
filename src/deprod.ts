import { generateBatchPageLinks, sortByNamespace, Twinkle, TwinkleModule, getPref } from './core';

export class Deprod extends TwinkleModule {
	moduleName = 'deprod';
	static moduleName = 'deprod';

	portletName = 'Deprod';
	portletTooltip = 'Delete prod pages found in this category';
	portletId = 'twinkle-deprod';

	constructor() {
		super();
		if (
			!Morebits.userIsSysop ||
			mw.config.get('wgNamespaceNumber') !== 14 ||
			!/proposed_deletion/i.test(mw.config.get('wgPageName'))
		) {
			return;
		}
		this.addMenu();
	}

	concerns: Record<string, string> = {};

	makeWindow() {
		var Window = new Morebits.simpleWindow(800, 400);
		Window.setTitle('PROD cleaning');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Proposed deletion', 'WP:PROD');
		Window.addFooterLink('Twinkle help', 'WP:TW/DOC#deprod');
		Window.addFooterLink('Give feedback', 'WT:TW');

		var form = new Morebits.quickForm((e) => this.evaluate(e));

		var statusdiv = document.createElement('div');
		statusdiv.style.padding = '15px'; // just so it doesn't look broken
		Window.setContent(statusdiv);
		Morebits.status.init(statusdiv);
		Window.display();

		var query = {
			action: 'query',
			generator: 'categorymembers',
			gcmtitle: mw.config.get('wgPageName'),
			gcmlimit: getPref('batchMax'),
			gcmnamespace: '0|108|2', // mostly to ignore categories and files
			prop: 'info|revisions',
			rvprop: 'content',
			inprop: 'protection',
			format: 'json',
		};

		var statelem = new Morebits.status('Grabbing list of pages');
		var wikipedia_api = new Morebits.wiki.api(
			'loading...',
			query,
			(apiobj) => {
				var response = apiobj.getResponse();
				var pages = (response.query && response.query.pages) || [];
				var list = [];
				var re = /\{\{Proposed deletion/;
				pages.sort(sortByNamespace);
				pages.forEach((page) => {
					var metadata = [];

					var content = page.revisions[0].content;
					var res = re.exec(content);
					var title = page.title;
					if (res) {
						var parsed = Morebits.wikitext.parseTemplate(content, res.index);
						this.concerns[title] = parsed.parameters.concern || '';
						metadata.push(this.concerns[title]);
					}

					var editProt = page.protection
						.filter((pr) => {
							return pr.type === 'edit' && pr.level === 'sysop';
						})
						.pop();
					if (editProt) {
						metadata.push(
							'fully protected' + (editProt.expiry === 'infinity' ? ' indefinitely' : ', expires ' + editProt.expiry)
						);
					}

					list.push({
						label: metadata.length ? '(' + metadata.join('; ') + ')' : '',
						value: title,
						checked: this.concerns[title] !== '',
						style: editProt ? 'color:red' : '',
					});
				});
				apiobj.params.form.append({ type: 'header', label: 'Pages to delete' });
				apiobj.params.form.append({
					type: 'button',
					label: 'Select All',
					event: (e) => {
						$(Morebits.quickForm.getElements(e.target.form, 'pages')).prop('checked', true);
					},
				});
				apiobj.params.form.append({
					type: 'button',
					label: 'Deselect All',
					event: (e) => {
						$(Morebits.quickForm.getElements(e.target.form, 'pages')).prop('checked', false);
					},
				});
				apiobj.params.form.append({
					type: 'checkbox',
					name: 'pages',
					list: list,
				});
				apiobj.params.form.append({
					type: 'submit',
				});

				var rendered = apiobj.params.form.render();
				apiobj.params.Window.setContent(rendered);
				Morebits.quickForm.getElements(rendered, 'pages').forEach(generateBatchPageLinks);
			},
			statelem
		);

		wikipedia_api.params = { form: form, Window: Window };
		wikipedia_api.post();
	}

	deleteTalk(apiobj: Morebits.wiki.api) {
		// no talk page; forget about it
		if (apiobj.getResponse().query.pages[0].missing) {
			return;
		}

		var page = new Morebits.wiki.page('Talk:' + apiobj.params.page, 'Deleting talk page of page ' + apiobj.params.page);
		page.setEditSummary('[[WP:CSD#G8|G8]]: [[Help:Talk page|Talk page]] of deleted page "' + apiobj.params.page + '"');
		page.setChangeTags(Twinkle.changeTags);
		page.deletePage();
	}

	deleteRedirects(apiobj: Morebits.wiki.api) {
		var response = apiobj.getResponse();
		var redirects = response.query.pages[0].redirects || [];
		redirects.forEach((rd) => {
			var title = rd.title;
			var page = new Morebits.wiki.page(title, 'Deleting redirecting page ' + title);
			page.setEditSummary('[[WP:CSD#G8|G8]]: Redirect to deleted page "' + apiobj.params.page + '"');
			page.setChangeTags(Twinkle.changeTags);
			page.deletePage();
		});
	}

	evaluate(event: FormSubmitEvent) {
		var pages = Morebits.quickForm.getInputData(event.target).pages as string[];
		Morebits.status.init(event.target);

		var batchOperation = new Morebits.batchOperation('Deleting pages');
		batchOperation.setOption('chunkSize', getPref('batchChunks'));
		batchOperation.setOption('preserveIndividualStatusLines', true);
		batchOperation.setPageList(pages);
		batchOperation.run((pageName: string) => {
			var params = { page: pageName };

			var wikipedia_api = new Morebits.wiki.api(
				'Grabbing redirects',
				{
					action: 'query',
					titles: pageName,
					prop: 'redirects',
					rdlimit: 'max', // 500 is max for normal users, 5000 for bots and sysops
					format: 'json',
				},
				this.deleteRedirects
			);
			wikipedia_api.params = params;
			wikipedia_api.post();

			var pageTitle = mw.Title.newFromText(pageName);
			// Don't delete user talk pages, essentially limiting this to Talk: and Book talk:
			if (pageTitle && pageTitle.namespace % 2 === 0 && pageTitle.namespace !== 2) {
				pageTitle.namespace++; // now pageTitle is the talk page title!
				wikipedia_api = new Morebits.wiki.api(
					'Checking whether ' + pageName + ' has a talk page',
					{
						action: 'query',
						titles: pageTitle.toText(),
						format: 'json',
					},
					this.deleteTalk
				);
				wikipedia_api.params = params;
				wikipedia_api.post();
			}

			var page = new Morebits.wiki.page(pageName, 'Deleting page ' + pageName);
			page.setEditSummary('Expired [[WP:PROD|PROD]], concern was: ' + this.concerns[pageName]);
			page.setChangeTags(Twinkle.changeTags);
			page.suppressProtectWarning();
			page.deletePage(batchOperation.workerSuccess, batchOperation.workerFailure);
		});
	}
}
