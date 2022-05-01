import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text } from "@toad"
import { TypedTableModel } from "src/table/TypedTableModel"

function sleep(milliseconds: number = 500) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

class ExpressionNode {
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
                return - this.down!.eval(model)
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

class Lexer {
    i = 0
    str: string
    stack: ExpressionNode[] = []
    constructor(str: string) {
        this.str = str
    }
    isspace(c: string) {
        return c == ' ' || c == '\n' || c == '\r' || c == '\t' || c == '\t'
    }
    isnumber(c: string) {
        const code = c.charCodeAt(0)
        return code >= 0x30 && code <= 0x39
    }
    isalpha(c: string) {
        const code = c.charCodeAt(0)
        return code >= 0x41 && code <= 0x5a || code >= 0x91 && code <= 0x7a
    }
    isalnum(c: string) {
        return this.isnumber(c) || this.isalpha(c)
    }
    unlex(node: ExpressionNode) {
        this.stack.push(node)
    }
    lex() {
        if (this.stack.length > 0) {
            return this.stack.pop()
        }

        let col = 0, row = 0

        let state = 0
        if (this.i >= this.str.length) {
            return undefined
        }
        const start = this.i
        while (true) {
            let c = this.str.at(this.i)
            // console.log(`state=${state}, i=${this.i}, c=${c}, col=${col}, row=${row}`)
            switch (state) {
                case 0:
                    if (c === undefined) {
                        return undefined
                    }
                    if (this.isspace(c)) {
                        ++this.i
                        break
                    }
                    if (this.isnumber(c)) {
                        ++this.i
                        state = 1
                        break
                    }
                    if (this.isalpha(c)) {
                        col = 0
                        state = 3
                        break
                    }
                    switch (c) {
                        case '+':
                        case '-':
                        case '*':
                        case '/':
                        case '(':
                        case ')':
                        case '=':
                            ++this.i
                            return new ExpressionNode(c)
                    }
                    return undefined
                case 1: // [0-9]?
                    if (c !== undefined && this.isnumber(c)) {
                        ++this.i
                        break
                    }
                    if (c === '.' || c == 'e' || c == 'E') {
                        ++this.i
                        state = 2
                        break
                    }
                    return new ExpressionNode(parseFloat(this.str.substring(start, this.i)))
                case 2: // [0-9]+[.eE]?
                    if (c !== undefined && this.isnumber(c)) {
                        ++this.i
                        break
                    }
                    return new ExpressionNode(parseFloat(this.str.substring(start, this.i)))
                case 3: // [a-zA-Z]+?
                    if (c !== undefined) {
                        // isnumber(c: string) {
                        const code = c.charCodeAt(0)

                        if (code >= 0x30 && code <= 0x39) {
                            row = code - 0x30
                            state = 4
                            ++this.i
                            break
                        }
                        if (code >= 0x41 && code <= 0x5a) {
                            col *= 26
                            col += code - 0x40
                            ++this.i
                            break
                        }
                        if (code >= 0x91 && code <= 0x7a) {
                            col *= 26
                            col += code - 0x90
                            ++this.i
                            break
                        }
                    }
                    return new ExpressionNode(this.str.substring(start, this.i))
                case 4: // [a-zA-Z][0-9]+?
                    if (c !== undefined) {
                        const code = c.charCodeAt(0)
                        if (code >= 0x30 && code <= 0x39) {
                            row *= 10
                            row += code - 0x30
                            ++this.i
                            break
                        }
                    }
                    return new ExpressionNode([col - 1, row - 1])
            }
        }
    }
}

function expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = lexer.lex()
    if (n0 === undefined || n0.value !== '=') {
        return undefined
    }
    return additive_expression(lexer)
}

function additive_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = multiplicative_expression(lexer)
    if (n0 === undefined) {
        return undefined
    }

    const n1 = lexer.lex()
    if (n1 === undefined) {
        return n0
    }
    if (n1.value === "+" || n1.value === "-") {
        const n2 = additive_expression(lexer)
        if (n2 === undefined) {
            lexer.unlex(n1)
            return n0
        }
        n1.append(n0)
        n1.append(n2)
        return n1
    }
    lexer.unlex(n1)
    return n0
}

