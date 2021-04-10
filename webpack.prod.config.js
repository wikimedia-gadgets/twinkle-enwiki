const path = require('path');

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
	performance: {
		hints: false,
	},
};
