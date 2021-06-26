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
      compilerOptions: {
        module: "commonjs",   // required by karma-typescript's internal bundler
        sourceMap: true
      },
      bundlerOptions: {
        sourceMap: true
      },
      coverageOptions: {
        instrumentation: false,
        sourceMap: true
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
