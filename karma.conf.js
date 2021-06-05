module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript"],
    files: [ 
      "test/**/*.ts",
      "test/**/*.tsx",
      "src/**/*.ts",
      "src/**/*.tsx",
      { pattern: 'node_modules/**/*.js.map', included: false, served: true, watched: false, nocache: true }
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript", "sourcemap"],
      "**/*.tsx": ["karma-typescript", "sourcemap"]
    },
    reporters: ["mocha", "karma-typescript"],
    karmaTypescriptConfig: {
      tsconfig: "tsconfig.json",
      bundlerOptions: {
        sourceMap: true
      },
      // we don't need coverage and it breaks sourcemap
      coverageOptions: {
        instrumentation: false,
      },
      compilerOptions: {
        "module": "commonjs",
        "sourceMap": true
      },
      "exclude": [
        "lib",
        "docs"
      ]
    },
    port: 9876,
    colors: true,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true
  })
}
