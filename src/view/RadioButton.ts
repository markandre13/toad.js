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
import { input, span } from "../util/lsx"

export interface RadioButtonProps extends ModelViewProps<OptionModelBase> {
    value: string,
    img: string,
    disabled?: boolean
}

export class RadioButton extends ModelView<OptionModelBase> {
    input: HTMLInputElement

    constructor(init?: RadioButtonProps) {
        super(init)
        this.classList.add("tx-radio")

        this.input = input()
        this.input.type = "radio"

        // need to set input's name & value from the user provided attributes
        this.input.name = "XXX"
        this.input.value = this.getAttribute("value")!
        let view = this
        this.input.onchange = () => {
            view.updateModel()
        }

        this.attachShadow({ mode: 'open' })
        this.attachStyle("radio")
        this.shadowRoot!.appendChild(this.input)
        this.shadowRoot!.appendChild(span())
    }

    override updateModel() {
        if (this.model) {
            this.model.stringValue = this.input.value
        }
    }

    override updateView() {
        if (!this.model || !this.model.enabled) {
            this.input.setAttribute("disabled", "")
        } else {
            this.input.removeAttribute("disabled")
        }

        if (this.model) {
            this.input.checked = this.model.stringValue === this.input.value
        }
    }
}

RadioButton.define("tx-radiobutton", RadioButton)
