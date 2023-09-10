import { expect } from "@esm-bundle/chai"
import { NumberModel } from "@toad/model/NumberModel"

describe("NumberModel", function () {
    describe("value = expression", function() {
        it("6 * 7 -> 42", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            model.value = "6 * 7"
            expect(model.value).to.equal(42) //
        })
        // TODO: expressions don't honor about min/max???
        // TODO: text field expressions should only be evaluated on enter key or focus lost
        // TODO: in expression code: use BigDecimal
        // TODO: in expression code: reject table cell in lexer
        // TODO: error cases
    })
    describe("value", function() {
        it("set and read", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            expect(model.value).to.equal(0.5)
            model.value = 0.25
            expect(model.value).to.equal(0.25)
            expect(model.error).to.be.undefined
        })
        it("set and read below min", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            expect(model.value).to.equal(0.5)
            model.value = -1
            expect(model.value).to.equal(-1)
            expect(model.error).to.not.be.undefined
        })
        it("set and read below min when autocorrect = true", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1, autocorrect: true })
            expect(model.value).to.equal(0.5)
            model.value = -1
            expect(model.value).to.equal(0)
            expect(model.error).to.be.undefined
        })
        it("set and read when autocorrect = true", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1, autocorrect: true })
            expect(model.value).to.equal(0.5)
            model.value = 0.25
            expect(model.value).to.equal(0.25)
            expect(model.error).to.be.undefined
        })
        it("set and read above max", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            expect(model.value).to.equal(0.5)
            model.value = 2
            expect(model.value).to.equal(2)
            expect(model.error).to.not.be.undefined
        })
        it("set and read above max when autocorrect = true", function() {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1, autocorrect: true })
            expect(model.value).to.equal(0.5)
            model.value = 2
            expect(model.value).to.equal(1)
            expect(model.error).to.be.undefined
        })
    })
    describe("increment()", function () {
        it("increments by 'step' (without floating point errors)", function () {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            model.increment()
            expect(model.value).to.equal(0.6)
            model.increment()
            expect(model.value).to.equal(0.7)
            model.increment()
            expect(model.value).to.equal(0.8)
            expect(model.error).to.be.undefined
        })
        it("does not increment beyond max when autocorrect = true", function() {
            const model = new NumberModel(0.95, { min: 0.0, max: 1.0, step: 0.1, autocorrect: true })
            model.increment()
            expect(model.value).to.equal(1.0)
            expect(model.error).to.be.undefined
        })
        it("does not increment beyond max", function() {
            const model = new NumberModel(0.95, { min: 0.0, max: 1.0, step: 0.1 })
            model.increment()
            expect(model.value).to.equal(1.0)
            expect(model.error).to.be.undefined
        })
    })
    describe("decrement()", function () {
        it("decrements by 'step' (without floating point errors)", function () {
            const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
            model.decrement()
            expect(model.value).to.equal(0.4)
            model.decrement()
            expect(model.value).to.equal(0.3)
            model.decrement()
            expect(model.value).to.equal(0.2)
            expect(model.error).to.be.undefined
        })
        it("does not decrement below min", function() {
            const model = new NumberModel(0.05, { min: 0.0, max: 1.0, step: 0.1 })
            model.decrement()
            expect(model.value).to.equal(0.0)
            expect(model.error).to.be.undefined
        })
        it("does not decrement below min when autocorrect = true", function() {
            const model = new NumberModel(0.05, { min: 0.0, max: 1.0, step: 0.1, autocorrect: true })
            model.decrement()
            expect(model.value).to.equal(0.0)
            expect(model.error).to.be.undefined
        })
    })
})
