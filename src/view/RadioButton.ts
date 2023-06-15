/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
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

import { ModelView, ModelViewProps } from "./ModelView"
import { OptionModelBase } from "../model/OptionModelBase"
import { input, label, slot, span, text } from "../util/lsx"
import { style as txRadio } from "../style/tx-radio"

export interface RadioButtonProps<V> extends ModelViewProps<OptionModelBase<V>> {
    value: V,
    // img: string,
    // disabled?: boolean
}

/**
 * @category View
 */
export class RadioButton<V> extends ModelView<OptionModelBase<V>> {
    protected input: HTMLInputElement
    protected label: HTMLLabelElement
    protected value?: V

    static radioGroupCounter = 0
    static radioGroups = new WeakMap<OptionModelBase<unknown>, number>()

    constructor(init?: RadioButtonProps<V>) {
        super(init)
        this.value = init?.value

        this.updateModel = this.updateModel.bind(this)
        this.updateView = this.updateView.bind(this)

        this.classList.add("tx-radio")

        this.input = input()
        this.input.type = "radio"
        this.input.onchange = this.updateModel
        this.input.disabled = true

        this.label = label()

        this.attachShadow({ mode: 'open', delegatesFocus: true })
        this.shadowRoot!.adoptedStyleSheets = [txRadio]
        this.shadowRoot!.replaceChildren(
            this.input,
            span(),
            this.label)
    }

    override updateModel() {
        if (this.input.checked && this.model !== undefined) {
            this.model.value = this.value!
        }
    }

    override updateView() {
        if (this.model !== undefined) {
            let radioGroup = RadioButton.radioGroups.get(this.model)
            if (radioGroup === undefined) {
                radioGroup = ++RadioButton.radioGroupCounter
                RadioButton.radioGroups.set(this.model, radioGroup)
            }
            this.input.name = `tx-radio-group-${radioGroup}`
            this.input.value = `${this.model.indexOf(this.value!)}`
            if (this.childNodes.length > 0) {
                this.label.replaceChildren(slot())
            } else {
                this.label.replaceChildren(this.model.labelOf(this.value!))
            }
        } else {
            this.input.name = ""
        }

        if (!this.model || !this.model.enabled || !this.model.isEnabledOf(this.value!)) {
            this.input.setAttribute("disabled", "")
        } else {
            this.input.removeAttribute("disabled")
        }

        if (this.model) {
            this.input.checked = this.model.value === this.value
        }
    }
}

RadioButton.define("tx-radio", RadioButton)
