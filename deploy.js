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
 * Script adapted from https://github.com/wikimedia-gadgets/xfdcloser/blob/master/bin/deploy.js
 * by Evad37 (MIT licence)
 */
const fs = require("fs");
const {mwn} = require("mwn");
const {execSync} = require("child_process");
const prompt = require("prompt-sync")({sigint: true});

let username, password;
try {
	const credentials = require("./credentials.json");
	username = credentials.username;
	password = credentials.password;
} finally {
	if (!username) {
		username = prompt("> Enter username");
	}
	if (!password) {
		password = prompt.hide("> Enter password");
	}
}

const deployTargets = [
	{file: "build/bundle.js", target: "MediaWiki:Gadget-Twinkle.js"}
];

function logError(error) {
	error = error || {};
	console.log(
		(error.info || "Unknown error")+"\n",
		JSON.stringify(error.response||error)
	);
}

function log(...args) {
	let colorCode;
	switch (args[0]) {
		case 'black':   colorCode = 30; break;
		case 'red':     colorCode = 31; break;
		case 'green':   colorCode = 32; break;
		case 'yellow':  colorCode = 33; break;
		case 'blue':    colorCode = 34; break;
		case 'magenta': colorCode = 35; break;
		case 'cyan':    colorCode = 36; break;
		case 'white':   colorCode = 37; break;
	}
	if (colorCode) {
		console.log(`\x1b[${colorCode}m%s\x1b[0m`, ...args);
	} else {
		console.log(...args);
	}
}

// Prompt user for info
const wiki = prompt("> Wikipedia subdomain: ");
const beta = prompt("> Beta deployment [Y/n]: ");
const isBeta = beta.trim().toUpperCase() !== "N";
log(`Targeting ${isBeta ? "BETA" : "MAIN"} version of script.`);
const message = prompt("> Edit summary message (optional): ");

// Extract info for edit summary.
const version = require("./package.json").version;
const sha = execSync("git rev-parse --short HEAD").toString("utf8").trim();
const editSummary = `v${version} at ${sha}: ${message || "Updated from repository"}`;
log(`Edit summary is: "${editSummary}"`);

const api = new mwn({
	apiUrl: `https://${wiki}.wikipedia.org/w/api.php`,
	username: username,
	password: password
});

log(`... logging in as ${username}  ...`);
api.loginGetToken().then(() => {
	prompt("> Press [Enter] to start deploying or [ctrl + C] to cancel");
	log("--- starting deployment ---");
	const editPromises = deployTargets.map(deployment => {
		let content = fs.readFileSync("./dist/"+deployment.file, "utf8").toString();
		return api.save(deployment.target, content, editSummary).then((response) => {
			if (response && response.nochange) {
				log('yellow', `━ No change saving ${deployment.file} to ${wiki}:${deployment.target}`);
			} else {
				log('green', `✔ Successfully saved ${deployment.file} to ${wiki}:${deployment.target}`);
			}
		}, (error) => {
			log('red', `✘ Failed to save ${deployment.file} to ${wiki}:${deployment.target}`);
			logError(error);
		});
	});
	Promise.all(editPromises).then(() => {
		log("--- end of deployment ---");
	});
}).catch(logError);
