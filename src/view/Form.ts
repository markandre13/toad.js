import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { slot } from 'src/util/lsx'
import { styleBase, styleNarrow } from "@toad/style/tx-form"

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
export class FormLabel extends View {}
export class FormField extends View {}
export class FormHelp extends View {}

View.define("tx-form", Form)
View.define("tx-formlabel", FormLabel, { extends: "label" })
View.define("tx-formfield", FormField, { extends: "div" })
View.define("tx-formhelp", FormHelp, { extends: "div" })
