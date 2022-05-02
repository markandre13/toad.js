import { SpreadsheetModel } from "../../table/model/SpreadsheetModel"

export class ExpressionNode {
    // string: one of the tokens
    // number: fixed number
    // number[]: col, row
    // undefined: error?
    value: string | number | number[] | undefined
    down?: ExpressionNode
    next?: ExpressionNode
    constructor(value: string | number | number[] | undefined) {
        this.value = value
    }
    eval(model?: SpreadsheetModel): number {
        if (typeof this.value === "number") {
            return this.value
        }
        if (this.value instanceof Array) {
            if (model === undefined) {
                throw Error(`yikes: no model to get cell [${this.value[0]},${this.value[1]}]`)
            }
            return model.getCell(this.value[0], this.value[1])._value!
        }
        switch (this.value) {
            case '+':
                return this.down!.eval(model) + this.down!.next!.eval(model)
            case '-':
                if (this.down?.next) {
                    return this.down!.eval(model) - this.down!.next!.eval(model)
                }
                return -this.down!.eval(model)
            case '*':
                return this.down!.eval(model) * this.down!.next!.eval(model)
            case '/':
                return this.down!.eval(model) / this.down!.next!.eval(model)
            default:
                throw Error(`unexpected token '${this.value}'`)
        }
    }
    append(node: ExpressionNode) {
        if (this.down === undefined) {
            this.down = node
        } else {
            let n = this.down
            while (n.next) {
                n = n.next
            }
            n.next = node
        }
    }
    dependencies(deps: Array<Array<number>> = []) {
        if (this.value instanceof Array) {
            deps.push(this.value)
        }
        if (this.next) {
            this.next.dependencies(deps)
        }
        if (this.down) {
            this.down.dependencies(deps)
        }
        return deps
    }
    toString() {
        return this._toString()
    }
    protected _toString(out: string = "\n", indent: number = 0) {
        for (let i = 0; i < indent; ++i) {
            out += "    "
        }
        out += this.value
        out += "\n"
        for (let n = this.down; n; n = n.next) {
            out = n._toString(out, indent + 1)
        }
        return out
    }
}
