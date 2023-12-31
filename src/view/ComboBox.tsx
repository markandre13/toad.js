import { input } from "../util/lsx"
import { TextModel } from "../model/TextModel"
import { OptionBase } from "./OptionBase"
import { ModelViewProps } from "./ModelView"
import { OptionModelBase } from "@toad/model/OptionModelBase"

export interface ComboBoxProps<V> extends ModelViewProps<OptionModelBase<V>> {
    text?: TextModel
}

export class ComboBox extends OptionBase<string | number> {
    override displayElement: HTMLInputElement
    textModel?: TextModel
    constructor(init?: ComboBoxProps<string>) {
        super(init)
        this.textModel = init?.text
        this.displayElement = input()
        this.displayElement.type = "text"
        this.displayElement.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key === "Enter" || this.popup !== undefined) {
                this.keydown(ev)
            }
        }

        this.displayElement.oninput = () => {
            this.updateModel()
        }

        this.finalize()
    }

    override close() {
        super.close()
        if (this.popup === undefined) {
            this.displayElement.focus()
        }
    }

    override updateModel() {
        if (this.model) {
            if (typeof this.model.value === "number") {
                this.model.value = Number.parseFloat(this.displayElement.value)
            } else {
                this.model.value = this.displayElement.value
            }
        }
        if (this.textModel) {
            this.textModel.value = this.displayElement.value
        }
    }

    override updateView() {
        super.updateView()
        if (this.model !== undefined) {
            this.displayElement.value = `${this.model.value}`
        }
        this.focusToItem()
    }
}

ComboBox.define("tx-combobox", ComboBox)
