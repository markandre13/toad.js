import { expect } from '@esm-bundle/chai'
import { TableAdapter, bindModel, unbind, text, Table, TablePos } from "@toad"
import { TableFriend } from '@toad/table/private/TableFriend'
import { GridTableModel } from "@toad/table/model/GridTableModel"
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { InferTypedTableModelParameter, TypedTableAdapter } from '@toad/table/adapter/TypedTableAdapter'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'

import { input } from "@toad/util/lsx"

import { sleep, px2int, tabForward, tabBackward, getById, getByText, click, keyboard, activeElement } from "../testlib"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [ ] header glitches
// [ ] edit cells
// [ ] adjust selection, caret, ...
// [ ] tab in/out of table
// [ ] display error

// [ ] insert more than one row/column
// [ ] restrict minimal table size to at least one row or one column

// cell editing follows google sheets shortcuts
// not editing
//   type    : replace cell content
//   [enter] : edit cell content/formula (ms & apple use these: ctrl+u, f2, ctrl+=)
// editing
//   [enter] : move down
//   [esc]   : revert changes

// FIXME: use the 'with data' for all tests because with or without data is a property of the model, not the view

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        let links = []
        let promises = []

        // FIXME: the test fails without these styles...

        for (let path of ["/style/tx-static.css", "/style/tx-dark.css", "/style/tx.css"]) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.type = "text/css"
            link.href = path
            promises.push(new Promise<void>((resolve, reject) => {
                link.onload = () => {
                    resolve()
                }
            }))
            links.push(link)
        }
        document.head.replaceChildren(...links)
        for (let promise of promises) {
            await promise
        }
        await sleep(0)
    })

    describe("render", function () {
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
    })

    describe("event", function () {
        xit("test", async function () {
            let i0, i1, i2

            await sleep()
            for (let i = 0; i < 3; ++i) {
                const element = input()
                for (let type of ["focusin", "focusout", "focus", "blur", "pointerdown", "pointerup", "keydown", "keyup"]) {
                    element.addEventListener(type as any, (ev: FocusEvent) => {
                        console.log(`========== i${i} ${ev.type} ===========`)
                        console.log(ev)
                    })
                }
                document.body.appendChild(element)
            }
        })
    })

    describe("interaction", function () {
        it("click first cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            const cell = getByText("C0R0")
            click(cell!)
            expect(cell?.classList.contains("selected")).is.true
        })

        it("tab forward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[0] as HTMLElement).focus()

            tabForward()

            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })

        it("tab backward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[2] as HTMLElement).focus()

            tabBackward()

            const cell = getByText("C1R1")
            expect(cell?.classList.contains("selected")).is.true
        })

        it("tab to next cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)
            tabForward()
            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("tab to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)
            tabBackward()
            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("tab forward out of table", async function() {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            click(getByText("C1R1")!)
            tabForward()
            expect(activeElement()).to.equal(getById("after"))
        })
        it("tab backward out of table", async function() {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            click(getByText("C0R0")!)
            tabBackward()
            expect(activeElement()).to.equal(getById("before"))
        })
        it("cursor right to next cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({key: "ArrowRight"})
            
            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        xit("cursor right to next row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({key: "ArrowRight"})
            
            const cell = getByText("C0R1")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor left to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({key: "ArrowLeft"})
            
            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        xit("cursor left to previous row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({key: "ArrowLeft"})
            
            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor up", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({key: "ArrowUp"})
            
            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor down", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({key: "ArrowDown"})
            
            const cell = getByText("C0R1")
            expect(cell?.classList.contains("selected")).is.true
        })

        // different edit modes: normal, spreadsheet
        it("edit cell")
    })

    describe("edit columns/rows", function () {

        it(`with headers: insertRow with data`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, str2cell(["N1", "N2", "N3", "N4"]))
            await animationDone

            validateRender(model)
        })

        it(`with headers: insertColumn with data`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, str2cell(["N1", "N2", "N3", "N4"]))
            await animationDone

            validateRender(model)
        })

        it(`with headers: removeRow`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
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
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, str2cell(["N1", "N2", "N3", "N4"]))
            await animationDone

            validateRender(model)
        })

        it(`insertColumn with data`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, str2cell(["N1", "N2", "N3", "N4"]))
            await animationDone

            validateRender(model)
        });

        [0, 2, 4].forEach(row =>
            it(`insertRow ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)
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
})

class TestModel extends SpreadsheetModel {
    showColumnHeaders = false
    showRowHeaders = false
}

function createModel(cols: number, rows: number) {
    TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
    const model = new TestModel(cols, rows)
    for (let row = 0; row < 4; ++row) {
        for (let col = 0; col < 4; ++col) {
            model.setField(col, row, `C${col}R${row}`)
        }
    }
    bindModel("model", model)
    return model
}

function getTable(model: TestModel) {
    const table = document.querySelector("tx-table") as Table
    if (table === undefined) {
        throw Error("No <tx-table> found.")
    }
    if (table.getModel() !== model) {
        throw Error("<tx-model> has wrong model")
    }
    return new TableFriend(table)
}

function validateRender(model: TestModel) {

    // console.log(`validateRender: size ${model.colCount} x ${model.rowCount} = ${model.colCount * model.rowCount}`)

    const table = getTable(model)
    const body = table.body
    // console.log(`  body has length ${body.children.length}`)

    const expectCol: { x: number, w: number }[] = []
    let x = 0
    for (let col = 0; col < model.colCount; ++col) {
        const cell = body.children[col] as HTMLSpanElement
        const w = px2int(cell.style.width)
        expectCol.push({ x, w })
        // console.log(`expectCol[${col}] = {x: ${x}, w: ${w}}`)
        x += w + 6 - 1
    }

    const expectRow: { y: number, h: number }[] = []
    let y = 0
    for (let row = 0; row < model.rowCount; ++row) {
        const cell = body.children[row * model.colCount] as HTMLSpanElement
        const h = px2int(cell.style.height)
        expectRow.push({ y, h })
        // console.log(`expectRow[${row}] = {x: ${y}, w: ${h}}`)
        y += h + 2 - 1
    }

    // let idx0 = 0
    // let txt = "cols (x,w): "
    // for (let col = 0; col < model.colCount; ++col) {
    //     txt += `${expectCol[col].x},${expectCol[col].w} `
    // }
    // console.log(txt)

    // txt = "rows (y,h): "
    // for (let row = 0; row < model.rowCount; ++row) {
    //     txt += `${expectRow[row].y},${expectRow[row].h} `
    // }
    // console.log(txt)
    // txt = ""

    // for (let row = 0; row < model.rowCount; ++row) {
    //     for (let col = 0; col < model.colCount; ++col) {
    //         const cell = body.children[idx0++] as HTMLSpanElement
    //         txt = `${txt}[${col},${row}]='${cell.textContent}' (${px2float(cell.style.left)},${px2float(cell.style.top)},${px2float(cell.style.width)},${px2float(cell.style.height)}):(${expectCol[col].x},${expectRow[row].y},${expectCol[col].w},${expectRow[row].h} )  `
    //     }
    //     console.log(txt)
    //     txt = ""
    // }

    if (model.showColumnHeaders) {
        const colHeads = table.colHeads!
        const colHandles = table.colResizeHandles!
        expect(colHeads.children.length).to.equal(model.colCount + 1)
        expect(colHandles.children.length).to.equal(model.colCount + 1)
        const height = px2int((colHeads.children[0] as HTMLSpanElement).style.height)
        for (let col = 0; col < model.colCount; ++col) {
            const rowHeader = colHeads.children[col] as HTMLSpanElement
            expect(rowHeader.innerText, `column header ${col}`).to.equal((table.adapter.getColumnHead(col) as Text).data)
            expect(px2int(rowHeader.style.left), `column header ${col} left`).to.equal(expectCol[col].x)
            expect(px2int(rowHeader.style.width), `column header ${col} width`).to.equal(expectCol[col].w)
            expect(px2int(rowHeader.style.top), `column header ${col} top`).to.equal(0)
            expect(px2int(rowHeader.style.height), `column header ${col} height`).to.equal(height)

            const rowHandle = colHandles.children[col] as HTMLSpanElement
            expect(rowHandle.dataset["idx"], `row handle ${col} index`).to.equal(`${col}`)
            if (col + 1 < model.colCount) {
                expect(px2int(rowHandle.style.left), `row handle ${col} left`).to.equal(expectCol[col + 1].x - 3)
            } else {
                expect(px2int(rowHandle.style.left), `row handle last left`).to.equal(expectCol[col].x + expectCol[col].w + 5 - 3)
            }
            expect(px2int(rowHandle.style.width), `row handle ${col} width`).to.equal(5)
            expect(px2int(rowHandle.style.top), `row handle ${col} top`).to.equal(0)
            expect(px2int(rowHandle.style.height), `row handle ${col} height`).to.equal(height + 2)
        }
    }

    if (model.showRowHeaders) {
        const rowHeads = table.rowHeads!
        const rowHandles = table.rowResizeHandles!
        expect(rowHeads.children.length).to.equal(model.rowCount + 1)
        expect(rowHandles.children.length).to.equal(model.rowCount + 1)
        const width = px2int((rowHeads.children[0] as HTMLSpanElement).style.width)
        for (let row = 0; row < model.rowCount; ++row) {
            const cell = rowHeads.children[row] as HTMLSpanElement
            expect(cell.innerText, `row header ${row}`).to.equal((table.adapter.getRowHead(row) as Text).data)
            expect(px2int(cell.style.left), `row header ${row} left`).to.equal(0)
            expect(px2int(cell.style.width), `row header ${row} width`).to.equal(width)
            expect(px2int(cell.style.top), `row header ${row} top`).to.equal(expectRow[row].y)
            expect(px2int(cell.style.height), `row header ${row} height`).to.equal(expectRow[row].h)

            const colHandle = rowHandles.children[row] as HTMLSpanElement
            expect(colHandle.dataset["idx"], `column handle ${row} index`).to.equal(`${row}`)
            expect(px2int(colHandle.style.left), `column handle ${row} left`).to.equal(0)
            expect(px2int(colHandle.style.width), `column handle ${row} width`).to.equal(width + 6)
            if (row + 1 < model.rowCount) {
                expect(px2int(colHandle.style.top), `column handle ${row} top`).to.equal(expectRow[row + 1].y - 3)
            } else {
                expect(px2int(colHandle.style.top), `column handle last top`).to.equal(expectRow[row].y + expectRow[row].h - 2)
            }
            expect(px2int(colHandle.style.height), `column handle ${row} height`).to.equal(5)
        }
    }

    let idx = 0

    expect(body.children.length).to.equal(model.colCount * model.rowCount)
    for (let row = 0; row < model.rowCount; ++row) {
        for (let col = 0; col < model.colCount; ++col) {
            const cell = body.children[idx++] as HTMLSpanElement
            expect(cell.innerText).to.equal(model.getField(col, row).valueOf())
            expect(px2int(cell.style.left), `[${col},${row}] left`).to.equal((expectCol[col].x))
            expect(px2int(cell.style.width), `[${col},${row}] width`).to.equal((expectCol[col].w))
            expect(px2int(cell.style.top), `[${col},${row}] top`).to.equal((expectRow[row].y))
            expect(px2int(cell.style.height), `[${col},${row}] height`).to.equal((expectRow[row].h))
        }
    }
}

function str2cell(s: string[]) {
    return s.map( (item) => new SpreadsheetCell(item))
}

export abstract class GridAdapter<M extends GridTableModel<any>, T = InferTypedTableModelParameter<M>> extends TypedTableAdapter<M> {
    override getDisplayCell(col: number, row: number): Node | Node[] | undefined {
        if (!this.model) {
            return undefined
        }
        const cell = this.model.getCell(col, row)
        if (cell === undefined)
            return undefined
        return text(cell.value)
    }
    
    override getRowHead(row: number): Node | undefined {
        // console.log(`row ${row} -> ${row}`)
        return text(`${row+1}`)
    }

    override getColumnHead(col: number): Node | undefined {
        let str = ""
        let code = col
        while (true) {
            str = `${String.fromCharCode((code % 26) + 0x41)}${str}`
            code = Math.floor(code / 26)
            if (code === 0) {
                break
            }
            code -= 1
        }
        return text(str)
    }
}

export class SpreadsheetAdapter extends GridAdapter<SpreadsheetModel> {
    override editCell(pos: TablePos, cell: HTMLSpanElement) {
        console.log("MyAdapter.editCell()")
        cell.tabIndex = -1
        cell.contentEditable = "true"
        cell.focus()
        const a = this.model!.getCell(pos.col, pos.row)
        // console.log(a)
        if (a !== undefined) {
            cell.innerText = a._str!
        }
        return undefined
    }

    override saveCell(pos: TablePos, cell: HTMLSpanElement): void {
        console.log("MyAdapter.saveCell()")
        // this.model!.getCell(pos.col, pos.row)
        this.model!.setField(pos.col, pos.row, cell.innerText)
        cell.innerText = this.model!.getField(pos.col, pos.row) // HACK! The model should generate events to update the fields!!!
        cell.tabIndex = 0
        cell.blur()
    }
}
