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
import { assignmentExpression } from '../../util/expressions/expression'
import { SpreadsheetModel } from './SpreadsheetModel'

/**
 * @category Application Model
 */
export class SpreadsheetCell {
    _inputValue?: string
    _node?: ExpressionNode
    _calculatedValue?: number
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
            this._calculatedValue = this._node!.eval(model)
        }
    }
    set value(value: string) {
        // console.log(`SpreadsheetCell.value('${value}')`)
        this._node = assignmentExpression(new Lexer(value))
        this._inputValue = value
    }
    get value(): string {
        if (this._error && this._inputValue !== undefined) {
            return this._inputValue
        }
        if (this._node) {
            return `${this._calculatedValue}`
        }
        if (this._inputValue !== undefined) {
            return this._inputValue
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
