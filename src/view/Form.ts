import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { slot } from '../util/lsx'
import { styleBase, styleNarrow } from "@toad/style/tx-form"

import { Model } from "../model/Model"
import { ModelView, ModelViewProps } from "./ModelView"

interface FormProps extends HTMLElementProps {
    variant?: "wide" | "narrow"
}

export class Form extends View {
    constructor(init?: FormProps) {
        super(init)
        this.attachShadow({ mode: 'open' })
        if (init?.variant === "narrow" || this.getAttribute("variant") === "narrow") {
            this.shadowRoot!.adoptedStyleSheets = [styleBase, styleNarrow]
        } else {
            this.shadowRoot!.adoptedStyleSheets = [styleBase]
        }
        this.shadowRoot!.appendChild(slot())
    }
}
export class FormLabel<T> extends ModelView<Model<T>> {
    constructor(init?: ModelViewProps<Model<T>>) {
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

export class FormHelp<T> extends ModelView<Model<T>> {
    constructor(init?: ModelViewProps<Model<T>>) {
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
