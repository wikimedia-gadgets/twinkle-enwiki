import { setupMWBrowser, setupMwn, bot, goto, TwinkleModuleTest, readText, bot2 } from './test_base';

describe('prod', () => {
	jest.setTimeout(500000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page), bot2.login()]);
	});

	it('prod', async () => {
		// create with bot2 so self-notification won't be aborted
		await bot2.create('Prod test/1', 'Prod test page');
		await goto('Prod test/1');
		let prod = await new TwinkleModuleTest('prod').open();
		await page.fill('.quickform textarea[name="reason"]', 'PROD CONCERN');
		await prod.submit();

		await expect(await readText('Prod test/1')).toContain('{{subst:prod|1=PROD CONCERN|help=off}}');
		await expect(await readText('User talk:Wikiuser2')).toContain(
			'{{subst:prod|1=PROD CONCERN|help=off}} [[User:Wikiuser' // require sig
		);
	});

	it('blp prod', async () => {
		await bot2.create('Prod blp test/1', 'Prod test page');
		await goto('Prod blp test/1');
		let prod = await new TwinkleModuleTest('prod').open();
		await page.click('.quickform input[value="prodblp"]');
		await prod.submit();

		await expect(await readText('Prod test/1')).toContain(
			'{{subst:proposed deletion notify|1=Prod test/1|concern=PROD CONCERN}}'
		);
	});

	afterAll(async () => {
		await Promise.all([
			bot.delete('Prod test/1'),
			bot.delete('Talk:Prod test/1'),
			bot.delete('Prod blp test/1'),
			bot.delete('Talk:Prod blp test/1'),
		]);
	});
});