function multiplicative_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = unary_expression(lexer)
    if (n0 === undefined) {
        return undefined
    }
    const n1 = lexer.lex()
    if (n1 === undefined) {
        return n0
    }
    if (n1.value === "*" || n1.value === "/") {
        const n2 = multiplicative_expression(lexer)
        if (n2 === undefined) {
            throw Error(`expexted expression after ${n1.value}`)
        }
        n1.append(n0)
        n1.append(n2)
        return n1
    }
    lexer.unlex(n1)
    return n0
}

function unary_expression(lexer: Lexer): ExpressionNode | undefined {
    const n0 = lexer.lex()
    if (n0 === undefined) {
        return undefined
    }
    if (typeof n0.value === "number") {
        return n0
    }
    if (n0.value instanceof Array) {
        return n0
    }
    if (n0.value === "(") {
        const n1 = additive_expression(lexer)
        if (n1 === undefined) {
            throw Error("Unexpected end after '(")
        }
        const n2 = lexer.lex()
        if (n2?.value !== ')') {
            throw Error("Excepted ')")
        }
        return n1
    }
    if (n0.value === "-") {
        const n1 = unary_expression(lexer)
        if (n1 !== undefined) {
            n0.append(n1)
            return n0
        }
    }
    lexer.unlex(n0)
    return undefined
}

class GridTableModel<T> extends TypedTableModel<T> {
    _cols: number
    _rows: number
    _data: Array<T>
    constructor(nodeClass: new () => T, cols: number, rows: number) {
        super(nodeClass)
        this._cols = cols
        this._rows = rows
        this._data = new Array(cols * rows)
    }
    get colCount(): number {
        return this._cols
    }
    get rowCount(): number {
        return this._rows
    }
}

class SpreadsheetModel extends GridTableModel<SpreadsheetCell> {
    protected dependencies = new Map<SpreadsheetCell, Set<SpreadsheetCell>>()

    constructor(cols: number, rows: number) {
        super(SpreadsheetCell, cols, rows)
    }
    getCell(col: number, row: number) {
        const index = col + row * this._cols
        return this._data[index]
    }
    getField(col: number, row: number): string {
        const cell = this.getCell(col, row)
        if (cell === undefined) {
            return ""
        }
        return `${cell.value}`
    }
    setField(col: number, row: number, value: string) {
        console.log(`setField(${col}, ${row}, '${value}')`)
        const index = col + row * this._cols
        let cell = this._data[index]
        if (cell === undefined) {
            cell = new SpreadsheetCell(value)
            this._data[col + row * this._cols] = cell
        } else {
            // remove depedencies
            cell.value = value
        }
        this.observe(cell)

        cell.eval(this)

        // FIXME: this needs to be done recursivley
        this.updateObservers(cell)    
    }

    protected updateObservers(cell: SpreadsheetCell) {
        const observers = this.dependencies.get(cell)
        if (observers !== undefined) {
            observers.forEach( observer => {
                console.log(`  update observer ${observer._str}`)
                observer.eval(this)
            })
        }
    }

    protected observe(cell: SpreadsheetCell) {
        const dependencies = cell.getDependencies()
        dependencies.forEach(element => {
            const col = element[0]
            const row = element[1]

            console.log(`    depends on [${col}, ${row}]`)
            const index = col + row * this._cols
            let dependency = this._data[index]
            if (dependency === undefined) {
                dependency = new SpreadsheetCell()
                this._data[index] = dependency
            }
            let dependents = this.dependencies.get(dependency)
            if (dependents === undefined) {
                dependents = new Set<SpreadsheetCell>()
                this.dependencies.set(dependency, dependents)
            }
            dependents.add(cell)
        })
    }
    // insertRow(row: number, rowData?: T | Array<T>): number
    // removeRow(row: number, count: number = 1): number
}

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

