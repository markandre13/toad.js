module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript", "source-map-support"],
    files: [ 
      { pattern: "test/**/*.spec.ts" },
      { pattern: "src/**/*.ts" }
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    reporters: ["mocha", "karma-typescript"],
    karmaTypescriptConfig: {
      compilerOptions: {
        "target": "es6",
        "module": "commonjs",
        "moduleResolution": "node",
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
      }
    },
    port: 9876,
    colors: true,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true
    // browserNoActivityTimeout: 0
  })
}
