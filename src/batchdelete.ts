import { Twinkle, TwinkleModule } from '../../twinkle-core/src/twinkle';

class Batchdelete extends TwinkleModule {

	moduleName = 'batchdelete';

	subpagesLoaded = false;

	constructor() {
		super();
		if (Morebits.userIsSysop && (
			(mw.config.get('wgCurRevisionId') && mw.config.get('wgNamespaceNumber') > 0) ||
			mw.config.get('wgCanonicalSpecialPageName') === 'Prefixindex')
		) {
			this.portletId = 'twinkle-batchdelete';
			this.portletName = 'D-batch';
			this.portletTooltip = 'Delete pages found in this category/on this page';
			this.addMenu();
		}
	}

	makeWindow() {
		this.subpagesLoaded = false;
		var Window = new Morebits.simpleWindow(600, 400);
		Window.setTitle('Batch deletion');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Twinkle help', 'WP:TW/DOC#batchdelete');

		var form = new Morebits.quickForm(Twinkle.batchdelete.callback.evaluate);
		form.append({
			type: 'checkbox',
			list: [
				{
					label: 'Delete pages',
					name: 'delete_page',
					value: 'delete',
					checked: true,
					subgroup: {
						type: 'checkbox',
						list: [
							{
								label: 'Delete associated talk pages (except user talk pages)',
								name: 'delete_talk',
								checked: true
							},
							{
								label: 'Delete redirects to deleted pages',
								name: 'delete_redirects',
								checked: true
							},
							{
								label: 'Delete subpages of deleted pages',
								name: 'delete_subpages',
								checked: false,
								event: Twinkle.batchdelete.callback.toggleSubpages,
								subgroup: {
									type: 'checkbox',
									list: [
										{
											label: 'Delete talk pages of deleted subpages',
											name: 'delete_subpage_talks',
										},
										{
											label: 'Delete redirects to deleted subpages',
											name: 'delete_subpage_redirects',
										},
										{
											label: 'Unlink backlinks to each deleted subpage (in Main and Portal namespaces only)',
											name: 'unlink_subpages',
										}
									]
								}
							}
						]
					}
				},
				{
					label: 'Unlink backlinks to each page (in Main and Portal namespaces only)',
					name: 'unlink_page',
					checked: false
				},
				{
					label: 'Remove usages of each file (in all namespaces)',
					name: 'unlink_file',
					checked: true
				}
			]
		});
		form.append({
			type: 'input',
			name: 'reason',
			label: 'Reason: ',
			size: 60
		});

		var query = {
			action: 'query',
			prop: 'revisions|info|imageinfo',
			inprop: 'protection',
			rvprop: 'size|user',
			format: 'json'
		};

		// On categories
		if (mw.config.get('wgNamespaceNumber') === 14) {
			$.extend(query, {
				generator: 'categorymembers',
				gcmtitle: mw.config.get('wgPageName'),
				gcmlimit: Twinkle.getPref('batchMax'),
			});

		// On Special:PrefixIndex
		} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Prefixindex') {

			query.generator = 'allpages';
			query.gaplimit = Twinkle.getPref('batchMax');
			if (mw.util.getParamValue('prefix')) {
				query.gapnamespace = mw.util.getParamValue('namespace');
				query.gapprefix = mw.util.getParamValue('prefix');
			} else {
				var pathSplit = decodeURIComponent(location.pathname).split('/');
				if (pathSplit.length < 3 || pathSplit[2] !== 'Special:PrefixIndex') {
					return;
				}
				var titleSplit = pathSplit[3].split(':');
				query.gapnamespace = mw.config.get('wgNamespaceIds')[titleSplit[0].toLowerCase()];
				if (titleSplit.length < 2 || typeof query.gapnamespace === 'undefined') {
					query.gapnamespace = 0;  // article namespace
					query.gapprefix = pathSplit.splice(3).join('/');
				} else {
					pathSplit = pathSplit.splice(4);
					pathSplit.splice(0, 0, titleSplit.splice(1).join(':'));
					query.gapprefix = pathSplit.join('/');
				}
			}

		// On normal pages
		} else {
			$.extend(query, {
				generator: 'links',
				titles: mw.config.get('wgPageName'),
				gpllimit: Twinkle.getPref('batchMax'),
			});
		}

		var statusdiv = document.createElement('div');
		statusdiv.style.padding = '15px';  // just so it doesn't look broken
		Window.setContent(statusdiv);
		Morebits.status.init(statusdiv);
		Window.display();

		Twinkle.batchdelete.pages = {};

		var statelem = new Morebits.status('Grabbing list of pages');
		var wikipedia_api = new Morebits.wiki.api('loading...', query);
		wikipedia_api.setStatusElement(statelem);
		wikipedia_api.post().then(function(apiobj) {
			var response = apiobj.getResponse();
			var pages = (response.query && response.query.pages) || [];
			pages = pages.filter(function(page) {
				return !page.missing && page.imagerepository !== 'shared';
			});
			pages.forEach(function(page) {
				var metadata = [];
				if (page.redirect) {
					metadata.push('redirect');
				}

				var editProt = page.protection.filter(function(pr) {
					return pr.type === 'edit' && pr.level === 'sysop';
				}).pop();
				if (editProt) {
					metadata.push('fully protected' +
						(editProt.expiry === 'infinity' ? ' indefinitely' : ', expires ' + new Morebits.date(editProt.expiry).calendar('utc') + ' (UTC)'));
				}

				if (page.ns === 6) {  // mimic what delimages used to show for files
					metadata.push('uploader: ' + page.imageinfo[0].user);
					metadata.push('last edit from: ' + page.revisions[0].user);
				} else {
					metadata.push(mw.language.convertNumber(page.revisions[0].size) + ' bytes');
				}

				var title = page.title;
				Twinkle.batchdelete.pages[title] = {
					label: title + (metadata.length ? ' (' + metadata.join('; ') + ')' : ''),
					value: title,
					checked: true,
					style: editProt ? 'color:red' : ''
				};
			});

			form.append({ type: 'header', label: 'Pages to delete' });
			form.append({
				type: 'button',
				label: 'Select All',
				event: function dBatchSelectAll() {
					$(result).find('input[name=pages]:not(:checked)').each(function(_, e) {
						e.click(); // check it, and invoke click event so that subgroup can be shown
					});

					// Check any unchecked subpages too
					$('input[name="pages.subpages"]').prop('checked', true);
				}
			});
			form.append({
				type: 'button',
				label: 'Deselect All',
				event: function dBatchDeselectAll() {
					$(result).find('input[name=pages]:checked').each(function(_, e) {
						e.click(); // uncheck it, and invoke click event so that subgroup can be hidden
					});
				}
			});
			form.append({
				type: 'checkbox',
				name: 'pages',
				id: 'tw-dbatch-pages',
				shiftClickSupport: true,
				list: $.map(Twinkle.batchdelete.pages, function (e) {
					return e;
				})
			});
			form.append({ type: 'submit' });

			var result = form.render();
			Window.setContent(result);

			Morebits.quickForm.getElements(result, 'pages').forEach(generateArrowLinks);

		});
		wikipedia_api.post();
	}

}
