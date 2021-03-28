const path = require('path');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: './src/twinkle.ts',
	target: ['web', 'es5'],
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					// disable type checker - we will use it in fork plugin
					transpileOnly: true,
				},
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
	},
	plugins: [
		// new ForkTsCheckerWebpackPlugin()
	],
	output: {
		filename: 'twinkle.js',
		path: path.resolve(__dirname, 'build'),
	},
};
