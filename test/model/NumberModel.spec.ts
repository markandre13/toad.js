import { expect } from "@esm-bundle/chai"
import { NumberModel } from "@toad/model/NumberModel"

describe("NumberModel", function () {
    it("increment()", function () {
        const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
        model.increment()
        expect(model.value).to.equal(0.6)
        model.increment()
        expect(model.value).to.equal(0.7)
        model.increment()
        expect(model.value).to.equal(0.8)
    })
    it("decrement", function () {
        const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
        model.decrement()
        expect(model.value).to.equal(0.4)
        model.decrement()
        expect(model.value).to.equal(0.3)
        model.decrement()
        expect(model.value).to.equal(0.2)
    })
})
