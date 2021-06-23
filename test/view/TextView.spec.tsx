import { expect } from "chai"
import { TextView, TextModel, NumberModel, bind, unbind, Fragment } from "@toad"

describe("toad.js", function () {

    beforeEach( () => {
        unbind()
        document.body.innerHTML = ""
    })

    describe("<toad-text>", function () {
        describe("NumberModel", function () {
            it("view and model are in sync", function () {
                const model = new NumberModel(42, { min: 0, max: 100, step: 1 })

                const content = <><toad-text model={model} /></> as Fragment
                content.replaceIn(document.body)
                const view = content[0] as TextView

                expect(view.value).to.equal(`${model.value}`)

                model.value = 17
                expect(view.value).to.equal(`${model.value}`)

                view.value = "81"
                expect(view.value).to.equal(`${model.value}`)
            })
            // range
            // scroll wheel
        })
        describe("TextModel", function () {
            describe("initialize view from model", function () {
                it("does so when the model is defined before the view", function () {
                    let model = new TextModel("alpha")
                    bind("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let view = document.body.children[0]
                    console.log(view.nodeName)

                    expect(view.getAttribute("value")).to.equal("alpha")
                })

                it("does so when the view is defined before the model", function () {
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let checkbox = document.body.children[0]
                    let model = new TextModel("alpha")
                    bind("model", model)
                    
                    expect(checkbox.getAttribute("value")).to.equal("alpha")              
                })
            })

            describe("on change sync data between model and view", function () {
                it("updates the html element when the model changes", function () {
                    let model = new TextModel("alpha")
                    bind("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let checkbox = document.body.children[0]
                    expect(checkbox.getAttribute("value")).to.equal("alpha")
                    model.value = "bravo"
                    expect(checkbox.getAttribute("value")).to.equal("bravo")
                })

                it("updates the model when the html element changes", function () {
                    let model = new TextModel("alpha")
                    bind("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let view = document.body.children[0] as TextView
                    expect(model.value).to.equal("alpha")
                    view.setAttribute("value", "bravo")
                    expect(model.value).to.equal("bravo")
                })
            })
        })
    })

    xdescribe("<toad-text> and TextModel", function () {

    })
})
