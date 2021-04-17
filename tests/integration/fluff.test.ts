import { bot, bot2, setupMWBrowser, setupMwn, goto, rand, loadTwinkle, lastDiff } from './test_base';

describe('fluff', () => {
	jest.setTimeout(500000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page), bot2.login()]);
	});

	it('reverts user from diff - vandalism rollback', async () => {
		const pageName = 'Revert test/' + rand();
		await bot.create(pageName, 'Test page');
		const { newrevid, oldrevid } = await bot2.save(pageName, 'Vandalised version', 'vandalising');
		// Go to diff
		await goto(`/${pageName}?diff=${newrevid}&oldid=${oldrevid}`);
		await loadTwinkle();
		await page.click('#tw-revert > strong:nth-child(3) > a');
		await page.waitForNavigation();
		const diff = await lastDiff(pageName);
		diff.expectToBeTwinkleEdit();
		expect(diff.summary).toMatch(
			'Reverted 1 edit by [[Special:Contributions/Wikiuser2|Wikiuser2]] ([[User talk:Wikiuser2|talk]]) to last revision by Wikiuser'
		);

		// Expect user talk page to have been opened in new tab
		expect(page.context().pages()).to.be.of.length(2);
		expect(page.context().pages()[0].url()).toBe('http://localhost:8080/index.php/' + pageName.replace(/ /g, '_'));
		let newTabUrl = page.context().pages()[1].url();
		expect(newTabUrl).toContain('title=User%20talk%3A');
		expect(newTabUrl).toContain('&vanarticle=' + encodeURIComponent(pageName));
		expect(newTabUrl).toContain('&vanarticlerevid=');
		expect(newTabUrl).toContain('&vantimestamp=');
		expect(newTabUrl).toContain('&vanarticlegoodrevid=');
		expect(newTabUrl).toContain('&type=vand');
	});
});
