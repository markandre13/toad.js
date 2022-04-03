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

import { BooleanModel } from "../model/BooleanModel"
import { ModelView } from "./ModelView"

export abstract class BooleanView extends ModelView<BooleanModel> {
    input!: HTMLInputElement

    override setModel(model?: BooleanModel) {
        if (model !== undefined && !(model instanceof BooleanModel)) {
            throw Error(`BooleanView.setModel(): model is not of type BooleanModel`)
        }
        super.setModel(model)
    }

    override updateModel() {
        if (this.model) {
            this.model.value = this.input.checked
        }
    }

    override updateView() {
        if (!this.model || !this.model.enabled) {
            this.input.setAttribute("disabled", "")
        } else {
            this.input.removeAttribute("disabled")
        }

        if (this.model) {
            this.input.checked = this.model.value
        }
    }
}
