import * as toadJSX from '@toad/util/jsx'

import { expect } from "chai"
import { TextView, NumberModel, bind, unbind } from "@toad"

describe("toad.js", function () {

    function clearAll() {
        unbind()
        document.body.innerHTML = ""
    }

    // FIXME: make _value protected in Model!!!

    describe("<toad-text>", function () {
        describe("NumberModel", function () {
            it.only("view and model are in sync", function () {
                const model = new NumberModel(42, { min: 0, max: 100, step: 1 })

                const content = <><toad-text model={model} /></> as toadJSX.Fragment
                content.replaceIn(document.body)
                const view = content[0] as TextView

                expect(view.value).to.equal(`${model.value}`)

                model.value = 17
                expect(view.value).to.equal(`${model.value}`)

                view.value = "81"
                expect(view.value).to.equal(`${model.value}`)
            })
        })
    })

    // xdescribe("<toad-text> and TextModel", function() {
    //     describe("initialize view from model", function() {
    //         it("does so when the model is defined before the view", function() {
    //             let model = new BooleanModel(true)
    //             bind("bool", model)
    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             let checkbox = document.body.children[0]

    //             expect(checkbox.hasAttribute("checked")).to.equal(true)
    //             clearAll()

    //             model = new BooleanModel(false)
    //             bind("bool", model)
    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             expect(checkbox.hasAttribute("checked")).to.equal(false)
    //             clearAll()
    //         })

    //         it("does so when the view is defined before the model", function() {
    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             let checkbox = document.body.children[0]
    //             let model = new BooleanModel(true)
    //             bind("bool", model)
    //             expect(checkbox.hasAttribute("checked")).to.equal(true)
    //             clearAll()

    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             checkbox = document.body.children[0]
    //             model = new BooleanModel(false)
    //             bind("bool", model)
    //             expect(checkbox.hasAttribute("checked")).to.equal(false)
    //             clearAll()
    //         })
    //     })

    //     describe("on change sync data between model and view", function() {

    //         it("updates the html element when the model changes", function() {
    //             let model = new BooleanModel(true)
    //             bind("bool", model)
    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             let checkbox = document.body.children[0]
    //             expect(checkbox.hasAttribute("checked")).to.equal(true)
    //             model.value = false
    //             expect(checkbox.hasAttribute("checked")).to.equal(false)
    //             clearAll()
    //         })

    //         it("updates the model when the html element changes", function() {
    //             let model = new BooleanModel(false)
    //             bind("bool", model)
    //             document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
    //             let checkbox = document.body.children[0] as CheckboxView
    //             expect(model.value).not.to.equal(true)
    //             checkbox.setAttribute("checked", "")
    //             expect(model.value).to.equal(true)
    //             clearAll()
    //         })
    //     })
    // })
})
