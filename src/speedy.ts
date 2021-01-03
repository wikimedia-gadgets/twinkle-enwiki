import { SpeedyCore, criterion } from "./core";
import { arr_includes } from './utils';
import { hatnoteRegex } from './common';

export class Speedy extends SpeedyCore {

	preprocessParamInputs() {
		let params = this.params; // shortcut reference
		if (params.banned_user) {
			params.banned_user = params.banned_user.replace(/^\s*User:/i, '');
		}
		if (params.redundantimage_filename) {
			params.redundantimage_filename = new mw.Title(params.redundantimage_filename, 6).toText();
		}
		if (params.commons_filename && params.commons_filename !== Morebits.pageNameNorm) {
			params.commons_filename = new mw.Title(params.commons_filename, 6).toText();
		}
	}

	validateInputs(): string | void {
		let input = this.params;
		let csd = new Set(input.csd); // optimise look-ups
		if (csd.has('userreq') &&
			mw.config.get('wgNamespaceNumber') === 3 &&
			!(/\//).test(mw.config.get('wgTitle')) &&
			!input.userreq_rationale
		) {
			return 'CSD U1:  Please specify a rationale when nominating user talk pages.';
		}
		if (csd.has('repost') &&
			input.repost_xfd &&
			!/^(?:wp|wikipedia):/i.test(input.repost_xfd)
		) {
			return 'CSD G4:  The deletion discussion page name, if provided, must start with "Wikipedia:".';
		}
		if (csd.has('xfd') &&
			input.xfd_fullvotepage &&
			!/^(?:wp|wikipedia):/i.test(input.xfd_fullvotepage)
		) {
			return 'CSD G6 (XFD):  The deletion discussion page name, if provided, must start with "Wikipedia:".';
		}
		if (csd.has('imgcopyvio') &&
			!input.imgcopyvio_url && !input.imgcopyvio_rationale
		) {
			return 'CSD F9: You must enter a url or reason (or both) when nominating a file under F9.';
		}
	}

	// Insert tag after short description or any hatnotes
	insertTagText(code, pageText) {
		let wikipage = new Morebits.wikitext.page(pageText);
		return wikipage.insertAfterTemplates(code + '\n', hatnoteRegex).getText();
	}

	criteriaLists: Array<{label: string, visible: ((self: Speedy) => boolean), list: Array<criterion>}> = [
		{
			label: 'Custom rationale',
			visible: (self) => !self.mode.isMultiple,
			list: [
				{
					label: 'Custom rationale' + (Morebits.userIsSysop ? ' (custom deletion reason)' : ' using {{db}} template'),
					value: 'reason',
					code: 'db',
					tooltip: '{{db}} is short for "delete because". At least one of the other deletion criteria must still apply to the page, and you must make mention of this in your rationale. This is not a "catch-all" for when you can\'t find any criteria that fit.',
					subgroup: {
						name: 'reason_1',
						parameter: '1',
						utparam: '2',
						type: 'input',
						label: 'Rationale: ',
						size: 60
					},
					hideWhenMultiple: true
				}
			]
		},
		{
			label: 'Talk pages',
			// show on talk pages, but not user talk pages
			visible: (self) => self.namespace % 2 === 1 && self.namespace !== 3,
			list: [
				{
					label: 'G8: Talk pages with no corresponding subject page',
					value: 'talk',
					code: 'g8',
					tooltip: 'This excludes any page that is useful to the project - in particular, user talk pages, talk page archives, and talk pages for files that exist on Wikimedia Commons.'
				}
			]
		},
		{
			label: 'Files',
			visible: (self) => !self.isRedirect && arr_includes([6, 7], self.namespace),
			list: [
				{
					label: 'F1: Redundant file',
					value: 'redundantimage',
					code: 'f1',
					tooltip: 'Any file that is a redundant copy, in the same file format and same or lower resolution, of something else on Wikipedia. Likewise, other media that is a redundant copy, in the same format and of the same or lower quality. This does not apply to files duplicated on Wikimedia Commons, because of licence issues; these should be tagged with {{subst:ncd|Image:newname.ext}} or {{subst:ncd}} instead',
					subgroup: {
						name: 'redundantimage_filename',
						parameter: 'filename',
						log: '[[:$1]]',
						type: 'input',
						label: 'File this is redundant to: ',
						tooltip: 'The "File:" prefix can be left off.'
					}
				},
				{
					label: 'F2: Corrupt, missing, or empty file',
					value: 'noimage',
					code: 'f2',
					tooltip: 'Before deleting this type of file, verify that the MediaWiki engine cannot read it by previewing a resized thumbnail of it. This also includes empty (i.e., no content) file description pages for Commons files'
				},
				{
					label: 'F2: Unneeded file description page for a file on Commons',
					value: 'fpcfail',
					code: 'f2',
					tooltip: 'An image, hosted on Commons, but with tags or information on its English Wikipedia description page that are no longer needed. (For example, a failed featured picture candidate.)',
					hideWhenMultiple: true
				},
				{
					label: 'F3: Improper license',
					value: 'noncom',
					code: 'f3',
					tooltip: 'Files licensed as "for non-commercial use only", "non-derivative use" or "used with permission" that were uploaded on or after 2005-05-19, except where they have been shown to comply with the limited standards for the use of non-free content. This includes files licensed under a "Non-commercial Creative Commons License". Such files uploaded before 2005-05-19 may also be speedily deleted if they are not used in any articles'
				},
				{
					label: 'F4: Lack of licensing information',
					value: 'unksource',
					code: 'f4',
					tooltip: 'Files in category "Files with unknown source", "Files with unknown copyright status", or "Files with no copyright tag" that have been tagged with a template that places them in the category for more than seven days, regardless of when uploaded. Note, users sometimes specify their source in the upload summary, so be sure to check the circumstances of the file.',
					hideWhenUser: true
				},
				{
					label: 'F5: Unused non-free copyrighted file',
					value: 'f5',
					code: 'f5',
					tooltip: 'Files that are not under a free license or in the public domain that are not used in any article, whose only use is in a deleted article, and that are very unlikely to be used on any other article. Reasonable exceptions may be made for files uploaded for an upcoming article. For other unused non-free files, use the "Orphaned fair use" option in Twinkle\'s DI tab.',
					hideWhenUser: true
				},
				{
					label: 'F6: Missing fair-use rationale',
					value: 'norat',
					code: 'f6',
					tooltip: 'Any file without a fair use rationale may be deleted seven days after it is uploaded.  Boilerplate fair use templates do not constitute a fair use rationale.  Files uploaded before 2006-05-04 should not be deleted immediately; instead, the uploader should be notified that a fair-use rationale is needed.  Files uploaded after 2006-05-04 can be tagged using the "No fair use rationale" option in Twinkle\'s DI module. Such files can be found in the dated subcategories of Category:Files with no fair use rationale.',
					hideWhenUser: true
				},
				{
					label: 'F7: Clearly invalid fair-use tag',
					value: 'badfairuse1',
					code: 'f7',
					tooltip: 'This is only for files with a clearly invalid fair-use tag, such as a {{Non-free logo}} tag on a photograph of a mascot. For cases that require a waiting period (replaceable images or otherwise disputed rationales), use the options on Twinkle\'s DI tab.',
					subgroup: {
						name: 'badfairuse_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Optional explanation: ',
						size: 60
					}
				},
				{
					label: 'F7: Fair-use media from a commercial image agency which is not the subject of sourced commentary',
					value: 'badfairuse2',
					code: 'f7',
					tooltip: 'Non-free images or media from a commercial source (e.g., Associated Press, Getty), where the file itself is not the subject of sourced commentary, are considered an invalid claim of fair use and fail the strict requirements of WP:NFCC.',
					subgroup: {
						name: 'badfairuse_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Optional explanation: ',
						size: 60
					},
					hideWhenMultiple: true
				},
				{
					label: 'F8: File available as an identical or higher-resolution copy on Wikimedia Commons',
					value: 'commons',
					code: 'f8',
					tooltip: 'Provided the following conditions are met: 1: The file format of both images is the same. 2: The file\'s license and source status is beyond reasonable doubt, and the license is undoubtedly accepted at Commons. 3: All information on the file description page is present on the Commons file description page. That includes the complete upload history with links to the uploader\'s local user pages. 4: The file is not protected, and the file description page does not contain a request not to move it to Commons. 5: If the file is available on Commons under a different name than locally, all local references to the file must be updated to point to the title used at Commons. 6: For {{c-uploaded}} files: They may be speedily deleted as soon as they are off the Main Page',
					subgroup: {
						name: 'commons_filename',
						parameter: 'filename',
						log: '[[commons:$1]]',
						type: 'input',
						label: 'Filename on Commons: ',
						value: Morebits.pageNameNorm,
						tooltip: 'This can be left blank if the file has the same name on Commons as here. The "File:" prefix is optional.'
					},
					hideWhenMultiple: true
				},
				{
					label: 'F9: Unambiguous copyright infringement',
					value: 'imgcopyvio',
					code: 'f9',
					tooltip: 'The file was copied from a website or other source that does not have a license compatible with Wikipedia, and the uploader neither claims fair use nor makes a credible assertion of permission of free use. Sources that do not have a license compatible with Wikipedia include stock photo libraries such as Getty Images or Corbis. Non-blatant copyright infringements should be discussed at Wikipedia:Files for deletion',
					subgroup: [
						{
							name: 'imgcopyvio_url',
							parameter: 'url',
							utparam: 'url',
							type: 'input',
							label: 'URL of the copyvio, including the "http://".  If the copyvio is of a non-internet source and you cannot provide a URL, you must use the deletion rationale box. ',
							size: 60
						},
						{
							name: 'imgcopyvio_rationale',
							parameter: 'rationale',
							type: 'input',
							label: 'Deletion rationale for non-internet copyvios: ',
							size: 60
						}
					]
				},
				{
					label: 'F10: Useless non-media file',
					value: 'badfiletype',
					code: 'f10',
					tooltip: 'Files uploaded that are neither image, sound, nor video files (e.g. .doc, .pdf, or .xls files) which are not used in any article and have no foreseeable encyclopedic use'
				},
				{
					label: 'F11: No evidence of permission',
					value: 'nopermission',
					code: 'f11',
					tooltip: 'If an uploader has specified a license and has named a third party as the source/copyright holder without providing evidence that this third party has in fact agreed, the item may be deleted seven days after notification of the uploader',
					hideWhenUser: true
				},
				{
					label: 'G8: File description page with no corresponding file',
					value: 'imagepage',
					code: 'g8',
					tooltip: 'This is only for use when the file doesn\'t exist at all. Corrupt files, and local description pages for files on Commons, should use F2; implausible redirects should use R3; and broken Commons redirects should use R4.'
				}
			]
		},
		{
			label: 'Articles',
			visible: (self) => !self.isRedirect && arr_includes([0, 1], self.namespace),
			list: [
				{
					label: 'A1: No context. Articles lacking sufficient context to identify the subject of the article.',
					value: 'nocontext',
					code: 'a1',
					tooltip: 'Example: "He is a funny man with a red car. He makes people laugh." This applies only to very short articles. Context is different from content, treated in A3, below.'
				},
				{
					label: 'A2: Foreign language articles that exist on another Wikimedia project',
					value: 'foreign',
					code: 'a2',
					tooltip: 'If the article in question does not exist on another project, the template {{notenglish}} should be used instead. All articles in a non-English language that do not meet this criteria (and do not meet any other criteria for speedy deletion) should be listed at Pages Needing Translation (PNT) for review and possible translation',
					subgroup: {
						name: 'foreign_source',
						parameter: 'source',
						utparam: 'source',
						log: '[[:$1]]',
						type: 'input',
						label: 'Interwiki link to the article on the foreign-language wiki: ',
						tooltip: 'For example, fr:Bonjour'
					}
				},
				{
					label: 'A3: No content whatsoever',
					value: 'nocontent',
					code: 'a3',
					tooltip: 'Any article consisting only of links elsewhere (including hyperlinks, category tags and "see also" sections), a rephrasing of the title, and/or attempts to correspond with the person or group named by its title. This does not include disambiguation pages'
				},
				{
					label: 'A5: Transwikied articles',
					value: 'transwiki',
					code: 'a5',
					tooltip: 'Any article that has been discussed at Articles for Deletion (et al), where the outcome was to transwiki, and where the transwikification has been properly performed and the author information recorded. Alternately, any article that consists of only a dictionary definition, where the transwikification has been properly performed and the author information recorded',
					subgroup: {
						name: 'transwiki_location',
						parameter: 'location',
						utparam: 'location',
						type: 'input',
						label: 'Link to where the page has been transwikied: ',
						tooltip: 'For example, https://en.wiktionary.org/wiki/twinkle or [[wikt:twinkle]]'
					}
				},
				{
					label: 'A7: No indication of importance (people, groups, companies, web content, individual animals, or organized events)',
					value: 'a7',
					code: 'a7',
					tooltip: 'An article about a real person, group of people, band, club, company, web content, individual animal, tour, or party that does not assert the importance or significance of its subject. If controversial, or if a previous AfD has resulted in the article being kept, the article should be nominated for AfD instead',
					hideWhenSingle: true
				},
				{
					label: 'A7: No indication of importance (person)',
					value: 'person',
					code: 'a7',
					tooltip: 'An article about a real person that does not assert the importance or significance of its subject. If controversial, or if there has been a previous AfD that resulted in the article being kept, the article should be nominated for AfD instead',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (musician(s) or band)',
					value: 'band',
					code: 'a7',
					tooltip: 'Article about a band, singer, musician, or musical ensemble that does not assert the importance or significance of the subject',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (club, society or group)',
					value: 'club',
					code: 'a7',
					tooltip: 'Article about a club, society or group that does not assert the importance or significance of the subject',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (company or organization)',
					value: 'corp',
					code: 'a7',
					tooltip: 'Article about a company or organization that does not assert the importance or significance of the subject',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (website or web content)',
					value: 'web',
					code: 'a7',
					tooltip: 'Article about a web site, blog, online forum, webcomic, podcast, or similar web content that does not assert the importance or significance of its subject',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (individual animal)',
					value: 'animal',
					code: 'a7',
					tooltip: 'Article about an individual animal (e.g. pet) that does not assert the importance or significance of its subject',
					hideWhenMultiple: true
				},
				{
					label: 'A7: No indication of importance (organized event)',
					value: 'event',
					code: 'a7',
					tooltip: 'Article about an organized event (tour, function, meeting, party, etc.) that does not assert the importance or significance of its subject',
					hideWhenMultiple: true
				},
				{
					label: 'A9: Unremarkable musical recording where artist\'s article doesn\'t exist',
					value: 'a9',
					code: 'a9',
					tooltip: 'An article about a musical recording which does not indicate why its subject is important or significant, and where the artist\'s article has never existed or has been deleted'
				},
				{
					label: 'A10: Recently created article that duplicates an existing topic',
					value: 'a10',
					code: 'a10',
					tooltip: 'A recently created article with no relevant page history that does not aim to expand upon, detail or improve information within any existing article(s) on the subject, and where the title is not a plausible redirect. This does not include content forks, split pages or any article that aims at expanding or detailing an existing one.',
					subgroup: {
						name: 'a10_article',
						parameter: 'article',
						utparam: 'article',
						log: '[[:$1]]',
						type: 'input',
						label: 'Article that is duplicated: '
					}
				},
				{
					label: 'A11: Obviously made up by creator, and no claim of significance',
					value: 'madeup',
					code: 'a11',
					tooltip: 'An article which plainly indicates that the subject was invented/coined/discovered by the article\'s creator or someone they know personally, and does not credibly indicate why its subject is important or significant'
				}
			]
		},
		{
			label: 'Categories',
			visible: (self) => !self.isRedirect && arr_includes([14, 15], self.namespace),
			list: [
				{
					label: 'C1: Empty categories',
					value: 'catempty',
					code: 'c1',
					tooltip: 'Categories that have been unpopulated for at least seven days. This does not apply to categories being discussed at WP:CFD, disambiguation categories, and certain other exceptions. If the category isn\'t relatively new, it possibly contained articles earlier, and deeper investigation is needed'
				},
				{
					label: 'G8: Categories populated by a deleted or retargeted template',
					value: 'templatecat',
					code: 'g8',
					tooltip: 'This is for situations where a category is effectively empty, because the template(s) that formerly placed pages in that category are now deleted. This excludes categories that are still in use.',
					subgroup: {
						name: 'templatecat_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Optional explanation: ',
						size: 60
					}
				},
				{
					label: 'G8: Redirects to non-existent targets',
					value: 'redirnone',
					code: 'g8',
					tooltip: 'This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.',
					hideWhenMultiple: true
				}
			]
		},
		{
			label: 'User pages',
			visible: (self) => arr_includes([2, 3], self.namespace),
			list: [
				{
					label: 'U1: User request',
					value: 'userreq',
					code: 'u1',
					tooltip: 'Personal subpages, upon request by their user. In some rare cases there may be administrative need to retain the page. Also, sometimes, main user pages may be deleted as well. See Wikipedia:User page for full instructions and guidelines',
					subgroup: mw.config.get('wgNamespaceNumber') === 3 && mw.config.get('wgTitle').indexOf('/') === -1 ? {
						name: 'userreq_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'A mandatory rationale to explain why this user talk page should be deleted: ',
						tooltip: 'User talk pages are deleted only in highly exceptional circumstances. See WP:DELTALK.',
						size: 60
					} : null,
					hideSubgroupWhenMultiple: true
				},
				{
					label: 'U2: Nonexistent user',
					value: 'nouser',
					code: 'u2',
					tooltip: 'User pages of users that do not exist (Check Special:Listusers)'
				},
				{
					label: 'U3: Non-free galleries',
					value: 'gallery',
					code: 'u3',
					tooltip: 'Galleries in the userspace which consist mostly of "fair use" or non-free files. Wikipedia\'s non-free content policy forbids users from displaying non-free files, even ones they have uploaded themselves, in userspace. It is acceptable to have free files, GFDL-files, Creative Commons and similar licenses along with public domain material, but not "fair use" files',
					hideWhenRedirect: true
				},
				{
					label: 'U5: Blatant WP:NOTWEBHOST violations',
					value: 'notwebhost',
					code: 'u5',
					tooltip: 'Pages in userspace consisting of writings, information, discussions, and/or activities not closely related to Wikipedia\'s goals, where the owner has made few or no edits outside of userspace, with the exception of plausible drafts and pages adhering to WP:UPYES.',
					hideWhenRedirect: true
				},
				{
					label: 'G11: Promotional user page under a promotional user name',
					value: 'spamuser',
					code: 'g11',
					tooltip: 'A promotional user page, with a username that promotes or implies affiliation with the thing being promoted. Note that simply having a page on a company or product in one\'s userspace does not qualify it for deletion. If a user page is spammy but the username is not, then consider tagging with regular G11 instead.',
					hideWhenMultiple: true,
					hideWhenRedirect: true
				},
				{
					label: 'G13: AfC draft submission or a blank draft, stale by over 6 months',
					value: 'afc',
					code: 'g13',
					tooltip: 'Any rejected or unsubmitted AfC draft submission or a blank draft, that has not been edited in over 6 months (excluding bot edits).',
					hideWhenMultiple: true,
					hideWhenRedirect: true,
					subgroup: {
						type: 'hidden',
						name: 'g13timestamp',
						parameter: 'ts',
						value: '$TIMESTAMP' // replaced with the actual timestamp elsewhere
					}
				}
			],
		},
		{
			label: 'Portals',
			visible: (self) => !self.isRedirect && arr_includes([100, 101], self.namespace),
			list: [
				{
					label: 'P1: Portal that would be subject to speedy deletion if it were an article',
					value: 'p1',
					code: 'p1',
					tooltip: 'You must specify a single article criterion that applies in this case (A1, A3, A7, or A10).',
					subgroup: {
						name: 'p1_criterion',
						parameter: 'criterion',
						utparam: 'criterion',
						log: '[[WP:CSD#:$1]]',
						type: 'input',
						label: 'Article criterion that would apply: '
					}
				},
				{
					label: 'P2: Underpopulated portal (fewer than three non-stub articles)',
					value: 'emptyportal',
					code: 'p2',
					tooltip: 'Any Portal based on a topic for which there is not a non-stub header article, and at least three non-stub articles detailing subject matter that would be appropriate to discuss under the title of that Portal'
				}
			]
		},
		{
			label: 'General criteria',
			visible: () => true,
			list: [
				{
					label: 'G1: Patent nonsense. Pages consisting purely of incoherent text or gibberish with no meaningful content or history.',
					value: 'nonsense',
					code: 'g1',
					tooltip: 'This does not include poor writing, partisan screeds, obscene remarks, vandalism, fictional material, material not in English, poorly translated material, implausible theories, or hoaxes. In short, if you can understand it, G1 does not apply.',
					hideInNamespaces: [2] // Not applicable in userspace
				},
				{
					label: 'G2: Test page',
					value: 'test',
					code: 'g2',
					tooltip: 'A page created to test editing or other Wikipedia functions. Pages in the User namespace are not included, nor are valid but unused or duplicate templates (although criterion T3 may apply).',
					hideInNamespaces: [2] // Not applicable in userspace
				},
				{
					label: 'G3: Pure vandalism',
					value: 'vandalism',
					code: 'g3',
					tooltip: 'Plain pure vandalism (including redirects left behind from pagemove vandalism)'
				},
				{
					label: 'G3: Blatant hoax',
					value: 'hoax',
					code: 'g3',
					tooltip: 'Blatant and obvious hoax, to the point of vandalism',
					hideWhenMultiple: true
				},
				{
					label: 'G4: Recreation of material deleted via a deletion discussion',
					value: 'repost',
					code: 'g4',
					tooltip: 'A copy, by any title, of a page that was deleted via an XfD process or Deletion review, provided that the copy is substantially identical to the deleted version. This clause does not apply to content that has been "userfied", to content undeleted as a result of Deletion review, or if the prior deletions were proposed or speedy deletions, although in this last case, other speedy deletion criteria may still apply',
					subgroup: {
						name: 'repost_xfd',
						parameter: 'xfd',
						utparam: 'xfd',
						log: '[[:$1]]',
						type: 'input',
						label: 'Page where the deletion discussion took place: ',
						tooltip: 'Must start with "Wikipedia:"',
						size: 60
					}
				},
				{
					label: 'G5: Created by a banned or blocked user',
					value: 'banned',
					code: 'g5',
					tooltip: 'Pages created by banned or blocked users in violation of their ban or block, and which have no substantial edits by others',
					subgroup: {
						name: 'banned_user',
						parameter: 'user',
						log: '[[:User:$1]]',
						type: 'input',
						label: 'Username of banned user (if available): ',
						tooltip: 'Should not start with "User:"'
					}
				},
				{
					label: 'G6: Move',
					value: 'move',
					code: 'g6',
					tooltip: 'Making way for an uncontroversial move like reversing a redirect',
					subgroup: [
						{
							name: 'move_page',
							parameter: 'page',
							log: '[[:$1]]',
							type: 'input',
							label: 'Page to be moved here: '
						},
						{
							name: 'move_reason',
							parameter: 'reason',
							type: 'input',
							label: 'Reason: ',
							size: 60
						}
					],
					hideWhenMultiple: true
				},
				{
					label: 'G6: XfD',
					value: 'xfd',
					code: 'g6',
					tooltip: 'A deletion discussion (at AfD, FfD, RfD, TfD, CfD, or MfD) was closed as "delete", but the page wasn\'t actually deleted.',
					subgroup: {
						name: 'xfd_fullvotepage',
						parameter: 'fullvotepage',
						log: '[[:$1]]',
						type: 'input',
						label: 'Page where the deletion discussion was held: ',
						tooltip: 'Must start with "Wikipedia:"',
						size: 40
					},
					hideWhenMultiple: true
				},
				{
					label: 'G6: Copy-and-paste page move',
					value: 'copypaste',
					code: 'g6',
					tooltip: 'This only applies for a copy-and-paste page move of another page that needs to be temporarily deleted to make room for a clean page move.',
					subgroup: [{
						name: 'copypaste_sourcepage',
						parameter: 'sourcepage',
						log: '[[:$1]]',
						type: 'input',
						label: 'Original page that was copy-pasted here: '
					}, {
						name: 'copypaste_topage',
						type: 'hidden',
						value: Morebits.pageNameNorm,
						utparam: 'to'
					}],
					hideWhenMultiple: true
				},
				{
					label: 'G6: Housekeeping and non-controversial cleanup',
					value: 'g6',
					code: 'g6',
					tooltip: 'Other routine maintenance tasks',
					subgroup: {
						name: 'g6_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Rationale: ',
						size: 60
					}
				},
				{
					label: 'G7: Author requests deletion, or author blanked',
					value: 'author',
					code: 'g7',
					tooltip: 'Any page for which deletion is requested by the original author in good faith, provided the page\'s only substantial content was added by its author. If the author blanks the page, this can also be taken as a deletion request.',
					subgroup: {
						name: 'author_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Optional explanation: ',
						tooltip: 'Perhaps linking to where the author requested this deletion.',
						size: 60
					},
					hideSubgroupWhenSysop: true
				},
				{
					label: 'G8: Pages dependent on a non-existent or deleted page',
					value: 'g8',
					code: 'g8',
					tooltip: 'such as talk pages with no corresponding subject page; subpages with no parent page; file pages without a corresponding file; redirects to non-existent targets; or categories populated by deleted or retargeted templates. This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.',
					subgroup: {
						name: 'g8_rationale',
						parameter: 'rationale',
						type: 'input',
						label: 'Optional explanation: ',
						size: 60
					},
					hideSubgroupWhenSysop: true
				},
				{
					label: 'G8: Subpages with no parent page',
					value: 'subpage',
					code: 'g8',
					tooltip: 'This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.',
					hideWhenMultiple: true,
					hideInNamespaces: [0, 6, 8]  // hide in main, file, and mediawiki-spaces
				},
				{
					label: 'G10: Attack page',
					value: 'attack',
					redactContents: true,
					code: 'g10',
					tooltip: 'Pages that serve no purpose but to disparage or threaten their subject or some other entity (e.g., "John Q. Doe is an imbecile"). This includes a biography of a living person that is negative in tone and unsourced, where there is no NPOV version in the history to revert to. Administrators deleting such pages should not quote the content of the page in the deletion summary!',
					subgroup: {
						type: 'hidden',
						name: 'attackBlanked',
						parameter: 'blanked',
						value: 'yes'
					}
				},
				{
					label: 'G10: Wholly negative, unsourced BLP',
					value: 'negublp',
					redactContents: true,
					code: 'g10',
					tooltip: 'A biography of a living person that is entirely negative in tone and unsourced, where there is no neutral version in the history to revert to.',
					hideWhenMultiple: true
				},
				{
					label: 'G11: Unambiguous advertising or promotion',
					value: 'spam',
					code: 'g11',
					tooltip: 'Pages which exclusively promote a company, product, group, service, or person and which would need to be fundamentally rewritten in order to become encyclopedic. Note that an article about a company or a product which describes its subject from a neutral point of view does not qualify for this criterion; an article that is blatant advertising should have inappropriate content as well'
				},
				{
					label: 'G12: Unambiguous copyright infringement',
					value: 'copyvio',
					code: 'g12',
					tooltip: 'Either: (1) Material was copied from another website that does not have a license compatible with Wikipedia, or is photography from a stock photo seller (such as Getty Images or Corbis) or other commercial content provider; (2) There is no non-infringing content in the page history worth saving; or (3) The infringement was introduced at once by a single person rather than created organically on wiki and then copied by another website such as one of the many Wikipedia mirrors',
					subgroup: [
						{
							name: 'copyvio_url',
							parameter: 'url',
							utparam: 'url',
							type: 'input',
							label: 'URL (if available): ',
							tooltip: 'If the material was copied from an online source, put the URL here, including the "http://" or "https://" protocol.',
							size: 60
						},
						{
							name: 'copyvio_url2',
							parameter: 'url2',
							utparam: 'url2',
							type: 'input',
							label: 'Additional URL: ',
							tooltip: 'Optional. Should begin with "http://" or "https://"',
							size: 60
						},
						{
							name: 'copyvio_url3',
							parameter: 'url3',
							utparam: 'url3',
							type: 'input',
							label: 'Additional URL: ',
							tooltip: 'Optional. Should begin with "http://" or "https://"',
							size: 60
						}
					]
				},
				{
					label: 'G13: Page in draft namespace or userspace AfC submission, stale by over 6 months',
					value: 'afc',
					code: 'g13',
					tooltip: 'Any rejected or unsubmitted AfC submission in userspace or any non-redirect page in draft namespace, that has not been edited for more than 6 months. Blank drafts in either namespace are also included.',
					hideWhenRedirect: true,
					showInNamespaces: [2, 118]  // user, draft namespaces only
				},
				{
					label: 'G14: Unnecessary disambiguation page',
					value: 'disambig',
					code: 'g14',
					tooltip: 'This only applies for orphaned disambiguation pages which either: (1) disambiguate only one existing Wikipedia page and whose title ends in "(disambiguation)" (i.e., there is a primary topic); or (2) disambiguate no (zero) existing Wikipedia pages, regardless of its title.  It also applies to orphan "Foo (disambiguation)" redirects that target pages that are not disambiguation or similar disambiguation-like pages (such as set index articles or lists)'
				}
			]
		},
		{
			label: 'Redirects',
			visible: (self) => self.isRedirect,
			list: [
				{
					label: 'R2: Redirect from mainspace to any other namespace except the Category:, Template:, Wikipedia:, Help: and Portal: namespaces',
					value: 'rediruser',
					code: 'r2',
					tooltip: 'This does not include the pseudo-namespace shortcuts. If this was the result of a page move, consider waiting a day or two before deleting the redirect',
					showInNamespaces: [0]
				},
				{
					label: 'R3: Recently created redirect from an implausible typo or misnomer',
					value: 'redirtypo',
					code: 'r3',
					tooltip: 'However, redirects from common misspellings or misnomers are generally useful, as are redirects in other languages'
				},
				{
					label: 'R4: File namespace redirect with a name that matches a Commons page',
					value: 'redircom',
					code: 'r4',
					tooltip: 'The redirect should have no incoming links (unless the links are cleary intended for the file or redirect at Commons).',
					showInNamespaces: [6]
				},
				{
					label: 'G6: Redirect to malplaced disambiguation page',
					value: 'movedab',
					code: 'g6',
					tooltip: 'This only applies for redirects to disambiguation pages ending in (disambiguation) where a primary topic does not exist.',
					hideWhenMultiple: true
				},
				{
					label: 'G8: Redirects to non-existent targets',
					value: 'redirnone',
					code: 'g8',
					tooltip: 'This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.',
					hideWhenMultiple: true
				}
			]
		}
	];

}


