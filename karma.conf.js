module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [ 
      "test/**/*.spec.ts",
      "src/**/*.ts"
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    reporters: ["mocha", "karma-typescript"],
    coverageOptions: {
      instrumentation: false,
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        "target": "es6",
        "module": "commonjs",
        "traceResolution": false,
        "baseUrl": ".",
        "paths": {
          "toad.js": [ "src/toad" ],
          "toad.js/*": [ "src/*" ]
        },
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
