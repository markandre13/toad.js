/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TextModel } from "../model/TextModel"
import { NumberModel } from "../model/NumberModel"
import { ModelView, ModelViewProps } from "./ModelView"
import { style as txText } from "../style/tx-text"

export class Text extends ModelView<TextModel | NumberModel> {
    input: HTMLInputElement

    constructor(init?: ModelViewProps<TextModel | NumberModel>) {
        super(init)
        this.input = document.createElement("input")
        this.input.classList.add("tx-text")
        this.input.oninput = () => { this.updateModel() }
        this.wheel = this.wheel.bind(this)
        this.input.onwheel = this.wheel
        this.attachShadow({ mode: 'open' })
        this.attachStyle(txText)
        this.shadowRoot!.appendChild(this.input)

        // this.input.onclick = () => {
        //     console.log(`<Text> onClick`)
        // }
    }

    protected wheel(e: WheelEvent) {
        if (this.model instanceof NumberModel) {
            if (e.deltaY > 0) {
                this.model.decrement()
                e.preventDefault()
            }
            if (e.deltaY < 0) {
                this.model.increment()
                e.preventDefault()
            }
        }
    }

    override focus() {
        // console.log(`Text.focus()`)
        this.input.focus()
    }
    override blur() {
        // console.log(`Text.blur()`)
        this.input.blur()
    }

    static get observedAttributes() { return ['value'] }

    attributeChangedCallback(name: string, oldValue?: string, newValue?: string) {
        switch (name) {
            case "value":
                if (this.model && newValue !== undefined) {
                    this.model.value = newValue
                }
                break
        }
    }

    override updateModel() {
        if (this.model) {
            this.model.value = this.input.value
        }
        this.setAttribute("value", this.input.value)
    }

    override updateView() {
        if (!this.model)
            return
        const strValue = `${this.model.value}`
        if (this.input.value !== strValue) {
            this.input.value = strValue
            this.setAttribute("value", this.input.value)
        }
    }

    get value() {
        return this.input.value
    }
    set value(value: string) {
        this.input.value = value
        this.updateModel() // FIXME: do we need this?
    }
}

Text.define("tx-text", Text)