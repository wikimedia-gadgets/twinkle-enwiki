import { setupMWBrowser, setupMwn, bot, goto, TwinkleModuleTest, readText, lastDiff, bot2 } from './test_base';

describe('xfd', () => {
	jest.setTimeout(500000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page), bot2.login()]);
	});

	test('ffd', async () => {
		// create with bot2 so self-notification won't be aborted
		// await bot2.upload(__dirname + '/fixtures/example1.png', 'File:FFD test-1', 'FFD test image');
		await goto('File:FFD test-1');
		const xfd = await new TwinkleModuleTest('xfd').open();
		await page.fill('textarea[name="reason"]', 'FFD_REASON');
		await xfd.submit();

		let logDate = new bot.date().format('YYYY MMMM D');
		let ffdTag = `{{ffd|log=${logDate}|help=off}}`;

		await Promise.all([
			(async () => {
				let diff = (await lastDiff('File:FFD test-1.png')).expectToBeTwinkleEdit();
				expect(diff.addedLines).toMatch(new RegExp('^' + mw.util.escapeRegExp(ffdTag)));
			})(),
			expect(bot.read('File:FFD test-1.png')).to.eventually.match(new RegExp('^' + mw.util.escapeRegExp(ffdTag))),
			expect(bot.read('User talk:Wikiuser2')).to.eventually.contain('{{subst:FfD notice|1=File:FFD test-1.png}}'),
			expect(bot.read(`Wikipedia:Files for discussion/${logDate}`)).to.eventually.contain('subst:ffd2'),
		]);
		bot.delete('File:FFD test-1.png', 'delete after testing'); // no need to await
	});

	// test('afd', async () => {
	//
	// });
});
