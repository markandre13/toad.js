// copy of https://github.com/debitoor/chai-subset tweaked to work with typescript & @web/test-runner
// to work around missing @esm-bundle/chai-subset for now
// => https://github.com/esm-bundle/new-repo-instructions
//
// The MIT License (MIT)
//
// Copyright (c) 2014 
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export function chaiSubset(chai: Chai.ChaiStatic, utils: Chai.ChaiUtils) {
    var Assertion = chai.Assertion
    var assertionPrototype = Assertion.prototype

    Assertion.addMethod('containSubset', function (expected) {
        var actual = utils.flag(this, 'object')
        var showDiff = chai.config.showDiff

        assertionPrototype.assert.call(this,
            compare(expected, actual),
            'expected #{act} to contain subset #{exp}',
            'expected #{act} to not contain subset #{exp}',
            expected,
            actual,
            showDiff
        )
    })

    chai.assert.containSubset = function (val, exp, msg) {
        new chai.Assertion(val, msg).to.be.containSubset(exp)
    }

    function compare(expected: any, actual: any): boolean {
        if (expected === actual) {
            return true
        }
        if (typeof (actual) !== typeof (expected)) {
            return false
        }
        if (typeof (expected) !== 'object' || expected === null) {
            return expected === actual
        }
        if (!!expected && !actual) {
            return false
        }

        if (Array.isArray(expected)) {
            if (typeof (actual.length) !== 'number') {
                return false
            }
            var aa = Array.prototype.slice.call(actual)
            return expected.every(function (exp) {
                return aa.some(function (act) {
                    return compare(exp, act)
                })
            })
        }

        if (expected instanceof Date) {
            if (actual instanceof Date) {
                return expected.getTime() === actual.getTime()
            } else {
                return false
            }
        }

        return Object.keys(expected).every(function (key) {
            var eo = expected[key]
            var ao = actual[key]
            if (typeof (eo) === 'object' && eo !== null && ao !== null) {
                return compare(eo, ao)
            }
            if (typeof (eo) === 'function') {
                return eo(ao)
            }
            return ao === eo
        })
    }
}
