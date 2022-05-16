import { expect } from '@esm-bundle/chai'
import { TableAdapter, bindModel, unbind, Table } from "@toad"
import { TableFriend } from '@toad/table/private/TableFriend'
import { EditMode } from '@toad/table/adapter/TableAdapter'
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'
import { input } from "@toad/util/lsx"
import { sleep, px2int, tabForward, tabBackward, getById, getByText, click, type, keyboard, activeElement } from "../testlib"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [X] tab in/out of table
// [X] edit on enter
// [X] display error
// [ ] edit on focus
// [ ] no edit
// [ ] row select mode
// [ ] insert more than one row/column
// [ ] tree view
// [ ] adjust selection, caret, after insert/remove row/column
// [ ] adjust table tool to available commands

// [ ] header glitches
// [ ] restrict minimal table size to at least one row or one column
// [ ] make table sizing more dynamic
//   [ ] never exceed the max width of the parent
//   [ ] if width smaller than max width of parent, become smaller unless overridden by style
//       (can we add some css in the element which can be overridden by element & page css?)

// [ ] update doc
// [ ] adjust other repositories to new table & style
// [ ] publish version 0.1.0

// FIXME: use the 'with data' for all tests because with or without data is a property of the model, not the view

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        let links = []
        let promises = []

        // FIXME: the test fails without these styles...

        for (let path of ["/style/tx-static.css", "/style/tx-dark.css", "/style/tx.css", "/style/tx-tabs.css"]) {
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

    describe("regressions", function() {
        it("layout formerly invisible table (e.g. within tabs)", async function() {
            const model = createModel(2, 2)
            document.body.innerHTML = `
            <tx-tabs style="width: 100%">
                <tx-tab label="TAB1">
                    This page intentionally left blank.
                </tx-tab>
                <tx-tab label="TAB2">
                    <tx-table model="model"></tx-table>
                </tx-tab>
            </tx-tabs>`
            await sleep()

            const tab2 = getByText("TAB2")!
            click(tab2)

            await sleep(20)
            const c0r0 = getByText("C0R0")!
            const c1r1 = getByText("C1R1")!

            const b0 = c0r0.getBoundingClientRect()
            const b1 = c1r1.getBoundingClientRect()

            expect(b0.width).to.be.greaterThan(10)
            expect(b0.height).to.be.greaterThan(10)

            expect(b0.x + b0.width - 1).to.equal(b1.x)
            expect(b0.y + b0.height - 1).to.equal(b1.y)
        })
    })

    describe("error display", function () {
        it("cycle", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()
            const table = getTable(model)

            const c0r0 = getByText("C0R0") as HTMLSpanElement
            const c1r0 = getByText("C1R0") as HTMLSpanElement
            const c0r1 = getByText("C0R1") as HTMLSpanElement

            // create cycle
            click(c0r0)
            keyboard({ key: "Enter" })
            type("=8", true)

            click(c1r0)
            keyboard({ key: "Enter" })
            type("=A1*2", true)

            click(c0r1)
            keyboard({ key: "Enter" })
            type("=B1*2", true)

            click(c0r0)
            keyboard({ key: "Enter" })
            type("=A2", true)

            keyboard({ key: "Enter" })

            expect(c0r0.classList.contains("error")).to.be.true
            expect(c1r0.classList.contains("error")).to.be.true
            expect(c0r1.classList.contains("error")).to.be.true

            // break cycle
            click(c0r0)
            keyboard({ key: "Enter" })
            type("=7", true)
            keyboard({ key: "Enter" })

            expect(c0r0.classList.contains("error")).to.be.false
            expect(c1r0.classList.contains("error")).to.be.false
            expect(c0r1.classList.contains("error")).to.be.false
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
        it.only("tab forward out of table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            const c1r1 = getByText("C1R1")!
            click(c1r1)
            tabForward()
            expect(activeElement()).to.equal(getById("after"))
            expect(c1r1?.classList.contains("selected")).is.false
        })
        it("tab backward out of table", async function () {
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

            keyboard({ key: "ArrowRight" })

            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        xit("cursor right to next row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({ key: "ArrowRight" })

            const cell = getByText("C0R1")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor left to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({ key: "ArrowLeft" })

            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        xit("cursor left to previous row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({ key: "ArrowLeft" })

            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor up", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({ key: "ArrowUp" })

            const cell = getByText("C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor down", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({ key: "ArrowDown" })

            const cell = getByText("C0R1")
            expect(cell?.classList.contains("selected")).is.true
        })

        function dumpCell(id: string, cell: SpreadsheetCell) {
            console.log(`${id}: _inputValue=${cell._inputValue} (${typeof cell._inputValue}), _calculatedValue=${cell._calculatedValue} (${typeof cell._calculatedValue}), _error=${cell._error} (${typeof cell._error}), _node=${cell._node} (${typeof cell._node})`)
        }

        // different edit modes: normal, spreadsheet
        describe("edit cell on enter (spreadsheet mode)", function () {
            it("editing an empty cell will result in an empty cell", async function() {
                TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
                const model = new TestModel(2, 2)
                bindModel("model", model)
                document.body.innerHTML = `<tx-table model="model"></tx-table>`
                await sleep()
                const table = getTable(model)
                const c0r0 = table.body.children[0]

                click(c0r0)
                expect(c0r0.textContent).to.equal("")

                keyboard({ key: "Enter" })
                expect(c0r0.textContent).to.equal("")

                keyboard({ key: "Enter" })
                expect(c0r0.textContent).to.equal("")
            })

            it("edit cell", async function () {
                const model = createModel(2, 2)
                document.body.innerHTML = `<tx-table model="model"></tx-table>`
                await sleep()
                const table = getTable(model)

                const c0r0 = getByText("C0R0") as HTMLSpanElement
                const c1r0 = getByText("C1R0") as HTMLSpanElement
                const c0r1 = getByText("C0R1") as HTMLSpanElement
                expect(c0r0.classList.contains("selected")).is.false
                expect(c0r0.contentEditable).to.not.equal("true")

                click(c0r0)
                expect(c0r0.classList.contains("selected")).is.true
                expect(c0r0.contentEditable).to.not.equal("true")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // [enter] starts editing the cell
                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("selected")).is.true
                expect(c0r0.contentEditable).to.equal("true")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // when there is another row, [enter] saves value and edits next row
                type("= 2 * 3", true)
                expect(c0r0.textContent).to.equal("=2*3")

                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("selected")).is.false
                expect(c0r0.contentEditable).to.not.equal("true")

                expect(c0r1.classList.contains("selected")).is.true
                expect(c0r1.contentEditable).to.equal("true")
                expect(c0r0.textContent).to.equal("6")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })

                type("= A1 * 2", true)

                // when there is no other row, [enter] saves value, and stays in row without editing
                // FIXME: this test does not cover that the code needs stopPropagation(), otherwise
                // switching the focus from the cell to the table will create another 'Enter' event
                // which switches the cell again into edit mode
                keyboard({ key: "Enter" })
                expect(c0r1.classList.contains("selected")).is.true
                expect(c0r1.contentEditable).to.not.equal("true")
                expect(c0r1.textContent).to.equal("12")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })
                expect(activeElement()).to.equal(table.table)

                // we can move to another cell
                keyboard({ key: "ArrowUp" })
                expect(c0r0.classList.contains("selected")).is.true
                expect(c0r1.classList.contains("selected")).is.false
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })
                expect(activeElement()).to.equal(table.table)

                // in edit mode ArrowDown moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowDown" })
                expect(c0r0.classList.contains("selected")).is.false
                expect(c0r0.textContent).to.equal("6")
                expect(c0r1.classList.contains("selected")).is.true
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })
                expect(activeElement()).to.equal(table.table)

                // in edit mode ArrowUp moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowUp" })
                expect(c0r0.classList.contains("selected")).is.true
                expect(c0r1.classList.contains("selected")).is.false
                expect(c0r1.textContent).to.equal("12")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })
                expect(activeElement()).to.equal(table.table)

                // in edit mode Tab moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "Tab" })
                expect(c0r0.classList.contains("selected")).is.false
                expect(c1r0.classList.contains("selected")).is.true
                expect(table.selection!.value).to.deep.equal({ col: 1, row: 0 })
                expect(activeElement()).to.equal(table.table)

                // allow shift + enter to create line break!
            })
        })
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

    // remove .selected when table looses focus (e.g. during tab out)

    describe("tree view", function() {

    })
})

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
    return s.map((item) => new SpreadsheetCell(item))
}

class TestModel extends SpreadsheetModel {
    showColumnHeaders = false
    showRowHeaders = false
    editMode = EditMode.EDIT_ON_ENTER
}

export class TestAdapter extends SpreadsheetAdapter<TestModel> {
    override get editMode(): EditMode {
        return this.model!.editMode
    }
}
