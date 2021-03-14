import { Twinkle, TwinkleModule } from './core';

export class Shared extends TwinkleModule {
	moduleName = 'shared';
	static moduleName = 'shared';

	constructor() {
		super();
		if (mw.config.get('wgNamespaceNumber') === 3 && mw.util.isIPAddress(mw.config.get('wgTitle'))) {
			Twinkle.addPortletLink(
				function () {
					Shared.callback();
				},
				'Shared IP',
				'twinkle-shared',
				'Shared IP tagging'
			);
		}
	}

	static callback() {
		var Window = new Morebits.simpleWindow(600, 450);
		Window.setTitle('Shared IP address tagging');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Shared prefs', 'WP:TW/PREF#shared');
		Window.addFooterLink('Twinkle help', 'WP:TW/DOC#shared');
		Window.addFooterLink('Give feedback', 'WT:TW');

		var form = new Morebits.quickForm(Shared.evaluate);

		var div = form.append({
			type: 'div',
			id: 'sharedip-templatelist',
			className: 'morebits-scrollbox',
		});
		div.append({ type: 'header', label: 'Shared IP address templates' });
		div.append({
			type: 'radio',
			name: 'template',
			list: Shared.standardList,
			event: function (e) {
				Shared.change_shared(e);
				e.stopPropagation();
			},
		});

		var org = form.append({ type: 'field', label: 'Fill in other details (optional) and click "Submit"' });
		org.append({
			type: 'input',
			name: 'organization',
			label: 'IP address owner/operator',
			disabled: true,
			tooltip:
				'You can optionally enter the name of the organization that owns/operates the IP address.  You can use wikimarkup if necessary.',
		});
		org.append({
			type: 'input',
			name: 'host',
			label: 'Host name (optional)',
			disabled: true,
			tooltip:
				'The host name (for example, proxy.example.com) can be optionally entered here and will be linked by the template.',
		});
		org.append({
			type: 'input',
			name: 'contact',
			label: 'Contact information (only if requested)',
			disabled: true,
			tooltip:
				'You can optionally enter some contact details for the organization.  Use this parameter only if the organization has specifically requested that it be added.  You can use wikimarkup if necessary.',
		});

		var previewlink = document.createElement('a');
		$(previewlink).click(function () {
			Shared.preview(result);
		});
		previewlink.style.cursor = 'pointer';
		previewlink.textContent = 'Preview';
		form.append({ type: 'div', id: 'sharedpreview', label: [previewlink] });
		form.append({ type: 'submit' });

		var result = form.render();
		Window.setContent(result);
		Window.display();
	}

	static standardList = [
		{
			label: '{{Shared IP}}: standard shared IP address template',
			value: 'Shared IP',
			tooltip:
				'IP user talk page template that shows helpful information to IP users and those wishing to warn, block or ban them',
		},
		{
			label: '{{Shared IP edu}}: shared IP address template modified for educational institutions',
			value: 'Shared IP edu',
		},
		{
			label: '{{Shared IP corp}}: shared IP address template modified for businesses',
			value: 'Shared IP corp',
		},
		{
			label: '{{Shared IP public}}: shared IP address template modified for public terminals',
			value: 'Shared IP public',
		},
		{
			label: '{{Shared IP gov}}: shared IP address template modified for government agencies or facilities',
			value: 'Shared IP gov',
		},
		{
			label: '{{Dynamic IP}}: shared IP address template modified for organizations with dynamic addressing',
			value: 'Dynamic IP',
		},
		{
			label: '{{Static IP}}: shared IP address template modified for static IP addresses',
			value: 'Static IP',
		},
		{
			label: '{{ISP}}: shared IP address template modified for ISP organizations (specifically proxies)',
			value: 'ISP',
		},
		{
			label: '{{Mobile IP}}: shared IP address template modified for mobile phone companies and their customers',
			value: 'Mobile IP',
		},
		{
			label:
				'{{Whois}}: template for IP addresses in need of monitoring, but unknown whether static, dynamic or shared',
			value: 'Whois',
		},
	];

	static change_shared(e) {
		e.target.form.contact.disabled = e.target.value !== 'Shared IP edu'; // only supported by {{Shared IP edu}}
		e.target.form.organization.disabled = false;
		e.target.form.host.disabled = e.target.value === 'Whois'; // host= not supported by {{Whois}}
	}

	static callbacks = {
		main: function (pageobj) {
			var params = pageobj.getCallbackParameters();
			var pageText = pageobj.getPageText();
			var found = false;

			for (var i = 0; i < Shared.standardList.length; i++) {
				var tagRe = new RegExp('(\\{\\{' + Shared.standardList[i].value + '(\\||\\}\\}))', 'im');
				if (tagRe.exec(pageText)) {
					Morebits.status.warn(
						'Info',
						'Found {{' + Shared.standardList[i].value + "}} on the user's talk page already...aborting"
					);
					found = true;
				}
			}

			if (found) {
				return;
			}

			Morebits.status.info('Info', "Will add the shared IP address template to the top of the user's talk page.");
			var text = Shared.getTemplateWikitext(params);

			var summaryText = 'Added {{[[Template:' + params.template + '|' + params.template + ']]}} template.';
			pageobj.setPageText(text + pageText);
			pageobj.setEditSummary(summaryText);
			pageobj.setChangeTags(Twinkle.changeTags);
			pageobj.setMinorEdit(Twinkle.getPref('markSharedIPAsMinor'));
			pageobj.setCreateOption('recreate');
			pageobj.save();
		},
	};

	static preview(form) {
		var input = Morebits.quickForm.getInputData(form);
		if (input.template) {
			var previewDialog = new Morebits.simpleWindow(700, 500);
			previewDialog.setTitle('Shared IP template preview');
			previewDialog.setScriptName('Add Shared IP template');
			previewDialog.setModality(true);

			var previewdiv = document.createElement('div');
			previewdiv.style.marginLeft = previewdiv.style.marginRight = '0.5em';
			previewdiv.style.fontSize = 'small';
			previewDialog.setContent(previewdiv);

			var previewer = new Morebits.wiki.preview(previewdiv);
			previewer.beginRender(Shared.getTemplateWikitext(input), mw.config.get('wgPageName'));

			var submit = document.createElement('input');
			submit.setAttribute('type', 'submit');
			submit.setAttribute('value', 'Close');
			previewDialog.addContent(submit);

			previewDialog.display();

			$(submit).click(function () {
				previewDialog.close();
			});
		}
	}

	static getTemplateWikitext(input) {
		var text = '{{' + input.template + '|' + input.organization;
		if (input.contact) {
			text += '|' + input.contact;
		}
		if (input.host) {
			text += '|host=' + input.host;
		}
		text += '}}\n\n';
		return text;
	}

	static evaluate(e) {
		var params = Morebits.quickForm.getInputData(e.target);
		if (!params.template) {
			alert('You must select a shared IP address template to use!');
			return;
		}
		if (!params.organization) {
			alert('You must input an organization for the {{' + params.template + '}} template!');
			return;
		}

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(e.target);

		Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
		Morebits.wiki.actionCompleted.notice = 'Tagging complete, reloading talk page in a few seconds';

		var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'User talk page modification');
		wikipedia_page.setFollowRedirect(true);
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.load(Shared.callbacks.main);
	}
}
