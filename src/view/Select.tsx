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

import { ModelViewProps } from "./ModelView"
import { OptionBase } from "./OptionBase"
import { OptionModelBase } from "../model/OptionModelBase"
import { div } from "../util/lsx"

export class Select<V> extends OptionBase<V> {
    override displayElement: HTMLSpanElement
    constructor(init?: ModelViewProps<OptionModelBase<V>>) {
        super(init)
        this.displayElement = div()
        this.displayElement.tabIndex = 0
        this.displayElement.style.minWidth = "200px"
        this.displayElement.onpointerdown = this.pointerdown
        this.displayElement.onkeydown = this.keydown
        this.finalize()
    }

    override updateView() {
        super.updateView()
        if (this.model !== undefined) {
            this.displayElement.replaceChildren(this.model.html)
        }
        this.focusToItem()
    }
}

Select.define("tx-select", Select)
