import { ExpressionNode } from '../../util/expressions/ExpressionNode'
import { Lexer } from '../../util/expressions/Lexer'
import { expression } from '../../util/expressions/expression'
import { SpreadsheetModel } from './SpreadsheetModel'

// export abstract class SpreadsheetAdapter<M extends GridTableModel<any>, T = InferTypedTableModelParameter<M>> extends TypedTableAdapter<M> {
//     override getDisplayCell(col: number, row: number): Node | Node[] | undefined {
//         if (!this.model) {
//             return undefined
//         }
//         const cell = this.model.getField(col, row)
//         if (cell === undefined)
//             return undefined
//         return document.createTextNode(cell)
//     }
// }

export class SpreadsheetCell {
    _str?: string
    _node?: ExpressionNode
    _value?: number
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
        this._str = value
    }
    get value(): string {
        if (this._node) {
            return `${this._value}`
        }
        if (this._str !== undefined) {
            return this._str
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
