import { expect } from "chai"
import { CheckboxView, BooleanModel, bind, unbind } from "@toad"

describe("toad.js", function() {

    function clearAll() {
      unbind()
      document.body.innerHTML = ""
    }

    describe("<toad-check> and BooleanModel", function() {
        describe("initialize view from model", function() {
            it("does so when the model is defined before the view", function() {
                let model = new BooleanModel(true)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0]
   
                expect(checkbox.hasAttribute("checked")).to.equal(true)
                clearAll()

                model = new BooleanModel(false)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                expect(checkbox.hasAttribute("checked")).to.equal(false)
                clearAll()
            })

            it("does so when the view is defined before the model", function() {
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0]
                let model = new BooleanModel(true)
                bind("bool", model)
                expect(checkbox.hasAttribute("checked")).to.equal(true)
                clearAll()

                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                checkbox = document.body.children[0]
                model = new BooleanModel(false)
                bind("bool", model)
                expect(checkbox.hasAttribute("checked")).to.equal(false)
                clearAll()
            })
        })

        describe("on change sync data between model and view", function() {

            it("updates the html element when the model changes", function() {
                let model = new BooleanModel(true)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0]
                expect(checkbox.hasAttribute("checked")).to.equal(true)
                model.value = false
                expect(checkbox.hasAttribute("checked")).to.equal(false)
                clearAll()
            })
  
            it("updates the model when the html element changes", function() {
                let model = new BooleanModel(false)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0] as CheckboxView
                expect(model.value).not.to.equal(true)
                checkbox.setAttribute("checked", "")
                expect(model.value).to.equal(true)
                clearAll()
            })
        })
    })
})
