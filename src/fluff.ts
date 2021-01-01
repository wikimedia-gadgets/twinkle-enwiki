
class Fluff extends TwinkleModule {

	/**
	 * A list of usernames, usually only bots, that vandalism revert is jumped
	 * over; that is, if vandalism revert was chosen on such username, then its
	 * target is on the revision before. This is for handling quick bots that
	 * makes edits seconds after the original edit is made. This only affects
	 * vandalism rollback; for good faith rollback, it will stop, indicating a bot
	 * has no faith, and for normal rollback, it will rollback that edit.
	 */
	trustedBots = ['AnomieBOT', 'SineBot', 'MajavahBot'];

	/**
	 * String to insert when a username is hidden
	 */
	hiddenName = 'an unknown user';

	skipTalk = null;

	rollbackInPlace = null;

	constructor() {
		super();

		// Only proceed if the user can actually edit the page in question
		// (see #632 for contribs issue).  wgIsProbablyEditable should take
		// care of namespace/contentModel restrictions as well as explicit
		// protections; it won't take care of cascading or TitleBlacklist.
		if (mw.config.get('wgIsProbablyEditable')) {
			// Check that we're on diff page, can't use wgDiffOldId per [[phab:T214985]]
			if (mw.config.get('wgDiffNewId')) {
				// Reload alongside the revision slider
				mw.hook('wikipage.diff').add(() => {
					this.addLinks.diff();
				});

			} else if (mw.config.get('wgAction') === 'view' &&
				mw.config.get('wgRevisionId') &&
				mw.config.get('wgCurRevisionId') !== mw.config.get('wgRevisionId')
			) {
				this.addLinks.oldid();

			} else if (mw.config.get('wgAction') === 'history' &&
				mw.config.get('wgArticleId')
			) {
				this.addLinks.history();
			}

		} else if (mw.config.get('wgNamespaceNumber') === -1) {
			this.skipTalk = !Twinkle.getPref('openTalkPageOnAutoRevert');
			this.rollbackInPlace = Twinkle.getPref('rollbackInPlace');

			if (mw.config.get('wgCanonicalSpecialPageName') === 'Contributions') {
				this.addLinks.contributions();
			} else if (mw.config.get('wgCanonicalSpecialPageName') === 'Recentchanges' ||
				mw.config.get('wgCanonicalSpecialPageName') === 'Recentchangeslinked'
			) {
				// Reload with recent changes updates
				// structuredChangeFilters.ui.initialized is just on load
				mw.hook('wikipage.content').add((item) => {
					if (item.is('div')) {
						this.addLinks.recentchanges();
					}
				});
			}
		}


	}

	linkBuilder = {

		buildLink(color, text) {
			var link = document.createElement('a');
			link.appendChild(Morebits.htmlNode('div', '[', 'Black'));
			link.appendChild(Morebits.htmlNode('div', text, color));
			link.appendChild(Morebits.htmlNode('div', ']', 'Black'));
			link.href = '#';
			return link;
		},

		/**
		 * @param {string} [vandal=null] - Username of the editor being reverted
		 * Provide a falsey value if the username is hidden, defaults to null
		 * @param {boolean} inline - True to create two links in a span, false
		 * to create three links in a div (optional)
		 * @param {number|string} [rev=wgCurRevisionId] - Revision ID being reverted (optional)
		 * @param {string} [page=wgPageName] - Page being reverted (optional)
		 */
		rollbackLinks(vandal, inline, rev, page) {
			vandal = vandal || null;

			var elem = inline ? 'span' : 'div';
			var revNode = document.createElement(elem);

			rev = parseInt(rev, 10);
			if (rev) {
				revNode.setAttribute('id', 'tw-revert' + rev);
			} else {
				revNode.setAttribute('id', 'tw-revert');
			}

			var normNode = document.createElement('strong');
			var vandNode = document.createElement('strong');

			var normLink = this.buildLink('SteelBlue', 'rollback');
			var vandLink = this.buildLink('Red', 'vandalism');

			$(normLink).click(function() {
				this.revert('norm', vandal, rev, page);
				this.disableLinks(revNode);
			});
			$(vandLink).click(function() {
				this.revert('vand', vandal, rev, page);
				this.disableLinks(revNode);
			});

			vandNode.appendChild(vandLink);
			normNode.appendChild(normLink);

			var separator = inline ? ' ' : ' || ';

			if (!inline) {
				var agfNode = document.createElement('strong');
				var agfLink = this.buildLink('DarkOliveGreen', 'rollback (AGF)');
				$(agfLink).click(function() {
					this.revert('agf', vandal, rev, page);
					// this.disableLinks(revNode); // rollbackInPlace not relevant for any inline situations
				});
				agfNode.appendChild(agfLink);
				revNode.appendChild(agfNode);
			}
			revNode.appendChild(document.createTextNode(separator));
			revNode.appendChild(normNode);
			revNode.appendChild(document.createTextNode(separator));
			revNode.appendChild(vandNode);

			return revNode;

		},

		// Build [restore this revision] links
		restoreThisRevisionLink(revisionRef, inline) {
			// If not a specific revision number, should be wgDiffNewId/wgDiffOldId/wgRevisionId
			revisionRef = typeof revisionRef === 'number' ? revisionRef : mw.config.get(revisionRef);

			var elem = inline ? 'span' : 'div';
			var revertToRevisionNode = document.createElement(elem);

			revertToRevisionNode.setAttribute('id', 'tw-revert-to-' + revisionRef);
			revertToRevisionNode.style.fontWeight = 'bold';

			var revertToRevisionLink = this.buildLink('SaddleBrown', 'restore this version');
			$(revertToRevisionLink).click(function() {
				this.revertToRevision(revisionRef);
			});

			if (inline) {
				revertToRevisionNode.appendChild(document.createTextNode(' '));
			}
			revertToRevisionNode.appendChild(revertToRevisionLink);
			return revertToRevisionNode;
		}
	}

