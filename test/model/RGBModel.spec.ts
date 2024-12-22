import { RGBModel } from "@toad/model/RGBModel"
import { expect } from "chai"

describe("RGBModel", function () {
    describe("value", () => {
        it("RGBModel({r:16, g:32, b:64})", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            expect(model.value).to.deep.equal({ r: 16, g: 32, b: 64 })
        })
        it('RGBModel("#RRGGBB")', () => {
            const model = new RGBModel("#102040")
            expect(model.value).to.deep.equal({ r: 16, g: 32, b: 64, a: 1 })
        })
        it("value = \"#RRGGB\"", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            model.value = "#010203"
            expect(model.value).to.deep.equal({ r: 1, g: 2, b: 3 })
        })
        it("change nothing", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            let changed = false
            model.signal.add( () => {
                changed = true
            })
            model.value = { r: 16, g: 32, b: 64 }
            expect(changed).to.be.false
        })
        it("change only R", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            let changed = false
            model.signal.add( () => {
                changed = true
            })
            model.value = { r: 128, g: 32, b: 64 }
            expect(changed).to.be.true
            expect(model.value).to.deep.equal({ r: 128, g: 32, b: 64 })
        })
        it("change only G", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            let changed = false
            model.signal.add( () => {
                changed = true
            })
            model.value = { r: 16, g: 128, b: 64 }
            expect(changed).to.be.true
            expect(model.value).to.deep.equal({ r: 16, g: 128, b: 64 })
        })
        it("change only B", () => {
            const model = new RGBModel({ r: 16, g: 32, b: 64 })
            let changed = false
            model.signal.add( () => {
                changed = true
            })
            model.value = { r: 16, g: 32, b: 128}
            expect(changed).to.be.true
            expect(model.value).to.deep.equal({ r: 16, g: 32, b:  128})
        })
        // it("initializable via constructor", () => {
        //     const model = new TextModel("hello")
        //     expect(model.value).to.equal("hello")
        // })
        // it("promise sets a function, which is called once to set the value at a later time", () => {
        //     const model = new TextModel()
        //     let counter = 0
        //     model.promise = () => {
        //         ++counter
        //         return "hello"
        //     }
        //     expect(counter).to.equal(0)
        //     expect(model.value).to.equal("hello")
        //     expect(counter).to.equal(1)
        //     expect(model.value).to.equal("hello")
        //     expect(counter).to.equal(1)
        // })
        // it("setting the value clears it's error", () => {
        //     const model = new TextModel("hello", { error: "wrong" })
        //     model.value = "world"
        //     expect(model.error).to.be.undefined
        // })
    })
})
