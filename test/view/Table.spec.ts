import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text } from "@toad"

function sleep(milliseconds: number = 500) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

class SpreadsheetCell {
    raw!: string
}

class Node {
    value: string | number | undefined
    down?: Node
    next?: Node
    constructor(value: string | number | undefined) {
        this.value = value
    }
    eval(): number {
        if (typeof this.value === "number") {
            return this.value
        }
        switch (this.value) {
            case '+':
                return this.down!.eval() + this.down!.next!.eval()
            case '-':
                if (this.down?.next) {
                    return this.down!.eval() - this.down!.next!.eval()
                }
                return - this.down!.eval()
            case '*':
                return this.down!.eval() * this.down!.next!.eval()
            case '/':
                return this.down!.eval() / this.down!.next!.eval()
            default:
                throw Error(`unexpected token '${this.value}'`)
        }
    }
    append(node: Node) {
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
    toString() {
        return this._toString()
    }
    _toString(out: string = "\n", indent: number = 0) {
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
    stack?: Node
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
    unlex(node: Node) {
        if (this.stack !== undefined) {
            throw Error(`Lexer.unlex(): can't unlex more than one node (${this.stack.value}, ${node.value})`)
        }
        this.stack = node
    }

    lex() {
        const n = this._lex()
        return n
    }

    _lex() {
        if (this.stack !== undefined) {
            const n = this.stack
            this.stack = undefined
            return n
        }

        let state = 0
        if (this.i >= this.str.length) {
            return undefined
        }
        const start = this.i
        while (true) {
            let c = this.str.at(this.i)
            // console.log(`state=${state}, i=${this.i}, c=${c}`)
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
                    switch (c) {
                        case '+':
                        case '-':
                        case '*':
                        case '/':
                        case '(':
                        case ')':
                            ++this.i
                            return new Node(c)
                    }
                    return undefined
                case 1: // [0-9]?
                    if (c === undefined) {
                        return new Node(parseFloat(this.str.substring(start, this.i)))
                    }
                    if (this.isnumber(c)) {
                        ++this.i
                        continue
                    }
                    if (c === '.' || c == 'e' || c == 'E') {
                        ++this.i
                        state = 2
                        break
                    }
                    return new Node(parseFloat(this.str.substring(start, this.i)))
                case 2: // [0-9]+[.eE]?
                    if (c === undefined) {
                        return new Node(parseFloat(this.str.substring(start, this.i)))
                    }
                    if (this.isnumber(c)) {
                        ++this.i
                        continue
                    }
                    return new Node(parseFloat(this.str.substring(start, this.i)))
            }
        }
    }
}

function expression(lexer: Lexer): Node | undefined {
    return additive_expression(lexer)
}

function additive_expression(lexer: Lexer): Node | undefined {
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

function multiplicative_expression(lexer: Lexer): Node | undefined {
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

function unary_expression(lexer: Lexer): Node | undefined {
    const n0 = lexer.lex()
    if (n0 === undefined) {
        return undefined
    }
    if (typeof n0.value === "number") {
        return n0
    }
    if (n0.value === "(") {
        const n1 = expression(lexer)
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

class SpreadsheetModel extends TableModel {
    get colCount(): number {
        throw new Error('Method not implemented.')
    }
    get rowCount(): number {
        throw new Error('Method not implemented.')
    }
}

describe("view", function () {

    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    describe.only("spreadsheetmodel", function () {
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
                xit("A:1", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()?.value).to.equal(')')
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
                const lexer = new Lexer("1")
                const tree = expression(lexer)
                expect(tree?.value).to.equal(1)
            })
            it("1+2", function () {
                const lexer = new Lexer("1+2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("1*2", function () {
                const lexer = new Lexer("1*2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('*')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("1+2*3", function () {
                const lexer = new Lexer("1+2*3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal('*')
                expect(tree?.down?.next?.down?.value).to.equal(2)
                expect(tree?.down?.next?.down?.next?.value).to.equal(3)
            })
            it("1*2+3", function () {
                const lexer = new Lexer("1*2+3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal('*')
                expect(tree?.down?.down?.value).to.equal(1)
                expect(tree?.down?.down?.next?.value).to.equal(2)
                expect(tree?.down?.next?.value).to.equal(3)
            })
            it("(1)", function () {
                const lexer = new Lexer("(1)")
                const tree = expression(lexer)
                expect(tree?.value).to.equal(1)
            })
            it("(1+2)", function () {
                const lexer = new Lexer("(1+2)")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("((1+2))", function () {
                const lexer = new Lexer("((1+2))")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal(2)
            })
            it("(1+2)*3", function () {
                const lexer = new Lexer("(1+2)*3")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('*')
                expect(tree?.down?.value).to.equal('+')
                expect(tree?.down?.down?.value).to.equal(1)
                expect(tree?.down?.down?.next?.value).to.equal(2)
                expect(tree?.down?.next?.value).to.equal(3)
            })
            it("-1", function () {
                const lexer = new Lexer("-1")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('-')
                expect(tree?.down?.value).to.equal(1)
            })
            it("-1", function () {
                const lexer = new Lexer("1+-2")
                const tree = expression(lexer)
                expect(tree?.value).to.equal('+')
                expect(tree?.down?.value).to.equal(1)
                expect(tree?.down?.next?.value).to.equal('-')
                expect(tree?.down?.next?.down?.value).to.equal(2)
            })
        })
        describe("eval", function () {
            it("1+2", function () {
                expect(expression(new Lexer("1+2"))?.eval()).to.equal(3)
            })
            it("3-2", function () {
                expect(expression(new Lexer("3-2"))?.eval()).to.equal(1)
            })
            it("2*3", function () {
                expect(expression(new Lexer("2*3"))?.eval()).to.equal(6)
            })
            it("6/2", function () {
                expect(expression(new Lexer("6/2"))?.eval()).to.equal(3)
            })
            it("-1", function () {
                expect(expression(new Lexer("-1"))!.eval()).to.equal(-1)
            })
            it("1+-4", function () {
                expect(expression(new Lexer("1+-4"))!.eval()).to.equal(-3)
            })
            it("6*2+14/7-3", function () {
                expect(expression(new Lexer("6*2+14/7-3"))?.eval()).to.equal(11)
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

