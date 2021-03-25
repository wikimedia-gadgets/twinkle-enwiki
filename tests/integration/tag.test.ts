import {
	bot,
	setupMWBrowser,
	setupMwn,
	TwinkleModuleTest,
	createAndGotoRandomPage,
	readText,
	goto,
	rand,
} from './test_base';

function monthYear() {
	return new bot.date().format('MMMM YYYY');
}

describe('tag', () => {
	jest.setTimeout(5000000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page)]);
	});

	it('tags a page with {{cleanup rewrite}}', async () => {
		const pageName = await createAndGotoRandomPage('Tag test');
		const tag = await new TwinkleModuleTest('tag').open();
		await page.check('input[value="Cleanup rewrite"]');
		await tag.submit();

		let newText = await readText(pageName);
		expect(newText.startsWith(`{{Cleanup rewrite|date=${monthYear()}}}`)).toBe(true);
	});

	it('tags a page with {{cleanup}} with reason', async () => {
		const pageName = await createAndGotoRandomPage('Tag test');
		const tag = await new TwinkleModuleTest('tag').open();
		await page.click('input[value="Cleanup"]');
		await page.fill('input[name="tags.cleanup"]', 'cleanup reason');
		await tag.submit();

		let newText = await readText(pageName);
		expect(newText.startsWith('{{Cleanup|reason=cleanup reason|date=' + monthYear())).toBe(true);
	});

	it('tags other article with {{merge}}', async () => {
		const [page1, page2] = await Promise.all([
			bot.create('Tag merge' + rand(), 'testcontent').then((p) => p.title),
			bot.create('Tag merge' + rand(), 'testcontent').then((p) => p.title),
		]);
		await goto(page1);
		const tag = await new TwinkleModuleTest('tag').open();
		await page.click('input[value="Merge"]');
		await page.fill('input[name="tags.mergeTarget"]', page2);
		await page.fill('textarea[name="tags.mergeReason"]', 'this is reason');
		await tag.submit();

		expect(await readText(page1)).toContain(
			`{{Merge|1=${page2}|discuss=Talk:${page1}#Proposed merge of ${page2} with ${page1}|date=${monthYear()}}}`
		);
		expect(await readText(page2)).toContain(
			`{{Merge|1=${page1}|discuss=Talk:${page1}#Proposed merge of ${page2} with ${page1}|date=${monthYear()}}}`
		);
		expect(await readText('Talk:' + page1)).toMatch(`== Proposed merge of [[${page2}]] with [[${page1}]] ==

this is reason`);
	});
});
