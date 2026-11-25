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

import { ModelView, type ModelViewProps } from "./ModelView"
import { OptionModelBase } from "../appkit/OptionModelBase"
import { input, label, slot, span } from "../util/lsx"
import { specialStyleFor } from "../style/tx-special"
import txRadioCss from "../style/tx-radio.css?inline"

const txRadio = new CSSStyleSheet()
txRadio.replaceSync(txRadioCss + specialStyleFor(":host(.tx-radio) > span"))

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
    protected dot: HTMLSpanElement
    protected value?: V

    static radioGroupCounter = 0
    static radioGroups = new WeakMap<OptionModelBase<any>, number>()
    static radioMembers = new WeakMap<OptionModelBase<any>, Set<RadioButton<any>>>()

    constructor(init?: RadioButtonProps<V>) {
        super(init)
        this.value = init?.value

        this.updateModel = this.updateModel.bind(this)
        this.updateView = this.updateView.bind(this)

        this.classList.add("tx-radio")

        this.input = input()
        this.input.type = "radio"
        this.input.onchange = this.updateModel
        this.input.onkeydown = this.keydown.bind(this)
        this.input.disabled = true

        this.label = label()
        this.dot = span()

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [txRadio]
        this.shadowRoot!.replaceChildren(
            this.input,
            this.dot,
            this.label)
    }

    override updateModel() {
        if (this.input.checked && this.model !== undefined) {
            this.model.value = this.value!
        }
    }

    override disconnectedCallback() {
        if (this.model) {
            RadioButton.radioMembers.get(this.model)?.delete(this)
        }
        super.disconnectedCallback()
    }

    keydown(ev: KeyboardEvent) {
        if (this.model === undefined) {
            return
        }
        let step: number
        switch (ev.key) {
            case "ArrowUp":
            case "ArrowLeft":
                step = -1
                break
            case "ArrowDown":
            case "ArrowRight":
                step = 1
                break
            default:
                return
        }
        ev.preventDefault()
        const values: V[] = []
        this.model.forEach((value) => values.push(value))
        let idx = values.indexOf(this.value!) + step
        while (idx >= 0 && idx < values.length && !this.model.isEnabledOf(values[idx])) {
            idx += step
        }
        if (idx < 0 || idx >= values.length) {
            return
        }
        const target = values[idx]
        this.model.value = target
        for (const member of RadioButton.radioMembers.get(this.model) ?? []) {
            if (member.isConnected && member.value === target) {
                member.input.focus()
            }
        }
    }

    override updateView() {
        if (this.model !== undefined) {
            let members = RadioButton.radioMembers.get(this.model)
            if (members === undefined) {
                members = new Set()
                RadioButton.radioMembers.set(this.model, members)
            }
            members.add(this)
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
            this.model.applySpecialStyle(this.dot)
            this.input.checked = this.model.value === this.value
            let tabbable = this.input.checked
            if (!tabbable && this.model.isUnknown()) {
                const values: V[] = []
                this.model.forEach((value) => values.push(value))
                tabbable = values.find((value) => this.model!.isEnabledOf(value)) === this.value
            }
            this.input.tabIndex = tabbable ? 0 : -1
        }
    }
}

RadioButton.define("tx-radio", RadioButton)
