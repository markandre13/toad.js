import { expect } from "chai"
import { AUTOCORRECT_VALUE, MAX_VALUE, MIN_VALUE, NumberModel, STEP_VALUE } from "@toad/model/NumberModel"

describe("NumberModel", function () {
    describe("properties", function() {
        describe("value", () => {
            it("initialized via constructor", () => {
                const model = new NumberModel(42)
                expect(model.value).to.equal(42)
            })
        })
        describe("min", () => {
            it("initially undefined", () => {
                const model = new NumberModel(42)
                expect(model.min).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new NumberModel(42, { min: 10 })
                expect(model.min).to.equal(10)
            })
            it("get, set and change event", () => {
                const model = new NumberModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.min = 10
                expect(model.min).to.equal(10)
                expect(event.type).to.equal(MIN_VALUE)
            })
        })
        describe("max", () => {
            it("initially undefined", () => {
                const model = new NumberModel(42)
                expect(model.max).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new NumberModel(42, { max: 90 })
                expect(model.max).to.equal(90)
            })
            it("get, set and change event", () => {
                const model = new NumberModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.max = 90
                expect(model.max).to.equal(90)
                expect(event.type).to.equal(MAX_VALUE)
            })
        })
        describe("step", () => {
            it("initially undefined", () => {
                const model = new NumberModel(42)
                expect(model.step).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new NumberModel(42, { step: 5 })
                expect(model.step).to.equal(5)
            })
            it("get, set and change event", () => {
                const model = new NumberModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.step = 5
                expect(model.step).to.equal(5)
                expect(event.type).to.equal(STEP_VALUE)
            })
        })
        describe("autocorrect", function() {
            it("initially false", () => {
                const model = new NumberModel(42)
                expect(model.autocorrect).to.be.false
            })
            it("initializable via constructor", () => {
                const model = new NumberModel(42, { autocorrect: true })
                expect(model.autocorrect).to.equal(true)
            })
            it("get, set and change event", () => {
                // this.timeout(1)
                const model = new NumberModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.autocorrect = true
                expect(model.autocorrect).to.equal(true)
                expect(event.type).to.equal(AUTOCORRECT_VALUE)
            })
        })
    })
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
