import { expect } from "chai"
import { TextModel } from "@toad/appkit/TextModel"
import { VALUE, VALUE_LOADING, VALUE_UNKNOWN } from "@toad/appkit/ValueModel"
import { describe, it } from "vitest"

function collectEvents(model: TextModel): any[] {
    const events: any[] = []
    model.signal.add((ev) => {
        events.push(ev)
    })
    return events
}

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
            it("setting a string emits one VALUE event", () => {
                const model = new TextModel("hello")
                const events = collectEvents(model)
                model.value = "world"
                expect(events).to.have.length(1)
                expect(events[0].type).to.equal(VALUE)
            })
            it("setting the same string emits no event", () => {
                const model = new TextModel("hello")
                const events = collectEvents(model)
                model.value = "hello"
                expect(events).to.have.length(0)
            })
            it("setting the value clearing an error emits only one event", () => {
                const model = new TextModel("hello", { error: "wrong" })
                const events = collectEvents(model)
                model.value = "world"
                expect(events).to.have.length(1)
            })
            it("setting a non-string leaves the value unchanged", () => {
                const model = new TextModel("hello")
                const events = collectEvents(model)
                model.value = 42 as any
                expect(model.value).to.equal("hello")
                expect(events).to.have.length(0)
            })
        })

        describe("special values", () => {
            it("constructor accepts VALUE_UNKNOWN", () => {
                const model = new TextModel(VALUE_UNKNOWN)
                expect(model.value).to.be.undefined
                expect(model.isUnknown()).to.be.true
            })
            it("VALUE_UNKNOWN makes value undefined and emits VALUE", () => {
                const model = new TextModel("hello")
                const events = collectEvents(model)
                model.value = VALUE_UNKNOWN
                expect(model.value).to.be.undefined
                expect(model.isUnknown()).to.be.true
                expect(model.isLoading()).to.be.false
                expect(events).to.have.length(1)
                expect(events[0].type).to.equal(VALUE)
            })
            it("VALUE_LOADING makes value undefined and isLoading true", () => {
                const model = new TextModel("hello")
                model.value = VALUE_LOADING
                expect(model.value).to.be.undefined
                expect(model.isLoading()).to.be.true
                expect(model.isUnknown()).to.be.false
            })
            it("setting a string after a special value restores the value", () => {
                const model = new TextModel("hello")
                model.value = VALUE_LOADING
                model.value = "world"
                expect(model.value).to.equal("world")
                expect(model.isLoading()).to.be.false
            })
            it("a special value overrides a promise without calling it", () => {
                const model = new TextModel()
                let counter = 0
                model.promise = () => {
                    ++counter
                    return "hello"
                }
                model.value = VALUE_UNKNOWN
                expect(model.value).to.be.undefined
                expect(counter).to.equal(0)
            })
        })

        describe("promise", () => {
            it("returns a function which returns a string value", () => {
                const model = new TextModel("hello")
                expect(model.promise()).to.equal("hello")
            })
            it("returns the assigned function", () => {
                const model = new TextModel()
                const f = () => "hello"
                model.promise = f
                expect(model.promise).to.equal(f)
            })
            it("setting a promise emits one VALUE event", () => {
                const model = new TextModel()
                const events = collectEvents(model)
                model.promise = () => "hello"
                expect(events).to.have.length(1)
                expect(events[0].type).to.equal(VALUE)
            })
            it("value is read once and cached until a new promise is assigned", () => {
                const model = new TextModel()
                let counter = 0
                model.promise = () => {
                    ++counter
                    return "first"
                }
                expect(model.value).to.equal("first")
                expect(model.value).to.equal("first")
                expect(counter).to.equal(1)

                model.promise = () => {
                    ++counter
                    return "second"
                }
                expect(counter).to.equal(1)
                expect(model.value).to.equal("second")
                expect(model.value).to.equal("second")
                expect(counter).to.equal(2)
            })
            it("setting a string replaces the promise", () => {
                const model = new TextModel()
                model.promise = () => "hello"
                model.value = "world"
                expect(model.value).to.equal("world")
                expect(model.promise()).to.equal("world")
            })
        })
    })
})