	addLinks = {
		contributions: function() {
			// $('sp-contributions-footer-anon-range') relies on the fmbox
			// id in [[MediaWiki:Sp-contributions-footer-anon-range]] and
			// is used to show rollback/vandalism links for IP ranges
			var isRange = !!$('#sp-contributions-footer-anon-range')[0];
			if (mw.config.exists('wgRelevantUserName') || isRange) {
				// Get the username these contributions are for
				var username = mw.config.get('wgRelevantUserName');
				if (Twinkle.getPref('showRollbackLinks').indexOf('contribs') !== -1 ||
					(mw.config.get('wgUserName') !== username && Twinkle.getPref('showRollbackLinks').indexOf('others') !== -1) ||
					(mw.config.get('wgUserName') === username && Twinkle.getPref('showRollbackLinks').indexOf('mine') !== -1)) {
					var $list = $('#mw-content-text').find('ul li:has(span.mw-uctop):has(.mw-changeslist-diff)');

					$list.each(function(key, current) {
						// revid is also available in the href of both
						// .mw-changeslist-date or .mw-changeslist-diff
						var page = $(current).find('.mw-contributions-title').text();

						// Get username for IP ranges (wgRelevantUserName is null)
						if (isRange) {
							// The :not is possibly unnecessary, as it appears that
							// .mw-userlink is simply not present if the username is hidden
							username = $(current).find('.mw-userlink:not(.history-deleted)').text();
						}

						// It's unlikely, but we can't easily check for revdel'd usernames
						// since only a strong element is provided, with no easy selector [[phab:T255903]]
						current.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(username, true, current.dataset.mwRevid, page));
					});
				}
			}
		},

