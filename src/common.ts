/**
 * Functions or expressions shared across multiple modules
 */

// Various hatnote templates, used when tagging (csd/xfd/tag/prod/protect) to
// ensure MOS:ORDER
export const hatnoteRegex =
	'short description|hatnote|main|correct title|dablink|distinguish|for|further|selfref|year dab|similar names|highway detail hatnote|broader|about(?:-distinguish| other people)?|other\\s?(?:hurricane(?: use)?s|people|persons|places|ships|uses(?: of)?)|redirect(?:-(?:distinguish|synonym|multi))?|see\\s?(?:wiktionary|also(?: if exists)?)';

let findSources: string;

// Used in XFD and PROD
export function makeFindSourcesDiv(divID) {
	if (!$(divID).length) {
		return;
	}
	if (!findSources) {
		var parser = new Morebits.wiki.preview($(divID)[0]);
		parser.beginRender('({{Find sources|' + Morebits.pageNameNorm + '}})', 'WP:AFD').then(function () {
			// Save for second-time around
			findSources = parser.previewbox.innerHTML;
			$(divID).removeClass('morebits-previewbox');
		});
	} else {
		$(divID).html(findSources);
	}
}

export const optoutTemplates = ['Template:Retired', 'Template:Deceased Wikipedian'];
