// Adapted from https://github.com/wikimedia-gadgets/xfdcloser/blob/master/bin/deploy.js
// (MIT Licence)
/**
 * This script is used to deploy files to the wiki.
 * You must have interface-admin rights to use this.
 *
 * ----------------------------------------------------------------------------
 *    Set up:
 * ----------------------------------------------------------------------------
 * 1) Use [[Special:BotPasswords]] to get credentials. Make sure you enable
 *    sufficient permissions.
 * 2) Create a JSON file to store the username and password. This should be
 *    a plain JSON object with keys "username" and "password", see README
 *    file for an example. Save it here in the "bin" directory with file
 *    name "credentials.json".
 *    IMPORTANT: Never commit this file to the repository!
 *
 * ---------------------------------------------------------------------------
 *    Pre-deployment checklist:
 * ---------------------------------------------------------------------------
 * 1) Changes committed and merged to master branch on GitHub repo
 * 2) Currently on master branch, and synced with GitHub repo
 * 3) Version bumped, and that change committed and synced to GitHub repo
 * 3) Run a full build using "npm run build"
 * When all of the above are done ==> you are ready to proceed with deployment
 *
 * --------------------------------------------------------------------------
 *    Usage:
 * --------------------------------------------------------------------------
 * Ensure the pre-deployment steps above are completed, unless you are only
 * deploying to the testwiki (test.wikipedia.org). Then, run this script:
 * In the terminal, enter
 *     node bin/deploy.js
 * and supply the requested details.
 * Notes:
 * - The default summary if not specified is "Updated from repository"
 * - Edit summaries will be prepended with the version number from
 *   the package.json file
 * - Changes to gadget definitions need to be done manually
 *
 */
const fs = require('fs/promises');
const { mwn } = require('mwn');
const { execSync } = require('child_process');
const prompts = require('prompts');
const chalk = require('chalk');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2));
console.log(args);

async function prompt(message, type = 'text', initial = '') {
	let name = String(Math.random());
	return (await prompts({ type, name, message, initial }))[name];
}

class Deploy {
	deployTargets = [
		{ file: 'build/twinkle.js', target: 'MediaWiki:Gadget-Twinkle.js' },
		{ file: 'build/twinkle.css', target: 'MediaWiki:Gadget-Twinkle.css' },
		{
			file: 'build/twinkle-pagestyles.css',
			target: 'MediaWiki:Gadget-Twinkle-pagestyles.css',
		},
		{ file: 'build/morebits.js', target: 'MediaWiki:Gadget-morebits.js' },
		{ file: 'build/morebits.css', target: 'MediaWiki:Gadget-morebits.css' },
	];

	async deploy() {
		this.loadConfig();
		await this.getApi();
		await this.login();
		await this.makeEditSummary();
		await this.savePages();
	}

	loadConfig() {
		try {
			// TODO: strip comments first?
			return require('./credentials.json');
		} catch (e) {
			return {};
		}
	}

	async getApi() {
		const config = this.loadConfig();
		this.api = new mwn(config);
		try {
			this.api.initOAuth();
			this.usingOAuth = true;
		} catch (e) {
			if (!config.username) {
				config.username = await prompt('> Enter username');
			}
			if (!config.password) {
				config.password = await prompt('> Enter password', 'password');
			}
			this.api.setOptions(config);
		}
	}

	async login() {
		this.siteCode = args.enwiki ? 'en' : args.testwiki ? 'test' : throw new Error('use either --enwiki or --testwiki');
		this.api.setApiUrl(`https://${this.siteCode}.wikipedia.org/w/api.php`);
		if (this.usingOAuth) {
			await this.api.getTokensAndSiteInfo();
		} else {
			await this.api.login();
		}
	}

	async makeEditSummary() {
		const version = require('./package.json').version;
		const sha = execSync('git rev-parse --short HEAD').toString('utf8').trim();
		const message = await prompt('> Edit summary message (optional): ');
		this.editSummary = `v${version} at ${sha}: ${message || 'Updated from repository'}`;
		log(`Edit summary is: "${this.editSummary}"`);
	}

	async savePages() {
		await prompt('> Press [Enter] to start deploying or [ctrl + C] to cancel');

		log('yellow', '--- starting deployment ---');

		for (let [file, target] of Object.entries(this.deployTargets)) {
			let fileText = (await fs.readFile('./build/' + file)).toString();
			await this.api.save(target, fileText, this.editSummary).then(
				(response) => {
					if (response && response.nochange) {
						log('yellow', `━ No change saving ${file} to ${this.siteCode}:${target}`);
					} else {
						log('green', `✔ Successfully saved ${file} to ${this.siteCode}:${target}`);
					}
				},
				(error) => {
					log('red', `✘ Failed to save ${file} to ${this.siteCode}:${target}`);
					logError(error);
				}
			);
		}
		log('yellow', '--- end of deployment ---');
	}
}

function logError(error) {
	error = error || {};
	console.log((error.info || 'Unknown error') + '\n', JSON.stringify(error.response || error));
}

function log(color, ...args) {
	return chalk[color](...args);
}