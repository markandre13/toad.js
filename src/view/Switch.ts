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

import { BooleanView } from "./BooleanView"
import { BooleanModel } from "../model/BooleanModel"
import { ModelViewProps } from "./ModelView"

import { style as txSwitch } from "../style/tx-switch"
import { input, span } from "../util/lsx"

/**
 * @category View
 */
export class Switch extends BooleanView {

    constructor(init?: ModelViewProps<BooleanModel>) {
        super(init)

        this.classList.add("tx-switch")

        this.input = input()
        this.input.type = "checkbox"
        this.input.onchange = () => {
            this.updateModel()
        }

        this.attachShadow({ mode: 'open' })
        this.attachStyle(txSwitch)
        this.shadowRoot!.appendChild(this.input)
        this.shadowRoot!.appendChild(span())
    }
}

Switch.define("tx-switch", Switch)