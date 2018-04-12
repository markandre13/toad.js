const httpServer = require("http-server")
const puppeteer = require("puppeteer")
const { expect } = require("chai")
const _ = require("lodash")
const globalVariables = _.pick(global, ["browser", "expect", "httpd"]);

// puppeteer options
const opts = {
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true,
//  slowMo: 100,
  timeout: 100000
};

// expose variables
before (async function () {
  global.expect = expect
  global.browser = await puppeteer.launch(opts)
  global.httpd = httpServer.createServer()
  global.httpd.listen(8080, "127.0.0.1")
})

// close browser and reset global variables
after (function () {
  httpd.close()
  browser.close()

  global.browser = globalVariables.browser
  global.expect = globalVariables.expect
  global.httpd = globalVariables.httpd
});
