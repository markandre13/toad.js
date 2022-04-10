import { expect } from '@esm-bundle/chai'
import { BooleanModel, bindModel, unbind } from "@toad"

describe("view", function () {

    this.afterEach(() => {
        unbind()
        document.body.innerHTML = ""
    })

    function isChecked() {
        let checkbox = document.body.children[0].shadowRoot!.children[0] as HTMLInputElement
        return checkbox.checked
    }

    function setChecked(checked: boolean) {
        let checkbox = document.body.children[0].shadowRoot!.children[0] as HTMLInputElement
        checkbox.checked = checked
        checkbox.dispatchEvent(new Event("change"))
    }

    describe("checkbox", function () {
        describe("initialize view from model", function () {
            describe("does so when the model is defined before the view", function () {
                it("true", function () {
                    const model = new BooleanModel(true)
                    bindModel("bool", model)
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                    expect(isChecked()).to.equal(true)
                })

                it("false", function () {
                    const model = new BooleanModel(false)
                    bindModel("bool", model)
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                    expect(isChecked()).to.equal(false)
                })
            })

            describe("does so when the view is defined before the model", function () {
                it("true", function () {
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                    const model = new BooleanModel(true)
                    bindModel("bool", model)
                    expect(isChecked()).to.equal(true)
                })

                it("false", function () {
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                    const model = new BooleanModel(false)
                    bindModel("bool", model)
                    expect(isChecked()).to.equal(false)
                })
            })
        })

        describe("on change sync data between model and view", function () {

            it("updates the html element when the model changes", function () {
                const model = new BooleanModel(true)
                bindModel("bool", model)
                document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                expect(isChecked()).to.equal(true)

                model.value = false
                expect(isChecked()).to.equal(false)
            })

            it("updates the model when the html element changes", function () {
                let model = new BooleanModel(false)
                bindModel("bool", model)
                document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"

                setChecked(true)
                expect(model.value).to.equal(true)
            })
        })
    })
})
