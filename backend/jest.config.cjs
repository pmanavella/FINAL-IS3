module.exports = {
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(test).[jt]s"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ['text', 'lcov', 'cobertura'],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "test-results", outputName: "junit.xml" }]
  ]
};