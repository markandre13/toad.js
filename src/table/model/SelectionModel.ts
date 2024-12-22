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

import { VALUE, ValueModel } from "@toad/model/ValueModel"
import { Model } from "../../model/Model"
import { TableEditMode } from "../TableEditMode"
import { TablePos } from "../TablePos"

// FIXME: also needed is a model for range and 'random' selections

/**
 * @category Application Model
 */
export class SelectionModel extends ValueModel<TablePos> {
    mode: TableEditMode // FIXME: there might be a way to do without, just by the behaviour of a common API towards Table

    constructor(mode = TableEditMode.EDIT_CELL) {
        super(new TablePos(0, 0))
        this.mode = mode
    }

    set col(col: number) {
        if (this._value.col === col)
            return
        this._value.col = col
        this.signal.emit({type: VALUE})
    }

    get col(): number {
        return this._value.col
    }

    set row(row: number) {
        if (this._value.row === row)
            return
        this._value.row = row
        this.signal.emit({type: VALUE})
    }

    get row(): number {
        return this._value.row
    }

    override set value(value: TablePos)  {
        if (this._value.col === value.col && this._value.row === value.row) {
            return
        }
        this._value = value
        this.signal.emit({type: VALUE})
    }

    override get value(): TablePos {
        return this._value
    }

    override toString() {
        return `SelectionModel {enabled: ${this.enabled}, mode: ${TableEditMode[this.mode]}, value: ${this._value}}`
    }
}
