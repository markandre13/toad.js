import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { slot } from 'src/util/lsx'
import { styleBase, styleNarrow } from "@toad/style/tx-form"

import { Model } from "src/model/Model"
import { ModelView, ModelViewProps } from "./ModelView"

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
export class FormLabel extends ModelView<Model> {
    constructor(init?: ModelViewProps<Model>) {
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
export class FormHelp extends ModelView<Model> {
    constructor(init?: ModelViewProps<Model | Model>) {
        super(init)
    }
    override updateView(): void {
        if (this.model?.error) {
            this.classList.add("tx-error")
            let text = this.model.error
            if (this.model.description) {
                text += '<br/>' + this.model.description
            }
            this.innerHTML = text
            return
        } else {
            this.classList.remove("tx-error")
        }
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
