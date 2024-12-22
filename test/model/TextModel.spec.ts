import { expect } from "chai"
import { TextModel } from "@toad/model/TextModel"

describe("TextModel", function () {
    describe("properties", function () {
        describe("value", () => {
            it('TextModel() has value ""', () => {
                const model = new TextModel()
                expect(model.value).to.equal("")
            })
            it("initializable via constructor", () => {
                const model = new TextModel("hello", { label: "text", description: "desc", default: "none" })
                expect(model.value).to.equal("hello")
            })
            it("promise sets a function, which is called once to set the value at a later time", () => {
                const model = new TextModel()
                let counter = 0
                model.promise = () => {
                    ++counter
                    return "hello"
                }
                expect(counter).to.equal(0)
                expect(model.value).to.equal("hello")
                expect(counter).to.equal(1)
                expect(model.value).to.equal("hello")
                expect(counter).to.equal(1)
            })
            it("setting the value clears it's error", () => {
                const model = new TextModel("hello", { error: "wrong" })
                model.value = "world"
                expect(model.error).to.be.undefined
            })
        })
    })
})
