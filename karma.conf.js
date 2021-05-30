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
      bundlerOptions: {
        sourceMap: true
      },
      // we don't need coverage and it breaks sourcemap
      coverageOptions: {
        instrumentation: false,
      },
      compilerOptions: {
        "target": "es6",
        "module": "commonjs",
        "traceResolution": false,
        "baseUrl": ".",
        "paths": {
          "@toad": [ "src/toad" ],
          "@toad/*": [ "src/*" ]
        },
        "noImplicitOverride": true,
        "strict": true,
        "allowJs": false,
        "noImplicitAny": true,
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
