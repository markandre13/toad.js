import { expect } from '@esm-bundle/chai'
import { Fragment, Text, TextModel, NumberModel, bindModel, unbind } from "@toad"

describe("view", function () {

    beforeEach( () => {
        unbind()
        document.body.innerHTML = ""
    })

    describe("Text", function () {

        describe("NumberModel", function () {
            it("view and model are in sync", function () {
                const model = new NumberModel(42, { min: 0, max: 100, step: 1 })

                const content = <><Text model={model} /></> as Fragment
                content.replaceIn(document.body)
                const view = content[0] as Text

                expect(view.value).to.equal(`${model.value}`)

                model.value = 17
                expect(view.value).to.equal(`${model.value}`)

                view.value = "81"
                expect(view.value).to.equal(`${model.value}`)
            })
            it("works when using JSX", async function () {
                const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })

                document.body.innerHTML = ""
                document.body.appendChild(<Text model={model} />)

                let view = document.body.children[0]
                expect(view.getAttribute("value")).to.equal("0.5")   
            })
            // range
            // scroll wheel
        })
        describe("TextModel", function () {
            describe("initialize view from model", function () {
                it("does so when the model is defined before the view", function () {
                    const model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    const view = document.body.children[0]
                    // console.log(view.nodeName)

                    expect(view.getAttribute("value")).to.equal("alpha")
                })

                it("does so when the view is defined before the model", function () {
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    
                    const model = new TextModel("alpha")
                    bindModel("model", model)
                    
                    const view = document.body.children[0]
                    expect(view.getAttribute("value")).to.equal("alpha")              
                })

                it("works when using JSX", async function () {
                    // const model = new NumberModel(0.5, { min: 0.0, max: 1.0, step: 0.1 })
                    const model = new TextModel("alpha")

                    document.body.innerHTML = ""
                    document.body.appendChild(<Text model={model} />)

                    let view = document.body.children[0]
                    expect(view.getAttribute("value")).to.equal("alpha")   
                })
            })

            describe("on change sync data between model and view", function () {
                it("updates the html element when the model changes", function () {
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let checkbox = document.body.children[0]
                    expect(checkbox.getAttribute("value")).to.equal("alpha")
                    model.value = "bravo"
                    expect(checkbox.getAttribute("value")).to.equal("bravo")
                })

                it("updates the model when the html element changes", function () {
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<toad-text model='model'></toad-text>"
                    let view = document.body.children[0] as Text
                    expect(model.value).to.equal("alpha")
                    view.setAttribute("value", "bravo")
                    expect(model.value).to.equal("bravo")
                })
            })

            it("unregisters the view from the model when the view is removed from the dom", function () {
                let model = new TextModel("alfa")
                bindModel("text", model)
    
                expect(model.modified.count()).to.equal(0)
    
                document.body.innerHTML = "<toad-text model='text'></toad-text><toad-text model='text'></toad-text>"
                expect(model.modified.count()).to.equal(2)
    
                document.body.removeChild(document.body.children[0])
                expect(model.modified.count()).to.equal(1)
    
                document.body.innerHTML = ""
                expect(model.modified.count()).to.equal(0)
            })
        })
    })
})
