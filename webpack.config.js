const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));

const corePath = args.core || '../twinkle-core';

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: './src/twinkle.ts',
	target: ['web', 'es5'],
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
	},
	output: {
		filename: 'twinkle.js',
		path: path.resolve(__dirname, 'build'),
	},
	devServer: {
		before: function (app, server, compiler) {
			app.get('/core/*', function (req, response) {
				let path = req.url.slice('/core'.length);
				let ctype = req.url.endsWith('.js') ? 'text/javascript' :
					req.url.endsWith('.css') ? 'text/css' :
						'text/plain';
				response.writeHead(200, { 'Content-Type': `${ctype}; charset=utf-8` });
				response.end(readFile(corePath + path), 'utf-8');
			});
			app.get('/css', function (req, response) {
				response.writeHead(200, { 'Content-Type': `text/css; charset=utf-8` });
				response.end(readFile('./css/twinkle.css'), 'utf-8');
			});
			app.get('/', function (req, response) {
				response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
				response.end(readFile('./dev-loader.js'), 'utf-8');
			});
		},
		contentBase: path.join(__dirname, 'build'),
		port: 5500,
	},
};

function readFile(file) {
	return fs.readFileSync(file).toString();
}

