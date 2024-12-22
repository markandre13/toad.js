import { DEFAULT_VALUE, VALUE, ValueModel } from "@toad/model/ValueModel"
import { expect } from "chai"

describe("models", () => {
    describe("ValueModel", () => {
        describe("value", () => {
            it("initialized via constructor", () => {
                const model = new ValueModel(42)
                expect(model.value).to.equal(42)
            })
            it("get, set and change event", () => {
                const model = new ValueModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.value = 24
                expect(model.value).to.equal(24)
                expect(event.type).to.equal(VALUE)
            })
        })
        describe("default", () => {
            it("initially undefined", () => {
                const model = new ValueModel(42)
                expect(model.default).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new ValueModel(42, { default: 50 })
                expect(model.default).to.equal(50)
            })
            it("get, set and change event", () => {
                const model = new ValueModel(42)
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.default = 50
                expect(model.default).to.equal(50)
                expect(event.type).to.equal(DEFAULT_VALUE)
            })
        })
    })
})
