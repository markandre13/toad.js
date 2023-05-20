import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { slot } from 'src/util/lsx'
import { styleBase, styleNarrow } from "@toad/style/tx-form"

import { TextFieldModel } from "src/model/TextFieldModel"
import { Model } from "src/model/Model"
import { ModelView, ModelViewProps } from "./ModelView"
import { TextModel } from "@toad/model/TextModel"
import { NumberFieldModel } from "@toad/model/NumberFieldModel"

export class Form extends View {
    constructor(init?: HTMLElementProps) {
        super(init)
        this.attachShadow({ mode: 'open' })
        this.attachStyle(styleBase)
        if (this.getAttribute("variant") === "narrow") {
            this.attachStyle(styleNarrow)
        }
        this.shadowRoot!.appendChild(slot())
    }
}
export class FormLabel extends ModelView<TextFieldModel | NumberFieldModel> {
    constructor(init?: ModelViewProps<TextFieldModel>) {
        super(init)
    }
    override updateView(): void {
        if (this.model?.label) {
            this.innerHTML = this.model.label
        } else {
            this.innerHTML = ""
        }
    }
}
export class FormField extends View { }
export class FormHelp extends ModelView<TextFieldModel | NumberFieldModel> {
    constructor(init?: ModelViewProps<TextFieldModel | NumberFieldModel>) {
        super(init)
    }
    override updateView(): void {
        if (this.model?.description) {
            this.innerHTML = this.model.description
        } else {
            this.innerHTML = ""
        }
    }
}

View.define("tx-form", Form)
View.define("tx-formlabel", FormLabel, { extends: "label" })
View.define("tx-formfield", FormField, { extends: "div" })
View.define("tx-formhelp", FormHelp, { extends: "div" })
