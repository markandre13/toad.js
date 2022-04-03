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

import { BooleanModel } from "../model/BooleanModel"
import { ModelView } from "./ModelView"

import { input, svg, path } from "../util/lsx"

export class Checkbox extends ModelView<BooleanModel> {
    input: HTMLInputElement

    constructor() {
        super()

        this.classList.add("tx-checkbox")

        this.attachShadow({ mode: 'open' })
        this.attachStyle("checkbox")

        this.input = input()
        this.input.type = "checkbox"
        const s = svg(
            path("M3.5 9.5a.999.999 0 01-.774-.368l-2.45-3a1 1 0 111.548-1.264l1.657 2.028 4.68-6.01A1 1 0 019.74 2.114l-5.45 7a1 1 0 01-.777.386z")
        )

        this.input.onchange = () => {
            this.updateModel()
        }
        this.shadowRoot!.appendChild(this.input)
        this.shadowRoot!.appendChild(s)
        console.log(this)
    }

    override setModel(model?: BooleanModel) {
        if (model !== undefined && !(model instanceof BooleanModel)) {
            throw Error(`CheckBoxView.setModel(): model is not of type BooleanModel`)
        }
        super.setModel(model)
    }

    override updateModel() {
        if (this.model) {
            this.model.value = this.input.checked
        }
    }

    override updateView() {
        if (!this.model) {
            this.input.setAttribute("disabled", "")
            //   this.input.removeAttribute("checked")
            return
        }
        this.input.removeAttribute("disabled")

        if (this.model.value)
            this.input.setAttribute("checked", "")
        else
            this.input.removeAttribute("checked")
    }
}

Checkbox.define("tx-checkbox", Checkbox)