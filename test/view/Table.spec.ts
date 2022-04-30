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

class Lexer {
    i = 0
    str: string
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
    // null: end of string
    // undefined: error
    // number: number
    // +, -, *, /, (, ), =: as themselves
    lex() {
        let state = 0
        if (this.i >= this.str.length) {
            return null
        }
        const start = this.i
        while (true) {
            let c = this.str.at(this.i)
            // console.log(`state=${state}, i=${this.i}, c=${c}`)
            switch (state) {
                case 0:
                    if (c === undefined) {
                        return null
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
                        case '=':
                            ++this.i
                            return c
                    }
                    return undefined
                case 1: // [0-9]?
                    if (c === undefined) {
                        return parseFloat(this.str.substring(start, this.i))
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
                    return parseFloat(this.str.substring(start, this.i))
                case 2: // [0-9]+[.eE]?
                    if (c === undefined) {
                        return parseFloat(this.str.substring(start, this.i))
                    }
                    if (this.isnumber(c)) {
                        ++this.i
                        continue
                    }
                    return parseFloat(this.str.substring(start, this.i))
            }
        }
    }
}

class Parser {
    
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
                    expect(lexer.lex()).to.equal(1)
                })
                it("1.9", function () {
                    const lexer = new Lexer("1.9")
                    expect(lexer.lex()).to.equal(1.9)
                })
                it("1e9", function () {
                    const lexer = new Lexer("1e9")
                    expect(lexer.lex()).to.equal(1e9)
                })
                it("1E9", function () {
                    const lexer = new Lexer("1E9")
                    expect(lexer.lex()).to.equal(1e9)
                })
                it("+", function () {
                    const lexer = new Lexer("+")
                    expect(lexer.lex()).to.equal('+')
                })
                it("-", function () {
                    const lexer = new Lexer("-")
                    expect(lexer.lex()).to.equal('-')
                })
                it("*", function () {
                    const lexer = new Lexer("*")
                    expect(lexer.lex()).to.equal('*')
                })
                it("/", function () {
                    const lexer = new Lexer("/")
                    expect(lexer.lex()).to.equal('/')
                })
                it("(", function () {
                    const lexer = new Lexer("(")
                    expect(lexer.lex()).to.equal('(')
                })
                it(")", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()).to.equal(')')
                })
                it("=", function () {
                    const lexer = new Lexer("=")
                    expect(lexer.lex()).to.equal('=')
                })
                xit("A:1", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()).to.equal(')')
                })
                xit("SUM(<cell>, ...)", function () {
                    const lexer = new Lexer(")")
                    expect(lexer.lex()).to.equal(')')
                })
                it("? is illegal", function() {
                    const lexer = new Lexer("?")
                    expect(lexer.lex()).to.be.undefined
                })
            })
            describe("multiple tokens", function() {
                it("1+2", function () {
                    const lexer = new Lexer("1+2")
                    expect(lexer.lex()).to.equal(1)
                    expect(lexer.lex()).to.equal('+')
                    expect(lexer.lex()).to.equal(2)
                    expect(lexer.lex()).to.be.null
                })
                it(" 1 + 2 ", function () {
                    const lexer = new Lexer(" 1 + 2 ")
                    expect(lexer.lex()).to.equal(1)
                    expect(lexer.lex()).to.equal('+')
                    expect(lexer.lex()).to.equal(2)
                    expect(lexer.lex()).to.be.null
                })
            })
        })
        describe("parser", function () {
            it("1+1")
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

