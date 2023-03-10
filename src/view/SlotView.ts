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

import { HtmlModel } from "../model/HtmlModel"
import { TextModel } from "../model/TextModel"
import { ModelView, ModelViewProps } from "./ModelView"

export class SlotView extends ModelView<TextModel> {
    constructor(init?: ModelViewProps<TextModel>) {
        super(init)
    }
    override updateView() {
        if (!this.model)
            return

        let value = this.model.value === undefined ? "" : this.model.value
        if (this.model instanceof HtmlModel)
            this.innerHTML = value

        else
            this.innerText = value
    }
}

SlotView.define("tx-slot", SlotView)