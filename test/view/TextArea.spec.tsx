import { expect } from 'chai'
import { TextModel, HtmlModel, bindModel, unbind } from "@toad"

describe("view", function () {

    beforeEach(() => {
        unbind()
        document.body.innerHTML = ""
    })

    function getTextArea() {
        return document.body.children[0].shadowRoot?.children[0]! as HTMLTextAreaElement
    }

    function getTextAreaText() {
        return getTextArea().innerHTML
    }

    describe("TextArea", function () {

        describe("TextModel", function () {
            describe("initialize view from model", function () {
                it("does so when the model is defined before the view", function () {
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"
                    expect(getTextAreaText()).to.equal("alpha")
                })

                it("does so when the view is defined before the model", function () {
                    document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"
                    let model = new TextModel("alpha")
                    bindModel("model", model)
                    expect(getTextAreaText()).to.equal("alpha")
                })
            })

            describe("on change sync data between model and view", function () {
                describe("TextModel", function () {
                    it("updates the html element when the model changes", function () {
                        let model = new TextModel("alpha")
                        bindModel("model", model)
                        document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"
                        expect(getTextAreaText()).to.equal("alpha")
                        model.value = "bravo"
                        expect(getTextAreaText()).to.equal("bravo")
                    })

                    it("updates the model when the html element changes", function () {
                        let model = new TextModel("alph")
                        bindModel("model", model)
                        document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"

                        const textarea = getTextArea()
                        textarea.focus()
                        textarea.dispatchEvent(new KeyboardEvent("keydown", {key: 'a', code: 'keyA'}))
                        textarea.dispatchEvent(new KeyboardEvent("keypress", {key: 'a', code: 'keyA'}))
                        textarea.innerText = textarea.innerText + "a"
                        textarea.dispatchEvent(new InputEvent(
                            "input", {
                            bubbles: true,
                            inputType: "insertText",
                            data: "a",
                        }))
                        textarea.dispatchEvent(new KeyboardEvent("keyup", {key: 'a', code: 'keyA'}))

                        expect(model.value).to.equal("alpha")
                    })
                })
                describe("HtmlModel", function () {
                    it("updates the html element when the model changes", function () {
                        let model = new HtmlModel("alpha")
                        bindModel("model", model)
                        document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"
                        expect(getTextAreaText()).to.equal("alpha")
                        model.value = "bravo"
                        expect(getTextAreaText()).to.equal("bravo")
                    })

                    it("updates the model when the html element changes", function () {
                        let model = new HtmlModel("alph")
                        bindModel("model", model)
                        document.body.innerHTML = "<tx-textarea model='model'></tx-textarea>"

                        const textarea = getTextArea()
                        textarea.focus()
                        textarea.dispatchEvent(new KeyboardEvent("keydown", {key: 'a', code: 'keyA'}))
                        textarea.dispatchEvent(new KeyboardEvent("keypress", {key: 'a', code: 'keyA'}))
                        textarea.innerHTML = textarea.innerHTML + "a"
                        textarea.dispatchEvent(new InputEvent(
                            "input", {
                            bubbles: true,
                            inputType: "insertText",
                            data: "a",
                        }))
                        textarea.dispatchEvent(new KeyboardEvent("keyup", {key: 'a', code: 'keyA'}))

                        expect(model.value).to.equal("<div>alpha</div>")
                    })
                })

            })

            it("unregisters the view from the model when the view is removed from the dom", function () {
                let model = new TextModel("alfa")
                bindModel("text", model)

                expect(model.modified.count()).to.equal(0)

                document.body.innerHTML = "<tx-textarea model='text'></tx-textarea><tx-textarea model='text'></tx-textarea>"
                expect(model.modified.count()).to.equal(2)

                document.body.removeChild(document.body.children[0])
                expect(model.modified.count()).to.equal(1)

                document.body.innerHTML = ""
                expect(model.modified.count()).to.equal(0)
            })
        })
    })
})

function getActiveElement(): Element | null {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active
}

function dispatchEvent(event: Event) {
    let active = getActiveElement()
    if (active === null) {
        console.log("# found no active element")
    } else {
        console.log("# dispatching event to")
        console.log(active)
        active.dispatchEvent(event)
    }
}
