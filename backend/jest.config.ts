/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {

  collectCoverage: false,
  //coverageDirectory: "coverage",
  //coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ['**/*.test.ts'],
  forceExit: true,

};

export default config;
