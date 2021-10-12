import { setupMWBrowser, setupMwn, bot, goto, TwinkleModuleTest, readText, lastDiff, bot2 } from './test_base';

describe('block', () => {
	jest.setTimeout(500000);

	beforeAll(async () => {
		await Promise.all([setupMwn(), setupMWBrowser(page), bot2.login()]);
	});

	// TODO

	test.skip('blocking', async () => {});

	test.skip('sending block notice', async () => {});

	test.skip('partial blocking', async () => {});

	test.skip('blocking IP range', async () => {});
});
