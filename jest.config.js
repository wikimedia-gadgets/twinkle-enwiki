export default {
	projects: [
		{
			displayName: 'unit',
			testMatch: ['<rootDir>/tests/unit/*'],
			preset: 'ts-jest',
			testEnvironment: 'jsdom',
			setupFilesAfterEnv: ['mock-mediawiki'],
			globals: {
				'ts-jest': {
					diagnostics: {
						warnOnly: true,
					},
				},
			},
		},
		{
			displayName: 'integration',
			testMatch: ['<rootDir>/tests/integration/*'],
			preset: 'jest-playwright-preset',
			testEnvironmentOptions: {
				'jest-playwright': {
					launchOptions: {
						headless: true,
					},
					browsers: ['chromium', 'firefox', 'webkit'],
				},
			},
		},
	],
};
