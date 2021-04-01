import { createAndGotoRandomPage, lastDiff, lastLog, setupMWBrowser, setupMwn, TwinkleModuleTest } from './test_base';

describe('protect', () => {
	jest.setTimeout(500000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page)]);
	});

	test('protection', async () => {
		const pageName = await createAndGotoRandomPage('Protect test');
		const pp = await new TwinkleModuleTest('protect').open();
		// default settings: protection for 2 days for persistent vandalism
		await pp.submit();
		const logItem = await lastLog(pageName, ['comment', 'tags', 'user', 'type', 'details']);
		expect(logItem).to.have.property('type').that.equals('protect');
		expect(logItem).to.have.property('user').that.equals('Wikiuser');
		expect(logItem).to.have.property('tags').that.deep.equals(['twinkle']);
		expect(logItem.params.details[0].type).to.equal('edit');
		expect(logItem.params.details[0].level).to.equal('autoconfirmed');
	});

	test('tagging', async () => {
		const pageName = await createAndGotoRandomPage('Protect tag test');
		const pp = await new TwinkleModuleTest('protect').open();
		await page.click('.quickform [name=actiontype][value=tag]');
		await page.selectOption('.quickform select[name=tagtype]', 'pp-vandalism');
		// default settings: protection for 2 days for persistent vandalism
		await pp.submit();
		const diff = await lastDiff(pageName);
		diff.expectToBeTwinkleEdit();
		diff.expectAddedLineToMatch('{{pp-vandalism|small=yes}}\n');
		expect(diff.summary).toMatch('Adding {{pp-vandalism}}');
	});

	test.skip('request', async () => {
		const pageName = await createAndGotoRandomPage('Protect request test');
		const pp = await new TwinkleModuleTest('protect').open();
		await page.click('.quickform [name=actiontype][value=request]');
		await page.selectOption('.quickform select[name=category]', 'pp-30-500-vandalism');
		await pp.submit();
		const diff = await lastDiff('Wikipedia:Requests for page protection');
		diff.expectToBeTwinkleEdit();
	});
});