		recentchanges: function() {
			if (Twinkle.getPref('showRollbackLinks').indexOf('recent') !== -1) {
				// Latest and revertable (not page creations, logs, categorizations, etc.)
				var $list = $('.mw-changeslist .mw-changeslist-last.mw-changeslist-src-mw-edit');
				// Exclude top-level header if "group changes" preference is used
				// and find only individual lines or nested lines
				$list = $list.not('.mw-rcfilters-ui-highlights-enhanced-toplevel').find('.mw-changeslist-line-inner, td.mw-enhanced-rc-nested');

				$list.each(function(key, current) {
					// The :not is possibly unnecessary, as it appears that
					// .mw-userlink is simply not present if the username is hidden
					var vandal = $(current).find('.mw-userlink:not(.history-deleted)').text();
					var href = $(current).find('.mw-changeslist-diff').attr('href');
					var rev = mw.util.getParamValue('diff', href);
					var page = current.dataset.targetPage;
					current.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(vandal, true, rev, page));
				});
			}
		},

		history: function() {
			if (Twinkle.getPref('showRollbackLinks').indexOf('history') !== -1) {
				// All revs
				var histList = $('#pagehistory li').toArray();

				// On first page of results, so add revert/rollback
				// links to the top revision
				if (!$('.mw-firstlink').length) {
					var first = histList.shift();
					var vandal = $(first).find('.mw-userlink:not(.history-deleted)').text();

					// Check for first username different than the top user,
					// only apply rollback links if/when found
					// for faster than every
					for (var i = 0; i < histList.length; i++) {
						if ($(histList[i]).find('.mw-userlink').text() !== vandal) {
							first.appendChild(Twinkle.fluff.linkBuilder.rollbackLinks(vandal, true));
							break;
						}
					}
				}

				// oldid
				histList.forEach(function(rev) {
					// From restoreThisRevision, non-transferable
					// If the text has been revdel'd, it gets wrapped in a span with .history-deleted,
					// and href will be undefined (and thus oldid is NaN)
					var href = rev.querySelector('.mw-changeslist-date').href;
					var oldid = parseInt(mw.util.getParamValue('oldid', href), 10);
					if (!isNaN(oldid)) {
						rev.appendChild(Twinkle.fluff.linkBuilder.restoreThisRevisionLink(oldid, true));
					}
				});


			}
		},

		diff: function() {
			// Autofill user talk links on diffs with vanarticle for easy warning, but don't autowarn
			var warnFromTalk = function(xtitle) {
				var talkLink = $('#mw-diff-' + xtitle + '2 .mw-usertoollinks a').first();
				if (talkLink.length) {
					var extraParams = 'vanarticle=' + mw.util.rawurlencode(Morebits.pageNameNorm) + '&' + 'noautowarn=true';
					// diffIDs for vanarticlerevid
					extraParams += '&vanarticlerevid=';
					extraParams += xtitle === 'otitle' ? mw.config.get('wgDiffOldId') : mw.config.get('wgDiffNewId');

					var href = talkLink.attr('href');
					if (href.indexOf('?') === -1) {
						talkLink.attr('href', href + '?' + extraParams);
					} else {
						talkLink.attr('href', href + '&' + extraParams);
					}
				}
			};

			// Older revision
			warnFromTalk('otitle'); // Add quick-warn link to user talk link
			// Don't load if there's a single revision or weird diff (cur on latest)
			if (mw.config.get('wgDiffOldId') && (mw.config.get('wgDiffOldId') !== mw.config.get('wgDiffNewId'))) {
				// Add a [restore this revision] link to the older revision
				var oldTitle = document.getElementById('mw-diff-otitle1').parentNode;
				oldTitle.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgDiffOldId'), oldTitle.firstChild);
			}

			// Newer revision
			warnFromTalk('ntitle'); // Add quick-warn link to user talk link
			// Add either restore or rollback links to the newer revision
			// Don't show if there's a single revision or weird diff (prev on first)
			if (document.getElementById('differences-nextlink')) {
				// Not latest revision, add [restore this revision] link to newer revision
				var newTitle = document.getElementById('mw-diff-ntitle1').parentNode;
				newTitle.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgDiffNewId'), newTitle.firstChild);
			} else if (Twinkle.getPref('showRollbackLinks').indexOf('diff') !== -1 && mw.config.get('wgDiffOldId') && (mw.config.get('wgDiffOldId') !== mw.config.get('wgDiffNewId') || document.getElementById('differences-prevlink'))) {
				// Normally .mw-userlink is a link, but if the
				// username is hidden, it will be a span with
				// .history-deleted as well. When a sysop views the
				// hidden content, the span contains the username in a
				// link element, which will *just* have
				// .mw-userlink. The below thus finds the first
				// instance of the class, which if hidden is the span
				// and thus text returns undefined. Technically, this
				// is a place where sysops *could* have more
				// information available to them (as above, via
				// &unhide=1), since the username will be available by
				// checking a.mw-userlink instead, but revert() will
				// need reworking around userHidden
				var vandal = $('#mw-diff-ntitle2').find('.mw-userlink')[0].text;
				var ntitle = document.getElementById('mw-diff-ntitle1').parentNode;

				ntitle.insertBefore(Twinkle.fluff.linkBuilder.rollbackLinks(vandal), ntitle.firstChild);
			}
		},

		oldid: function() { // Add a [restore this revision] link on old revisions
			var title = document.getElementById('mw-revision-info').parentNode;
			title.insertBefore(Twinkle.fluff.linkBuilder.restoreThisRevisionLink('wgRevisionId'), title.firstChild);
		}


	}

	disableLinks(parentNode) {
		// Array.from not available in IE11 :(
		$(parentNode).children().each(function(_ix, node) {
			node.innerHTML = node.textContent; // Feels like cheating
			$(node).css('font-weight', 'normal').css('color', 'darkgray');
		});
	}




}

Twinkle.addInitCallback(() => { new Fluff(); }, 'fluff');
