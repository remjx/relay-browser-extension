/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", {
      tsconfig: {
        allowJs: true
      }
    }],
  },
  transformIgnorePatterns: ["node_modules/(?!(@noble/secp256k1))"],
  setupFilesAfterEnv: ['./jest.setup.js'],
};