class SpreadsheetCell {
    _str?: string
    _node?: ExpressionNode
    _value?: number
    constructor(value?: string) {
        console.log(`SpreadsheetCell(${value})`)
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

describe("view", function () {

    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    describe.only("spreadsheetmodel", function () {
        describe("model", function () {
            it("1+2 -> 1=2", function () {
                const m = new SpreadsheetModel(4, 4)
                m.setField(0, 0, "1+2")
                expect(m.getField(0, 0)).to.equal("1+2")
            })
            it("=1+2 -> 3", function () {
                const m = new SpreadsheetModel(4, 4)
                m.setField(0, 0, "=1+2")
                expect(m.getField(0, 0)).to.equal("3")
            })
            it("A1=1+2, B2=A1*2 -> 6", function () {
                const m = new SpreadsheetModel(4, 4)
                m.setField(0, 0, "=1+2")
                m.setField(1, 1, "=A1*2")
                expect(m.getField(1, 1)).to.equal("6")
                m.setField(0, 0, "=3+1")
                expect(m.getField(1, 1)).to.equal("8")
            })
            // dependency involving 3 fields to check recursion
        })

        describe("lexer", function () {
            describe("single token", function () {
                it("1", function () {
                    const lexer = new Lexer("1")
                    expect(lexer.lex()?.value).to.equal(1)
                })
                it("1.9", function () {
                    const lexer = new Lexer("1.9")
                    expect(lexer.lex()?.value).to.equal(1.9)
                })
                it("1e9", function () {
                    const lexer = new Lexer("1e9")
                    expect(lexer.lex()?.value).to.equal(1e9)
                })
                it("1E9", function () {
                    const lexer = new Lexer("1E9")
                    expect(lexer.lex()?.value).to.equal(1e9)
                })
                it("+", function () {
                    const lexer = new Lexer("+")
                    expect(lexer.lex()?.value).to.equal('+')
                })
                it("-", function () {
                    const lexer = new Lexer("-")
                    expect(lexer.lex()?.value).to.equal('-')
                })
                it("*", function () {
                    const lexer = new Lexer("*")
                    expect(lexer.lex()?.value).to.equal('*')
                })
                it("/", function () {
                    const lexer = new Lexer("/")
                    expect(lexer.lex()?.value).to.equal('/')
                })
                it("(", function () {
                    const lexer = new Lexer("(")
                    expect(lexer.lex()?.value).to.equal('(')
                })
                it(")", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()?.value).to.equal(')')
                })
                it("A1", function () {
                    const lexer = new Lexer("A1")
                    expect(lexer.lex()?.value).to.deep.equal([0, 0])
                })
                it("Z9", function () {
                    const lexer = new Lexer("Z9")
                    expect(lexer.lex()?.value).to.deep.equal([25, 8])
                })
                it("AA10", function () {
                    const lexer = new Lexer("AA10")
                    expect(lexer.lex()?.value).to.deep.equal([26, 9])
                })
                it("AB13", function () {
                    const lexer = new Lexer("AB11")
                    expect(lexer.lex()?.value).to.deep.equal([27, 10])
                })
                xit("SUM(<cell>, ...)", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()?.value).to.equal(')')
                })
                it("? is illegal", function () {
                    const lexer = new Lexer("?")
                    expect(lexer.lex()).to.be.undefined
                })
            })
            describe("multiple tokens", function () {
                it("1+2", function () {
                    const lexer = new Lexer("1+2")
                    expect(lexer.lex()?.value).to.equal(1)
                    expect(lexer.lex()?.value).to.equal('+')
                    expect(lexer.lex()?.value).to.equal(2)
                    expect(lexer.lex()).to.be.undefined
                })
                it(" 1 + 2 ", function () {
                    const lexer = new Lexer(" 1 + 2 ")
                    expect(lexer.lex()?.value).to.equal(1)
                    expect(lexer.lex()?.value).to.equal('+')
                    expect(lexer.lex()?.value).to.equal(2)
                    expect(lexer.lex()).to.be.undefined
                })
            })
        })
        describe("parser", function () {
            it("1", function () {
                const lexer = new Lexer("=1")
                const tree = expression(lexer)
                console.log(tree?.toString())
                expect(tree?.value).to.equal(1)
            })
            it("1+2", function () {
                const lexer = new Lexer("=1+2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("1*2", function () {
                const lexer = new Lexer("=1*2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('*')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("1+2*3", function () {
                const lexer = new Lexer("=1+2*3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal('*')
                expect(tree?.down?.next?.down?.value).to.equal(2)
                expect(tree?.down?.next?.down?.next?.value).to.equal(3)
            })
            it("1*2+3", function () {
                const lexer = new Lexer("=1*2+3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal('*')
                expect(tree?.down?.down?.value).to.equal(1)
                expect(tree?.down?.down?.next?.value).to.equal(2)
                expect(tree?.down?.next?.value).to.equal(3)
            })
            it("(1)", function () {
                const lexer = new Lexer("=(1)")
                const tree = expression(lexer)
                expect(tree?.value).to.equal(1)
            })
            it("(1+2)", function () {
                const lexer = new Lexer("=(1+2)")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("((1+2))", function () {
                const lexer = new Lexer("=((1+2))")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("(1+2)*3", function () {
                const lexer = new Lexer("=(1+2)*3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('*')
                expect(tree?.down?.value).to.equal('+')
                expect(tree?.down?.down?.value).to.equal(1)
                expect(tree?.down?.down?.next?.value).to.equal(2)
                expect(tree?.down?.next?.value).to.equal(3)
            })
            it("-1", function () {
                const lexer = new Lexer("=-1")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('-')
                expect(tree?.down?.value).to.equal(1)
            })
            it("-1", function () {
                const lexer = new Lexer("=1+-2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal('-')
                expect(tree?.down?.next?.down?.value).to.equal(2)
            })
        })
        describe("eval", function () {
            it("1+2", function () {
                expect(expression(new Lexer("=1+2"))?.eval()).to.equal(3)
            })
            it("3-2", function () {
                expect(expression(new Lexer("=3-2"))?.eval()).to.equal(1)
            })
            it("2*3", function () {
                expect(expression(new Lexer("=2*3"))?.eval()).to.equal(6)
            })
            it("6/2", function () {
                expect(expression(new Lexer("=6/2"))?.eval()).to.equal(3)
            })
            it("-1", function () {
                expect(expression(new Lexer("=-1"))!.eval()).to.equal(-1)
            })
            it("1+-4", function () {
                expect(expression(new Lexer("=1+-4"))!.eval()).to.equal(-3)
            })
            it("6*2+14/7-3", function () {
                expect(expression(new Lexer("=6*2+14/7-3"))?.eval()).to.equal(11)
            })
        })
        describe("dependencies", function () {
            it("A2 + 2 * C4", function () {
                const t = expression(new Lexer("=A2+2*C4"))
                expect(t?.dependencies()).to.deep.equal([[0, 1], [2, 3]])
            })
        })
    })
})

describe("table", function () {
    it("can render the 1st cell", async function () {
        register(MyAdapter, MyModel)
        const model = new MyModel()
        bindModel("model", model)
        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table2 model="model"></tx-table2>`
        await sleep(1)
        const body = document.body.children[1].shadowRoot!.children[1].children[0]
        const cell00 = body.children[0] as HTMLElement
        expect(cell00.innerText).to.equal("C0:R0")
        expect(cell00.style.top).to.equal("0px")
        expect(cell00.style.left).to.equal("0px")
    })
    //     describe("initialize view from model", function () {
    //         describe("does so when the model is defined before the view", function () {
    //             it("true", function () {
    //                 const model = new BooleanModel(true)
    //                 bindModel("bool", model)
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 expect(isChecked()).to.equal(true)
    //             })

    //             it("false", function () {
    //                 const model = new BooleanModel(false)
    //                 bindModel("bool", model)
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 expect(isChecked()).to.equal(false)
    //             })
    //         })

    //         describe("does so when the view is defined before the model", function () {
    //             it("true", function () {
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 const model = new BooleanModel(true)
    //                 bindModel("bool", model)
    //                 expect(isChecked()).to.equal(true)
    //             })

    //             it("false", function () {
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 const model = new BooleanModel(false)
    //                 bindModel("bool", model)
    //                 expect(isChecked()).to.equal(false)
    //             })
    //         })
    //     })

    //     describe("on change sync data between model and view", function () {

    //         it("updates the html element when the model changes", function () {
    //             const model = new BooleanModel(true)
    //             bindModel("bool", model)
    //             document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //             expect(isChecked()).to.equal(true)

    //             model.value = false
    //             expect(isChecked()).to.equal(false)
    //         })

    //         it("updates the model when the html element changes", function () {
    //             let model = new BooleanModel(false)
    //             bindModel("bool", model)
    //             document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"

    //             setChecked(true)
    //             expect(model.value).to.equal(true)
    //         })
    //     })
})

class MyModel extends TableModel {
    constructor() {
        super()
    }
    get colCount() {
        return 4
    }
    get rowCount() {
        return 3
    }
    get(col: number, row: number) {
        return `C${col}:R${row}`
    }
}

class MyAdapter extends TableAdapter<MyModel> {

    // constructor(model: MyModel) {
    //     super(model)
    // }

    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.get(col, row)
        )
    }
}

// TODO: something else to redesign:
// static register<T, A extends TypedTableAdapter<TypedTableModel<T>>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
function register<T extends TableModel>(adapter: new (model: T) => TableAdapter<any>, model: new (...args: any[]) => T): void
// static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel, data?: any): void
{
    TableAdapter.register(adapter as any, model)
}

