/**
 * This file contains the list of MediaWiki messages to be load, in addition
 * to what twinkle-core loads.
 */

export default [
	// Put "restriction-level-" messages for all protection groups here
	// Check using /w/api.php?action=query&meta=siteinfo&formatversion=2&siprop=restrictions
	// (except sysop and autoconfirmed which are already added by core)
	'restriction-level-extendedconfirmed',
	'restriction-level-templateeditor',

	// if there are user groups for which FlaggedRevs (pending changes) can be configured,
	// put the "group-" messages for them here, eg. "group-reviewer"
	// enwiki doesn't need to put this here since PC level-2 is deprecated
];
