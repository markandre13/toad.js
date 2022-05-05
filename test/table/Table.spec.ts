import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text, TableEvent, TableEventType, Table } from "@toad"

import { TypedTableAdapter } from '@toad/table/adapter/TypedTableAdapter'
import { TypedTableModel } from "@toad/table/model/TypedTableModel"
import { GridTableModel } from "@toad/table/model/GridTableModel"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [ ] add tests for row/column insert/remove animations
// [ ] display error
// [ ] edit cells


describe("table", function () {
    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    function createModel(cols: number, rows: number) {
        register(MyAdapter, MyModel, String)
        const model = new MyModel(cols, rows)
        for (let row = 0; row < 4; ++row) {
            for (let col = 0; col < 4; ++col) {
                model.setCell(col, row, `C${col}R${row}`)
            }
        }
        bindModel("model", model)
        return model
    }
    function validateRender(model: MyModel) {
        const table = document.querySelector("tx-table") as Table
        if (table === undefined) {
            throw Error("No <tx-table> found.")
        }
        if (table.getModel() !== model) {
            throw Error("<tx-model> has wrong model")
        }

        const body = document.body.children[1].shadowRoot!.children[1].children[0]

        const expectCol: { x: number, w: number }[] = []
        let x = 0
        for (let col = 0; col < model.colCount; ++col) {
            const cell = body.children[col] as HTMLSpanElement
            const bounds = cell.getBoundingClientRect()
            expectCol.push({ x, w: px2int(cell.style.width) })
            const borderWidth = 1
            x += bounds.width + borderWidth
        }

        const expectRow: { y: number, h: number }[] = []
        let y = 0
        for (let row = 0; row < model.rowCount; ++row) {
            const cell = body.children[row * model.colCount] as HTMLSpanElement
            const bounds = cell.getBoundingClientRect()
            expectRow.push({ y, h: px2int(cell.style.height) })
            const borderWidth = 1
            y += bounds.height + borderWidth
        }

        let idx = 0
        let txt = ""
        console.log(`model = ${model.colCount} x ${model.rowCount} = ${model.colCount * model.rowCount} cells, children = ${body.children.length}`)
        for (let row = 0; row < model.rowCount; ++row) {
            for (let col = 0; col < model.colCount; ++col) {
                const cell = body.children[idx++] as HTMLSpanElement
                txt = `${txt}[${col},${row}] (${px2float(cell.style.left)},${px2float(cell.style.top)},${px2float(cell.style.width)},${px2float(cell.style.height)}):(${expectCol[col].x},${expectRow[row].y},${expectCol[col].w},${expectRow[row].h} )  `
                // txt = `${txt}[${col},${row}] ${cell} `
                // expect(cell.innerText).to.equal(model.getCell(col, row).valueOf())
                // expect(px2int(cell.style.left), `C${col}R${row} left`).to.equal((expectCol[col].x))
                // expect(px2int(cell.style.width), `C${col}R${row} width`).to.equal((expectCol[col].w))
                // expect(px2int(cell.style.top), `C${col}R${row} top`).to.equal((expectRow[row].y))
                // expect(px2int(cell.style.height), `C${col}R${row} height`).to.equal((expectRow[row].h))
            }
            console.log(txt)
            txt = ""
            // txt += "\n"
        }
        // console.log(txt)

        idx = 0
        for (let row = 0; row < model.rowCount; ++row) {
            for (let col = 0; col < model.colCount; ++col) {
                const cell = body.children[idx++] as HTMLSpanElement
                expect(cell.innerText).to.equal(model.getCell(col, row).valueOf())
                expect(px2int(cell.style.left), `C${col}R${row} left`).to.equal((expectCol[col].x))
                expect(px2int(cell.style.width), `C${col}R${row} width`).to.equal((expectCol[col].w))
                expect(px2int(cell.style.top), `C${col}R${row} top`).to.equal((expectRow[row].y))
                expect(px2int(cell.style.height), `C${col}R${row} height`).to.equal((expectRow[row].h))
            }
        }
    }

    it("render model", async function () {
        const model = createModel(4, 4)
        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        await sleep()
        validateRender(model)
    })

    // insert/delete row/column
    // insert into empty, remove last, insert 1st/last/middle

    it("insertRow", async function () {
        const model = createModel(4, 4)

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = document.querySelector("tx-table") as Table
        if (table === undefined) {
            throw Error("No <tx-table> found.")
        }
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        model.insertRow(2)
        await animationDone

        validateRender(model)
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

class MyModel extends GridTableModel<String> {
    constructor(cols: number, rows: number) {
        super(String, cols, rows)
    }
}

class MyAdapter extends TableAdapter<MyModel> {
    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.getCell(col, row).valueOf()
        )
    }
}

function register<M extends TableModel>(
    adapter: new (model: M) => TableAdapter<M>,
    model: new (...args: any[]) => M): void
function register<
    A extends TypedTableAdapter<M>,
    M extends TypedTableModel<D>,
    D
>(
    adapter: new (model: M) => A,
    model: new (...args: any[]) => M,
    data: new (...args: any[]) => D): void
function register(
    adapter: new (model: TableModel) => TableAdapter<any>,
    model: (new (...args: any[]) => TableModel),
    data?: new (...args: any[]) => any): void {
    TableAdapter.register(adapter as any, model as any, data as any)
}

function sleep(milliseconds: number = 1) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

export function px2int(s: string) {
    return parseInt(s.substring(0, s.length - 2))
}

export function px2float(s: string) {
    return parseFloat(s.substring(0, s.length - 2))
}
