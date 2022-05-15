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

import { ExpressionNode } from '../../util/expressions/ExpressionNode'
import { Lexer } from '../../util/expressions/Lexer'
import { expression } from '../../util/expressions/expression'
import { SpreadsheetModel } from './SpreadsheetModel'

export class SpreadsheetCell {
    _display?: string
    _node?: ExpressionNode
    _value?: number
    _error?: string
    constructor(value?: string) {
        // console.log(`SpreadsheetCell(${value})`)
        if (value === undefined || value.trim().length === 0) {
            return
        }
        this.value = value
    }
    eval(model: SpreadsheetModel) {
        if (this._node !== undefined) {
            this._value = this._node!.eval(model)
        }
    }
    set value(value: string) {
        // console.log(`SpreadsheetCell.value('${value}')`)
        this._node = expression(new Lexer(value))
        this._display = value
    }
    get value(): string {
        if (this._error && this._display !== undefined) {
            return this._display
        }
        if (this._node) {
            return `${this._value}`
        }
        if (this._display !== undefined) {
            return this._display
        }
        return ""
    }
    getDependencies() {
        if (this._node !== undefined) {
            return this._node.dependencies()
        }
        return []
    }
}
