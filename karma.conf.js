module.exports = (config) => {
  config.set({
    basePath: '.',
    frameworks: ["mocha", "chai", "karma-typescript"],
    files: [ 
      "test/**/*.ts",
      "src/**/*.ts",
      { pattern: 'node_modules/**/*.js.map', included: false, served: true, watched: false, nocache: true }
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript", "sourcemap"]
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
