import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text, TableEvent, TableEventType, Table } from "@toad"

import { TableFriend } from '@toad/table/private/TableFriend'

import { TypedTableAdapter } from '@toad/table/adapter/TypedTableAdapter'
import { TypedTableModel } from "@toad/table/model/TypedTableModel"
import { GridTableModel } from "@toad/table/model/GridTableModel"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [ ] edit cells
// [ ] adjust selection, caret, ...
// [ ] tab in/out of table
// [ ] display error

// [ ] insert more than one row/column
// [ ] restrict minimal table size to at least one row or one column

// FIXME: use the 'with data' for all tests because with or without data is a property of the model, not the view

describe("table", function () {
    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    it("render model", async function () {
        const model = createModel(4, 4)
        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        await sleep()
        validateRender(model)
    })

    it("with headers: render model", async function () {
        const model = createModel(4, 4)
        model.showColumnHeaders = true
        model.showRowHeaders = true
        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        await sleep()
        validateRender(model)
    })

    it(`with headers: insertRow with data`, async function () {
        const model = createModel(4, 4)
        model.showColumnHeaders = true
        model.showRowHeaders = true

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.insertRow(2, ["N1", "N2", "N3", "N4"])
        await animationDone

        validateRender(model)
    })

    it(`with headers: insertColumn with data`, async function () {
        const model = createModel(4, 4)
        model.showColumnHeaders = true
        model.showRowHeaders = true

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.insertColumn(2, ["N1", "N2", "N3", "N4"])
        await animationDone

        validateRender(model)
    })

    it(`with headers: removeRow`, async function () {
        const model = createModel(4, 4)
        model.showColumnHeaders = true
        model.showRowHeaders = true

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.removeRow(2)
        expect(model.rowCount).to.equal(3)
        await animationDone

        validateRender(model)
    })

    it(`with headers: removeColumn`, async function () {
        const model = createModel(4, 4)
        model.showColumnHeaders = true
        model.showRowHeaders = true

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.removeColumn(2)
        expect(model.colCount).to.equal(3)
        await animationDone

        validateRender(model)
    })

    it(`insertRow with data`, async function () {
        const model = createModel(4, 4)

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.insertRow(2, ["N1", "N2", "N3", "N4"])
        await animationDone

        validateRender(model)
    })

    it(`insertColumn with data`, async function () {
        const model = createModel(4, 4)

        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
        const table = getTable(model)
        Table.transitionDuration = "1ms"
        const animationDone = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })

        await sleep()
        // also test wrong row size, and multiple rows
        model.insertColumn(2, ["N1", "N2", "N3", "N4"])
        await animationDone

        validateRender(model)
    });

    [0, 2, 4].forEach(row =>
        it(`insertRow ${row + 1} out of 4`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            Table.transitionDuration = "1ms"
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            model.insertRow(row)
            await animationDone

            validateRender(model)
        })
    );

    [0, 2, 4].forEach(row =>
        it(`insertColumn ${row + 1} out of 4`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            Table.transitionDuration = "1ms"
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            model.insertColumn(row)
            await animationDone

            validateRender(model)
        })
    );

    [0, 2, 3].forEach(row =>
        it(`removeRow ${row + 1} out of 4`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            Table.transitionDuration = "1ms"
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeRow(row, 1)
            await animationDone

            validateRender(model)
        })
    );

    [0, 2, 3].forEach(column =>
        it(`removeColumn ${column + 1} out of 4`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            Table.transitionDuration = "1ms"
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeColumn(column, 1)
            await animationDone

            validateRender(model)
        })
    )
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

function getTable(model: MyModel) {
    const table = document.querySelector("tx-table") as Table
    if (table === undefined) {
        throw Error("No <tx-table> found.")
    }
    if (table.getModel() !== model) {
        throw Error("<tx-model> has wrong model")
    }
    return new TableFriend(table)
}

