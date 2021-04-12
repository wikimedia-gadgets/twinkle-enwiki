import * as fs from 'fs';
import * as diff from 'diff';
import { mwn } from 'mwn';
import { MwnError } from 'mwn/build/error';
import { LogEvent } from 'mwn/build/user';
import { logprop } from 'mwn/build/page';

export { fs, mwn }; // re-export

// External API clients to make and observe changes
let mwnConfig = {
	apiUrl: 'http://localhost:8080/api.php',
	password: '12345678901234567890123456789012', // BotPassword configured in setup.sh
};

export const bot = new mwn({ ...mwnConfig, username: 'Wikiuser@bp' });
export const bot2 = new mwn({ ...mwnConfig, username: 'Wikiuser2@bp' });

export function setupMwn() {
	// Don't login again if already logged in (from another file)
	if (!bot.loggedIn) {
		// Login the 1st account. The 2nd account needs to sign in only if required
		return bot.login();
	}
}

export async function setupMWBrowser(page) {
	await page.goto('http://localhost:8080/index.php?title=Special:UserLogin');
	await page.fill('#wpName1', 'Wikiuser');
	await page.fill('#wpPassword1', 'wikipassword');
	await Promise.all([
		page.click('#wpLoginAttempt'), // Clicking the link will cause a navigation
		page.waitForNavigation(), // The promise resolves after navigation has finished
	]);
}

/**
 * Do not use unless strictly necessary
 */
export async function loadExpectInBrowser() {
	// Also load expect in the browser context so that we can make expect assertions in browser context too
	// However, note that these if these fail, no meaningful logging error messages may be displayed in the
	// console. Due to this, minimise use of browser context assertions as far as possible.
	await page.evaluate(() => {
		return $.getScript('https://cdnjs.cloudflare.com/ajax/libs/expect/1.20.2/expect.min.js');
	});
}

async function readFile(path) {
	return (await fs.promises.readFile(path)).toString();
}

const twinkleCore = __dirname + '/../../../twinkle-core/';
const repoRoot = __dirname + '/../../';

// Load just morebits js code for the morebits tests
export async function loadMorebits() {
	await page.evaluate(await readFile(twinkleCore + 'morebits/morebits.js'));
}

export async function loadTwinkle() {
	await page.evaluate(() => {
		return mw.loader.using(['jquery.ui']);
	});
	// we can do without the css peer gadget
	await page.addStyleTag({
		content:
			(await readFile(twinkleCore + 'morebits/morebits.css')) + '\n' + (await readFile(repoRoot + 'css/twinkle.css')),
	});
	await page.evaluate(await readFile(twinkleCore + 'morebits/morebits.js'));
	await page.evaluate(await readFile(repoRoot + 'build/bundle.js'));
}

export class TwinkleModuleTest {
	moduleName: string;

	constructor(moduleName) {
		this.moduleName = moduleName;
	}

	async open(load = true) {
		if (load) {
			await loadTwinkle();
		}

		// Open the TW menu by checking the virtual checkbox
		await page.check('.vector-menu-checkbox[aria-labelledby="p-twinkle-label"]');
		// Click menu item
		await page.click(`#twinkle-${this.moduleName}`);
		return this;
	}
	async submit() {
		// Assumes only one quickForm is open at a time
		await page.click('.morebits-dialog-buttons button');

		// Wait until action complete message appears, or till 10 seconds
		// have passed, whichever is earlier.
		// The 10-second hack is a temporary necessity as all modules don't have
		// a functional action complete message display.
		await Promise.race([page.waitForSelector('.morebits_action_complete'), bot.sleep(10000)]);
	}
}

export async function lastDiff(page: string): Promise<LastDiff> {
	return bot
		.read(page, {
			rvlimit: 2,
			rvprop: 'content|timestamp|comment|tags',
		})
		.then((pg) => {
			if (pg.missing) {
				return Promise.reject(new MwnError.MissingPage());
			}
			if (pg.revisions.length === 1) {
				// new page creation
				pg.revisions.push({ content: '' }); // pretend the older version is empty string
			}
			// revisions[0] is the newer version
			let diffLines = diff.diffLines(pg.revisions[1].content, pg.revisions[0].content);
			return new LastDiff({
				addedLines: diffLines.filter((d) => d.added),
				removedLines: diffLines.filter((d) => d.removed),
				summary: pg.revisions[0].comment,
				tags: pg.revisions[0].tags,
				content: pg.revisions[0].content,
			});
		});
}

export class LastDiff {
	addedLines: { added: true; count: number; value: string }[];
	removedLines: { removed: true; count: number; value: string }[];
	summary: string;
	tags: string[];
	content: string;

	constructor({ addedLines, removedLines, summary, tags, content }) {
		Object.assign(this, { addedLines, removedLines, summary, tags, content });
	}

	expectToBeTwinkleEdit() {
		expect(this.tags).toEqual(['twinkle']);
		return this;
	}

	expectAddedLineToMatch(matcher: string | RegExp) {
		for (let line of this.addedLines) {
			try {
				expect(line.value).toMatch(matcher);
				return this;
			} catch {}
		}
		// if we reach here, then none of the lines matched
		throw new Error('none of the lines added matched ' + matcher);
	}

	expectRemovedLineToMatch(matcher: string | RegExp) {
		for (let line of this.removedLines) {
			try {
				expect(line.value).toMatch(matcher);
				return this; // if matched, return immediately
			} catch {}
		}
		// if we reach here, then none of the lines matched
		throw new Error('none of the lines removed matched ' + matcher);
	}
}

export async function lastLog(page: string, props?: logprop[]): Promise<LogEvent> {
	const logs = await new bot.page(page).logs(props, 1);
	return logs[0];
}

export async function createRandomPage(prefix, content?, summary?) {
	const pageName = prefix + '/' + rand();
	await bot.create(pageName, content || 'Test page', summary);
	return pageName;
}

export async function goto(pageName: string) {
	if (pageName.startsWith('?')) {
		await page.goto('http://localhost:8080/index.php' + pageName);
	} else if (pageName.startsWith('/')) {
		// path provided
		await page.goto('http://localhost:8080/index.php/wiki' + pageName);
	} else {
		await page.goto('http://localhost:8080/index.php/' + mwn.util.wikiUrlencode(pageName));
	}
}

export async function createAndGotoRandomPage(prefix, content?, summary?) {
	const pageName = await createRandomPage(prefix, content, summary);
	await goto(pageName);
	return pageName;
}

export function rand(digits = 5) {
	return String(Math.random()).slice(2, 2 + digits);
}

export async function readText(pageName) {
	return (await bot.read(pageName)).revisions[0].content;
}
