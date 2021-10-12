import { bot, bot2, loadExpectInBrowser, loadMorebits, setupMWBrowser, setupMwn } from './test_base';

// NOTE: morebits.wiki.page can possibly be also tested with just mock-mediawiki,
// avoiding the whole overhead of headless browsers and playwright

describe('Morebits.wiki.page', () => {
	jest.setTimeout(20000);

	beforeAll(async () => {
		await Promise.all([setupMWBrowser(page), setupMwn()]);
		await Promise.all([loadMorebits(), loadExpectInBrowser()]);
	});

	test('load', async () => {
		let pagetext = await page.evaluate(() => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page('Main Page');
			p.load(function (pageobj) {
				d.resolve(pageobj.getPageText());
			}, d.reject);
			return d;
		});
		expect(typeof pagetext).toBe('string');
		expect(pagetext.length).toBeGreaterThan(500);
	});

	test('fails to load a page with bad name', async () => {
		let result = await page.evaluate(() => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page('<scrip'); // invalid page name
			p.load(d.resolve, d.reject);
			return d;
		});
		// result should be undefined as the promise internally doesn't resolve
		expect(result).toBeUndefined();
	});

	test('save', async () => {});

	test('prepend', async () => {
		let randomPage = 'Prepend test page/' + Math.random();
		await bot.create(randomPage, 'Test page.');
		await page.evaluate((randomPage) => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page(randomPage);
			p.setPrependText('Prepended text. ');
			p.setEditSummary('Testing');
			p.prepend(d.resolve, d.reject);
			return d;
		}, randomPage);
		let pagetext = (await bot.read(randomPage)).revisions[0].content;
		expect(pagetext).toBe('Prepended text. Test page.');
	});

	test('append', async () => {
		let randomPage = 'Append test page/' + Math.random();
		await page.evaluate((randomPage) => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page(randomPage);
			p.setAppendText('Testing 123');
			p.setEditSummary('Testing');
			p.append(d.resolve, d.reject);
			return d;
		}, randomPage);
		let pagetext = (await bot.read(randomPage)).revisions[0].content;
		expect(pagetext).toBe('Testing 123');
	});

	test('deletePage', async () => {
		let randomPage = 'Delete test page/' + Math.random();
		await bot.create(randomPage, 'Test page'); // create the page first to delete it
		await page.evaluate((randomPage) => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page(randomPage);
			p.setEditSummary('Testing');
			p.deletePage(d.resolve, d.reject);
			return d;
		}, randomPage);
		expect((await bot.read(randomPage)).missing).toBe(true);
	});

	// TODO

	test.skip('undeletePage', async () => {});

	test.skip('protect', async () => {});

	test.skip('patrol', async () => {});

	test.skip('triage', async () => {});

	test('looks up page creator', async () => {
		let [creator, creationTS] = await page.evaluate(() => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page('Main Page');
			p.lookupCreation(function () {
				d.resolve([p.getCreator(), p.getCreationTimestamp()]);
			});
			return d;
		});
		expect(creator).toBe('MediaWiki default');
		expect(new Date(creationTS).getDate()).not.toBeNaN();
	});

	test('lookupCreator when original creation is a redirect', async () => {
		let pageName = 'Lookup creator test/' + Math.random();
		await Promise.all([
			// parallelize for speed
			bot.create(pageName, '#REDIRECT [[Main Page]]'),
			bot2.login(),
		]);
		// Make an edit using the 2nd account, grab the timestamp
		let editTime = await bot2.save(pageName, 'Non-redirect content').then((data) => data.newtimestamp);
		let [creator, creationTS] = await page.evaluate((pageName) => {
			var d = $.Deferred();
			var p = new Morebits.wiki.page(pageName);
			p.setLookupNonRedirectCreator(true);
			p.lookupCreation(function () {
				d.resolve([p.getCreator(), p.getCreationTimestamp()]);
			});
			return d;
		}, pageName);
		expect(creator).toBe('Wikiuser2');
		expect(creationTS).toBe(editTime);
	});

	test('lookupCreator when original creation is a redirect (with localised redirect magic word)', async () => {
		let pageName1 = 'Lookup creator test/' + Math.random();
		let pageName2 = 'Lookup creator test/' + Math.random();
		await Promise.all([
			// parallelize for speed
			bot.create(pageName1, '#rr [[Main Page]]'), // redirect
			bot.create(pageName2, '#rwerr [[Main Page]]'), // not a redirect
			bot2.login(),
		]);
		// Make an edit using the 2nd account, grab the timestamp
		let [editTime1, editTime2] = await Promise.all([
			bot2.save(pageName1, 'Non-redirect content').then((data) => data.newtimestamp),
			bot2.save(pageName2, 'Non-redirect content').then((data) => data.newtimestamp),
		]);
		let [creator1, creator2] = await page.evaluate(
			([pageName1, pageName2]) => {
				Morebits.l10n.redirectTagAliases = ['#REDIRECT', '#RR'];
				var d = $.Deferred();
				var p1 = new Morebits.wiki.page(pageName1);
				var p2 = new Morebits.wiki.page(pageName2);
				p1.setLookupNonRedirectCreator(true);
				p2.setLookupNonRedirectCreator(true);
				p1.lookupCreation(function () {
					p2.lookupCreation(function () {
						d.resolve([p1.getCreator(), p2.getCreator()]);
					});
				});
				return d;
			},
			[pageName1, pageName2]
		);
		expect(creator1).toBe('Wikiuser2');
		expect(creator2).toBe('Wikiuser');
	});
});