function validateRender(model: MyModel) {

    // console.log(`validateRender: size ${model.colCount} x ${model.rowCount} = ${model.colCount * model.rowCount}`)

    const table = getTable(model)
    const body = table.body
    // console.log(`  body has length ${body.children.length}`)

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

    // let idx = 0
    // let txt = ""
    // for (let row = 0; row < model.rowCount; ++row) {
    //     for (let col = 0; col < model.colCount; ++col) {
    //         const cell = body.children[idx++] as HTMLSpanElement
    //         txt = `${txt}[${col},${row}]='${cell.textContent}' (${px2float(cell.style.left)},${px2float(cell.style.top)},${px2float(cell.style.width)},${px2float(cell.style.height)}):(${expectCol[col].x},${expectRow[row].y},${expectCol[col].w},${expectRow[row].h} )  `
    //         // txt = `${txt}[${col},${row}] ${cell} `
    //     }
    //     console.log(txt)
    //     txt = ""
    // }

    if (model.showColumnHeaders) {
        const colHeads = table.colHeads!
        const colHandles = table.colResizeHandles!
        expect(colHeads.children.length).to.equal(model.colCount+1)
        expect(colHandles.children.length).to.equal(model.colCount+1)
        const height = px2int((colHeads.children[0] as HTMLSpanElement).style.height)
        for (let col = 0; col < model.colCount; ++col) {
            const rowHeader = colHeads.children[col] as HTMLSpanElement
            expect(rowHeader.innerText, `column header ${col}`).to.equal((table.adapter.getColumnHead(col) as Text).data)
            expect(px2int(rowHeader.style.left), `column header ${col}] left`).to.equal(expectCol[col].x)
            expect(px2int(rowHeader.style.width), `column header ${col} width`).to.equal(expectCol[col].w)
            expect(px2int(rowHeader.style.top), `column header ${col} top`).to.equal(0)
            expect(px2int(rowHeader.style.height), `column header ${col} height`).to.equal(height)

            const rowHandle = colHandles.children[col] as HTMLSpanElement
            expect(rowHandle.dataset["idx"], `row handle ${col} index`).to.equal(`${col}`)
            if (col + 1 < model.colCount) {
                expect(px2int(rowHandle.style.left), `row handle ${col}] left`).to.equal(expectCol[col + 1].x - 2)
            } else {
                expect(px2int(rowHandle.style.left), `row handle ${col}] left`).to.equal(expectCol[col].x + expectCol[col].w + 3)
            }
            expect(px2int(rowHandle.style.width), `row handle ${col} width`).to.equal(5)
            expect(px2int(rowHandle.style.top), `row handle ${col} top`).to.equal(0)
            expect(px2int(rowHandle.style.height), `row handle ${col} height`).to.equal(height)
        }
    }

    if (model.showRowHeaders) {
        const rowHeads = table.rowHeads!
        const rowHandles = table.rowResizeHandles!
        expect(rowHeads.children.length).to.equal(model.rowCount+1)
        expect(rowHandles.children.length).to.equal(model.rowCount+1)
        const width = px2int((rowHeads.children[0] as HTMLSpanElement).style.width)
        for (let row = 0; row < model.rowCount; ++row) {
            const cell = rowHeads.children[row] as HTMLSpanElement
            expect(cell.innerText, `row header ${row}`).to.equal((table.adapter.getRowHead(row) as Text).data)
            expect(px2int(cell.style.left), `row header ${row}] left`).to.equal(0)
            expect(px2int(cell.style.width), `row header ${row} width`).to.equal(width)
            expect(px2int(cell.style.top), `row header ${row} top`).to.equal(expectRow[row].y)
            expect(px2int(cell.style.height), `row header ${row} height`).to.equal(expectRow[row].h)

            const colHandle = rowHandles.children[row] as HTMLSpanElement
            expect(colHandle.dataset["idx"], `column handle ${row} index`).to.equal(`${row}`)
            expect(px2int(colHandle.style.left), `column handle ${row}] left`).to.equal(0)
            expect(px2int(colHandle.style.width), `column handle ${row} width`).to.equal(width)
            if (row + 1 < model.rowCount) {
                expect(px2int(colHandle.style.top), `column handle ${row} top`).to.equal(expectRow[row + 1].y - 2)
            } else {
                expect(px2int(colHandle.style.top), `column handle ${row} top`).to.equal(expectRow[row].y + expectRow[row].h - 1)
            }
            expect(px2int(colHandle.style.height), `column handle ${row} height`).to.equal(5)
        }
    }

    let idx = 0

    expect(body.children.length).to.equal(model.colCount * model.rowCount)
    for (let row = 0; row < model.rowCount; ++row) {
        for (let col = 0; col < model.colCount; ++col) {
            const cell = body.children[idx++] as HTMLSpanElement
            expect(cell.innerText).to.equal(model.getCell(col, row).valueOf())
            expect(px2int(cell.style.left), `[${col},${row}] left`).to.equal((expectCol[col].x))
            expect(px2int(cell.style.width), `[${col},${row}] width`).to.equal((expectCol[col].w))
            expect(px2int(cell.style.top), `[${col},${row}] top`).to.equal((expectRow[row].y))
            expect(px2int(cell.style.height), `[${col},${row}] height`).to.equal((expectRow[row].h))
        }
    }
}

class MyModel extends GridTableModel<String> {
    showColumnHeaders = false
    showRowHeaders = false

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

    override getRowHead(row: number): Node | undefined {
        if (this.model!.showRowHeaders) {
            return text(`${row+1}`)
        }
    }

    override getColumnHead(col: number): Node | undefined {
        if (this.model!.showRowHeaders) {
            let str = ""
            while (true) {
                str = `${String.fromCharCode((col % 26) + 0x41)}${str}`
                col = Math.floor(col / 26)
                if (col === 0) {
                    break
                }
                col -= 1
            }
            return text(str)
        }
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
