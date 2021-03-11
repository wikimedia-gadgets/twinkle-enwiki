/**
 * Functions or expressions shared across multiple modules
 */

// Various hatnote templates, used when tagging (csd/xfd/tag/prod/protect) to
// ensure MOS:ORDER
export const hatnoteRegex =
	'short description|hatnote|main|correct title|dablink|distinguish|for|further|selfref|year dab|similar names|highway detail hatnote|broader|about(?:-distinguish| other people)?|other\\s?(?:hurricane(?: use)?s|people|persons|places|ships|uses(?: of)?)|redirect(?:-(?:distinguish|synonym|multi))?|see\\s?(?:wiktionary|also(?: if exists)?)';

// Used in XFD and PROD
export function makeFindSourcesDiv() {
	let makeLink = function (href: string, text: string) {
		return $('<a>').attr({ rel: 'nofollow', class: 'external text', target: '_blank', href: href }).text(text);
	};
	let title = encodeURIComponent(Morebits.pageNameNorm);
	return $('<div>')
		.addClass('plainlinks')
		.append(
			'(',
			$('<i>').text('Find sources:'),
			' ',
			makeLink('//www.google.com/search?as_eq=wikipedia&q=%22' + title + '%22', 'Google'),
			' (',
			makeLink('//www.google.com/search?tbs=bks:1&q=%22' + title + '%22+-wikipedia', 'books'),
			' - ',
			makeLink('//www.google.com/search?tbm=nws&q=%22' + title + '%22+-wikipedia', 'news'),
			' - ',
			makeLink(
				'//www.google.com/search?&q=%22' + title + '%22+site:news.google.com/newspapers&source=newspapers',
				'newspapers'
			),
			' - ',
			makeLink('//scholar.google.com/scholar?q=%22' + title + '%22', 'scholar'),
			' - ',
			makeLink(
				'https://www.google.com/search?safe=off&tbs=sur:fmc&tbm=isch&q=%22' +
					title +
					'%22+-site:wikipedia.org+-site:wikimedia.org',
				'free images'
			),
			' - ',
			makeLink(
				'https://www.google.com/custom?hl=en&cx=007734830908295939403%3Agalkqgoksq0&cof=FORID%3A13%3BAH%3Aleft%3BCX%3AWikipedia%2520Reference%2520Search&q=%22' +
					title +
					'%22',
				'WP refs'
			),
			')',
			' - ',
			makeLink('https://en.wikipedia.org/wiki/Wikipedia:Free_English_newspaper_sources', 'FENS'),
			' - ',
			makeLink('https://www.jstor.org/action/doBasicSearch?Query=%22' + title + '%22&acc=on&wc=on', 'JSTOR'),
			' - ',
			makeLink('https://www.nytimes.com/search/%22' + title + '%22', 'NYT'),
			' - ',
			makeLink('https://wikipedialibrary.wmflabs.org/partners/', 'TWL'),
			')'
		)[0];
}
