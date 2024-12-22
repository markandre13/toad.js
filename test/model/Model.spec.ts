import { expect } from "chai"
import { COLOR, DESCRIPTION, ENABLED, ERROR, LABEL, Model } from "@toad/model/Model"

describe("models", () => {
    describe("Model", () => {
        describe("enabled", () => {
            it("initially true", () => {
                const model = new Model()
                expect(model.enabled).to.be.true
            })
            it("initializable via constructor", () => {
                const model = new Model({ enabled: false })
                expect(model.enabled).to.be.false
            })
            it("get, set and change event", () => {
                const model = new Model()
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.enabled = false
                expect(model.enabled).to.be.false
                expect(event.type).to.equal(ENABLED)
            })
        })
        describe("label", () => {
            it("initially undefined", () => {
                const model = new Model()
                expect(model.label).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new Model({ label: "alice" })
                expect(model.label).to.equal("alice")
            })
            it("get, set and change event", () => {
                const model = new Model()
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.label = "alice"
                expect(model.label).to.equal("alice")
                expect(event.type).to.equal(LABEL)
            })
        })
        describe("description", () => {
            it("initially undefined", () => {
                const model = new Model()
                expect(model.description).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new Model({ description: "alice" })
                expect(model.description).to.equal("alice")
            })
            it("get, set and change event", () => {
                const model = new Model()
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.description = "alice"
                expect(model.description).to.equal("alice")
                expect(event.type).to.equal(DESCRIPTION)
            })
        })
        describe("color", () => {
            it("initially undefined", () => {
                const model = new Model()
                expect(model.description).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new Model({ color: "alice" })
                expect(model.color).to.equal("alice")
            })
            it("get, set and change event", () => {
                const model = new Model()
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.color = "alice"
                expect(model.color).to.equal("alice")
                expect(event.type).to.equal(COLOR)
            })
        })
        describe("error", () => {
            it("initially undefined", () => {
                const model = new Model()
                expect(model.error).to.be.undefined
            })
            it("initializable via constructor", () => {
                const model = new Model({ error: "alice" })
                expect(model.error).to.equal("alice")
            })
            it("get, set and change event", () => {
                const model = new Model()
                let event: any
                model.signal.add((ev) => {
                    event = ev
                })
                model.error = "alice"
                expect(model.error).to.equal("alice")
                expect(event.type).to.equal(ERROR)
            })
        })
    })
})
