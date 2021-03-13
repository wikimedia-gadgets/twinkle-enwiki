import { setupMWBrowser, setupMwn, bot, goto, TwinkleModule } from './test_base';

describe('deprod', () => {
	jest.setTimeout(500000);

	it('deletes PRODed pages', async () => {
		await setupMwn();

		// XXX: concern appears undefined in edit summary as we're directly using the category
		// rather than the template with concern.
		await Promise.all([
			bot.save('Deprod test/1', '[[Category:Proposed deletion as of 1 March 2021]]'),
			bot.save('Talk:Deprod test/1', 'some text'),
			bot.save('Deprod test/redirect 1', '#REDIRECT [[Deprod test/1]]'),
			bot.save('Deprod test/2', '[[Category:Proposed deletion as of 1 March 2021]]'),
			bot.save('Talk:Deprod test/2', 'some text'),
			bot.save('Deprod test/3', '[[Category:Proposed deletion as of 1 March 2021]]'),
			bot.save('Deprod test/redirect 3/1', '#REDIRECT [[Deprod test/3]]'),
			bot.save('Deprod test/redirect 3/2', '#REDIRECT [[Deprod test/3]]'),
			bot.save('Deprod test/4', '[[Category:Proposed deletion as of 1 March 2021]]'),
			bot.save('Deprod test/redirect 4/1', '#REDIRECT [[Deprod test/4]]'),
			bot.save('Deprod test/5', '[[Category:Proposed deletion as of 1 March 2021]]'),
			bot.save('Category:Proposed deletion as of 1 March 2021', 'Category description page'),
			setupMWBrowser(page),
		]);

		await goto('Category:Proposed deletion as of 1 March 2021');
		let deprod = await new TwinkleModule('deprod').open();
		await page.uncheck('input[value="Deprod test/4"]');
		await deprod.submit(); // TODO: fixup actionCompleted message display in deprod so this actually resolves,
		// will involve porting Morebits.batchOperation to use promises.

		await Promise.all([
			expect(bot.read('Deprod test/1')).to.eventually.have.property('missing'),
			expect(bot.read('Talk:Deprod test/1')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/redirect 1')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/2')).to.eventually.have.property('missing'),
			expect(bot.read('Talk:Deprod test/2')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/3')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/redirect 3/1')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/redirect 3/2')).to.eventually.have.property('missing'),
			expect(bot.read('Deprod test/5')).to.eventually.have.property('missing'),

			// These should still exist (notice the .not in the assertion)
			expect(bot.read('Deprod test/4')).to.eventually.not.have.property('missing'),
			expect(bot.read('Deprod test/redirect 4/1')).to.eventually.not.have.property('missing'),
		]);
	});
});
