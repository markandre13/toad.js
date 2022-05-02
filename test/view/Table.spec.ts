import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text, TableEvent, TableEventType } from "@toad"
import { Lexer } from 'src/util/expressions/Lexer'
import { expression } from 'src/util/expressions/expression'
import { SpreadsheetModel } from 'src/table/model/SpreadsheetModel'

function sleep(milliseconds: number = 500) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

describe("view", function () {

    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    describe.only("spreadsheetmodel", function () {
        function createModel4x4() {
            const m = new SpreadsheetModel(4, 4)
            for (let row = 0; row < 4; ++row) {
                for (let col = 0; col < 4; ++col) {
                    m.setField(col, row, `C${col}R${row}`)
                }
            }
            return m
        }
        function logModel(m: SpreadsheetModel) {
            let txt = "\n"
            for (let row = 0; row < m.rowCount; ++row) {
                for (let col = 0; col < m.colCount; ++col) {
                    txt += m.getField(col, row) + " "
                }
                txt += "\n"
            }
            console.log(txt)
        }

        // TODO:
        // [ ] make this a grid/Table2DModel only test
        // [ ] send modified-events
        // [ ] spreadsheet: adjust col/rows
        // [ ] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
        // [ ] render table
        // [ ] display error
        // [ ] edit cells
        describe("add/remove rows/columns", function () {
            it("insert row", function () {
                const m = createModel4x4()
                let event!: TableEvent
                m.modified.add((e) => event = e)

                m.insertRow(2)
                
                expect(event).to.deep.equal({
                    type: TableEventType.INSERT_ROW,
                    index: 2,
                    size: 1
                })

                expect(m.rowCount).to.equal(5)

                for (let row = 0; row < 5; ++row) {
                    for (let col = 0; col < 4; ++col) {
                        let want
                        if (row<2) {
                            want = `C${col}R${row}`
                        } else
                        if (row === 2) {
                            want = ""
                        } else {
                            want = `C${col}R${row-1}`
                        }
                        expect(m.getField(col, row)).to.equal(want)
                    }
                }
            })
            it("remove row", function () {
                const m = createModel4x4()
                let event!: TableEvent
                m.modified.add((e) => event = e)

                m.removeRow(2)
                
                expect(event).to.deep.equal({
                    type: TableEventType.REMOVE_ROW,
                    index: 2,
                    size: 1
                })
                
                expect(m.rowCount).to.equal(3)
                for (let row = 0; row < 3; ++row) {
                    for (let col = 0; col < 4; ++col) {
                        let want
                        if (row<2) {
                            want = `C${col}R${row}`
                        } else {
                            want = `C${col}R${row+1}`
                        }
                        expect(m.getField(col, row)).to.equal(want)
                    }
                }
            })
            it("insert column", function() {
                const m = createModel4x4()
                let event!: TableEvent
                m.modified.add((e) => event = e)

                m.insertColumn(2)

                expect(event).to.deep.equal({
                    type: TableEventType.INSERT_COL,
                    index: 2,
                    size: 1
                })

                expect(m.colCount).to.equal(5)
                for (let col = 0; col < 5; ++col) {
                    for (let row = 0; row < 4; ++row) {                
                        let want
                        if (col<2) {
                            want = `C${col}R${row}`
                        } else
                        if (col === 2) {
                            want = ""
                        } else {
                            want = `C${col-1}R${row}`
                        }
                        expect(m.getField(col, row)).to.equal(want)
                    }
                }
            })
            it("remove column", function () {
                const m = createModel4x4()
                let event!: TableEvent
                m.modified.add((e) => event = e)

                m.removeColumn(2)

                expect(event).to.deep.equal({
                    type: TableEventType.REMOVE_COL,
                    index: 2,
                    size: 1
                })
                expect(m.colCount).to.equal(3)
                for (let col = 0; col < 3; ++col) {
                    for (let row = 0; row < 4; ++row) {
                        let want
                        if (col<2) {
                            want = `C${col}R${row}`
                        } else {
                            want = `C${col+1}R${row}`
                        }
                        expect(m.getField(col, row)).to.equal(want)
                    }
                }
            })
        })

        describe("arithmetics", function () {
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
            it("A1=1, B1=2, A2=A1+B1, B2=A2*2 -> 6 and A1=3 -> 10", function () {
                const m = new SpreadsheetModel(4, 4)
                m.setField(0, 0, "=1")
                m.setField(1, 0, "=2")
                m.setField(0, 1, "=A1+B1")
                m.setField(1, 1, "=A2*2")
                expect(m.getField(1, 1)).to.equal("6")
                m.setField(0, 0, "=3")
                expect(m.getField(1, 1)).to.equal("10")
            })
            it("cycle", function () {
                const m = new SpreadsheetModel(4, 4)
                m.setField(0, 0, "=1")
                m.setField(1, 0, "=A1+1")
                m.setField(2, 0, "=B1+2")

                expect(() => m.setField(0, 0, "=C1+3")).to.throw()
            })
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

