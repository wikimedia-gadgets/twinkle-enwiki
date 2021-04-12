import { loadExpectInBrowser, loadMorebits, setupMWBrowser } from './test_base';

describe('Morebits.wiki.api', () => {
	beforeAll(async () => {
		await setupMWBrowser(page);
		await Promise.all([loadMorebits(), loadExpectInBrowser()]);
	});

	test('Api call works (formatversion 2 by default)', async () => {
		let result = await page.evaluate(() => {
			var a = new Morebits.wiki.api('Test API call', {
				action: 'query',
				format: 'json',
			});
			return a.post().then(function (apiobj) {
				return apiobj.getResponse();
			});
		});
		expect(result).toEqual({ batchcomplete: true });
	});
	test('Api call works (formatversion 1)', async () => {
		let result = await page.evaluate(() => {
			var a = new Morebits.wiki.api('Test API call', {
				action: 'query',
				format: 'json',
				formatversion: 1,
			});
			return a.post().then(function (apiobj) {
				expect(apiobj instanceof Morebits.wiki.api).toBe(true);
				return apiobj.getResponse();
			});
		});
		expect(result).toEqual({ batchcomplete: '' });
	});
	test('Api call works (xml format)', async () => {
		let batchcomplete = await page.evaluate(() => {
			var a = new Morebits.wiki.api('Test API call', {
				action: 'query',
				format: 'xml',
			});
			return a.post().then(function (apiobj) {
				var response = apiobj.getResponse();
				expect(response instanceof XMLDocument).toBe(true);
				return $(response).find('api').attr('batchcomplete');
			});
		});
		expect(batchcomplete).toBe('');
	});
});
