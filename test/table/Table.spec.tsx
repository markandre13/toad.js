import { expect } from '@esm-bundle/chai'

import { bindModel, unbind } from "@toad"

import { Table } from '@toad/table/Table'
import { TablePos } from "@toad/table/TablePos"
import { TableAdapter, EditMode } from '@toad/table/adapter/TableAdapter'
import { TreeNode } from "@toad/table/model/TreeNode"
import { TreeNodeModel } from "@toad/table/model/TreeNodeModel"
import { TreeAdapter } from "@toad/table/adapter/TreeAdapter"
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'

import { TableFriend } from '@toad/table/private/TableFriend'

import { NumberModel } from "@toad/model/NumberModel"
import { Text as TextView } from "@toad/view/Text"
import { Slider } from "@toad/view/Slider"

import { span, input, text } from "@toad/util/lsx"
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

import { sleep, tabForward, tabBackward, getById, getByText, click, type, keyboard, activeElement, px2float } from "../testlib"
import { validateRender, TestModel, getTable } from "./util"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [X] tab in/out of table
// [X] edit on enter
// [X] display error
// [ ] tree view
//   [X] add 'seamless' option to TableAdapter (formerly known as 'compact')
//   [X] fix that opening and closing several times make the row smaller and smaller
//   [ ] don't let the scrollbars flicker (e.g. place the splitBody inside this.root instead of this.body?)
//   [X] hide below bottom when shrinking
//   [ ] hide behind right side when shrinking
//   [ ] space bar to open/close node with focus
// [X] insert more than one row/column
// [ ] edit on focus
// [ ] no edit
// [ ] row select mode
// [ ] adjust selection, caret, after insert/remove row/column !!!
// [ ] adjust table tool to indicate available commands !!

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
        document.head.replaceChildren(txBase, txStatic, txDark)
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

    describe("regressions", function () {
        it("layout formerly invisible table (e.g. within tabs)", async function () {
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
        it("click into cells", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()
            const table = getTable(model)

            for (let row = 0; row < 2; ++row) {
                for (let col = 0; col < 2; ++col) {
                    const cell = getByText(`C${col}R${row}`)
                    click(cell!)
                    expect(activeElement()).to.equal(cell)
                    expect(table.selection?.value).to.deep.equal({ col, row })
                }
            }
        })

        it("tab forward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[0] as HTMLElement).focus()

            tabForward()

            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })

        it("tab backward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[2] as HTMLElement).focus()

            tabBackward()

            const cell = getByText("C1R1")
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 1 })
        })

        it("tab to next cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)
            tabForward()

            const cell = getByText("C1R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 0 })
        })
        it("tab to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)
            tabBackward()
            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })
        it("tab forward out of table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            const c1r1 = getByText("C1R1")!
            click(c1r1)
            tabForward()

            expect(activeElement()).to.equal(getById("after"))
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
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 0 })
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
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
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
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })
        it("cursor down", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({ key: "ArrowDown" })

            const cell = getByText("C0R1")
            expect(activeElement()).to.equal(cell)
            const table = getTable(model)
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 1 })
        })

        function dumpCell(id: string, cell: SpreadsheetCell) {
            console.log(`${id}: _inputValue=${cell._inputValue} (${typeof cell._inputValue}), _calculatedValue=${cell._calculatedValue} (${typeof cell._calculatedValue}), _error=${cell._error} (${typeof cell._error}), _node=${cell._node} (${typeof cell._node})`)
        }

        // different edit modes: normal, spreadsheet
        describe("edit cell on enter (spreadsheet mode)", function () {
            it("editing an empty cell will result in an empty cell", async function () {
                TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
                const model = new TestSpreadsheetModel(2, 2)
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

                click(c0r0)
                expect(activeElement()).to.equal(c0r0)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // [enter] starts editing the cell
                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("edit")).is.true
                expect(c0r0.hasAttribute("contenteditable")).to.be.true
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // when there is another row, [enter] saves value and edits next row
                type("= 2 * 3", true)
                expect(c0r0.textContent).to.equal("=2*3")

                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r0.textContent).to.equal("6")

                expect(c0r1.classList.contains("edit")).is.true
                expect(c0r1.hasAttribute("contenteditable")).to.be.true
                expect(activeElement()).to.equal(c0r1)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })

                type("= A1 * 2", true)

                // when there is no other row, [enter] saves value, and stays in row without editing
                // FIXME: this test does not cover that the code needs stopPropagation(), otherwise
                // switching the focus from the cell to the table will create another 'Enter' event
                // which switches the cell again into edit mode
                keyboard({ key: "Enter" })

                expect(c0r1.classList.contains("edit")).is.false
                expect(c0r1.textContent).to.equal("12")
                expect(activeElement()).to.equal(c0r1)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })

                // we can move to another cell
                keyboard({ key: "ArrowUp" })
                expect(activeElement()).to.equal(c0r0)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // in edit mode ArrowDown moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowDown" })
                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r0.textContent).to.equal("6")
                expect(c0r1.classList.contains("edit")).is.false
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })
                expect(activeElement()).to.equal(c0r1)

                // in edit mode ArrowUp moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowUp" })
                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r1.classList.contains("edit")).is.false
                expect(c0r1.textContent).to.equal("12")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })
                expect(activeElement()).to.equal(c0r0)

                // in edit mode Tab moves to another cell
                // FIXME: test fails but it works in real
                keyboard({ key: "Enter" })
                await sleep(100)
                // console.log("--------------------------")
                // keyboard({ key: "Tab" }) // TODO: this should lead to execute tabForward()
                tabForward()

                await sleep(100)
                expect(c0r0.classList.contains("edit")).is.false
                expect(c1r0.classList.contains("edit")).is.false
                expect(table.selection!.value).to.deep.equal({ col: 1, row: 0 })
                expect(activeElement()).to.equal(c1r0)

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

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, str2cell(["N1", "N2", "N3", "N4"]))
            await table.animation()

            validateRender(model)
        })

        it(`with headers: insertColumn with data`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, str2cell(["N1", "N2", "N3", "N4"]))
            await table.animation()

            validateRender(model)
        })

        it(`with headers: removeRow`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeRow(2)
            expect(model.rowCount).to.equal(3)
            await table.animation()

            validateRender(model)
        })

        it(`with headers: removeColumn`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeColumn(2)
            expect(model.colCount).to.equal(3)
            await table.animation()

            validateRender(model)
        })

        it(`insertRow with data`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, str2cell(["N1", "N2", "N3", "N4"]))
            await table.animation()

            validateRender(model)
        })

        it(`insertColumn with data`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, str2cell(["N1", "N2", "N3", "N4"]))
            await table.animation()

            validateRender(model)
        });

        [0, 2, 4].forEach(row =>
            it(`insertRow ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)

                await sleep()
                model.insertRow(row)
                await table.animation()

                validateRender(model)
            })
        );

        [0, 2, 4].forEach(row =>
            it(`insertColumn ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)

                await sleep()
                model.insertColumn(row)
                await table.animation()

                validateRender(model)
            })
        );

        [0, 2, 3].forEach(row =>
            it(`removeRow ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)

                await sleep()
                // also test wrong row size, and multiple rows
                model.removeRow(row, 1)
                await table.animation()

                validateRender(model)
            })
        );

        [0, 2, 3].forEach(column =>
            it(`removeColumn ${column + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)

                await sleep()
                // also test wrong row size, and multiple rows
                model.removeColumn(column, 1)
                await table.animation()

                validateRender(model)
            })
        )
    })

    describe("jsx", function () {
        it("table accepts 'model' and 'style' attributes", async function () {
            const model = createModel(4, 4)
            const x = (<>
                <style>{"body{background: #888;}"}</style>
                <Table model={model} style={{ width: '42%' }} />
            </>)
            document.body.replaceChildren(...x)
            await sleep()

            validateRender(model)

            const table = getTable(model)!
            expect(table.style.width).to.equal("42%")
        })
    })

    describe("layout", function () {
        it("expand", async function () {
            Table.transitionDuration = "500ms"
            const model = createWidgetTree()
            // TODO
            // * while when a TreeNodeModel is initialized from a populated tree,
            //   all nodes are closed.
            //   but an emtpy tree is used, which is then populated using add*()
            //   methods, all nodes are open
            //   => this should be consistent
            // * the leaf nodes don't render correctly
            model.collapse()

            document.body.replaceChildren(
                <Table model={model} style={{
                    position: 'absolute',
                    inset: 0,
                }} />
            )
            await sleep()
            const table = getTable(model).table
            const bounds = table.getBoundingClientRect()
            expect(bounds.width).to.equal(window.innerWidth)
            expect(bounds.height).to.equal(window.innerHeight)
        })
    })

    describe("tree", function () {

        it("opening and closing a tree renders properly", async function () {
            // Table.transitionDuration = "500ms"

            // GIVEN an initial tree view
            const model = createTreeModelFromTree()
            document.body.replaceChildren(
                <Table model={model} style={{ position: 'absolute', inset: 0 }} />
            )
            await sleep()
            const table = getTable(model)

            // THEN it renders correctly
            expect(rowLabel(table, 0)).to.equal("#0")
            expect(rowLabel(table, 1)).to.equal("#3")
            expect(rowCount(table)).to.equal(2)
            validateRender(model)

            // WHEN opening the 1st node
            click(getByText("#0")!.previousElementSibling!)

            await table.animation()

            // return

            // THEN it renders correctly
            expect(rowLabel(table, 0)).to.equal("#0")
            expect(rowLabel(table, 1)).to.equal("#1")
            expect(rowLabel(table, 2)).to.equal("#2")
            expect(rowLabel(table, 3)).to.equal("#3")
            expect(rowCount(table)).to.equal(4)
            validateRender(model)

            // WHEN opening the 2dn node
            click(getByText("#3")!.previousElementSibling!)
            await table.animation()

            // for(let row=0; row<6; ++row) {
            //     console.log((table.body.children[row*2].children[0].nextElementSibling as HTMLElement).innerText)
            // }

            // THEN it renders correctly
            expect(rowLabel(table, 0)).to.equal("#0")
            expect(rowLabel(table, 1)).to.equal("#1")
            expect(rowLabel(table, 2)).to.equal("#2")
            expect(rowLabel(table, 3)).to.equal("#3")
            expect(rowLabel(table, 4)).to.equal("#4")
            expect(rowLabel(table, 5)).to.equal("#5")
            expect(rowCount(table)).to.equal(6)
            validateRender(model)
        })

        it("center tree control vertically in row (?)", function() {

        })

        it("expand columns during insert row", function() {

        })

        it("rows are placed correctly after closing and opening subtree", async function () {
            // Table.transitionDuration = "1000ms"
            const model = createTree()
            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="tree"></tx-table>`
            await sleep()

            // validateRender(model)

            const table = getTable(model)

            let expectH = 19
            let expectY = 0
            for (let row = 0; row < model.rowCount; ++row) {
                const cell = table.body.children[row * model.colCount] as HTMLSpanElement
                const y = px2float(cell.style.top)
                const h = px2float(cell.style.height)
                // console.log(`expectRow[${row}] = {y: ${y}, h: ${h}}`)
                expect(y).to.equal(expectY)
                expect(h).to.equal(expectH)
                expectY += h
            }


            click(table.body.children[0].children[0])
            await table.animation()
            await sleep(100)

            expectY = 0
            for (let row = 0; row < model.rowCount; ++row) {
                const cell = table.body.children[row * model.colCount] as HTMLSpanElement
                const y = px2float(cell.style.top)
                const h = px2float(cell.style.height)
                // console.log(`expectRow[${row}] = {y: ${y}, h: ${h}}`)
                expect(y).to.equal(expectY)
                expect(h).to.equal(expectH)
                expectY += h
            }

            click(table.body.children[0].children[0])
            await table.animation()
            await sleep(100)

            expectY = 0
            for (let row = 0; row < model.rowCount; ++row) {
                const cell = table.body.children[row * model.colCount] as HTMLSpanElement
                const y = px2float(cell.style.top)
                const h = px2float(cell.style.height)
                // console.log(`expectRow[${row}] = {y: ${y} (${expectY}), h: ${h}}`)
                expect(y).to.equal(expectY)
                expect(h).to.equal(expectH)
                expectY += h
            }
        })
    })
})

function createModel(cols: number, rows: number) {
    TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
    const model = new TestSpreadsheetModel(cols, rows)
    for (let row = 0; row < 4; ++row) {
        for (let col = 0; col < 4; ++col) {
            model.setField(col, row, `C${col}R${row}`)
        }
    }
    bindModel("model", model)
    return model
}

function str2cell(s: string[]) {
    return s.map((item) => new SpreadsheetCell(item))
}

class TestSpreadsheetModel extends SpreadsheetModel implements TestModel {
    showColumnHeaders = false
    showRowHeaders = false
    editMode = EditMode.EDIT_ON_ENTER
    getModelValueOf(col: number, row: number): string {
        return this.getField(col, row).valueOf()
    }
    getCellValueOf(table: TableFriend, col: number, row: number): string {
        const cell = table.body.children[col + row * table.adapter.colCount] as HTMLElement
        return cell.innerText
    }
}

export class TestAdapter extends SpreadsheetAdapter<TestSpreadsheetModel> {
}

// ---------------------

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

class MyTreeAdapter extends TreeAdapter<MyNode> {
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        super.showCell(pos, cell)

        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label

        const labelNode = span(text(label))
        labelNode.style.verticalAlign = "middle"
        labelNode.style.padding = "2px"
        cell.appendChild(labelNode)
    }
}

function createTree(): TreeNodeModel<MyNode> {
    TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)
    let model = new TreeNodeModel(MyNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    model.addSiblingAfter(0)
    bindModel("tree", model)
    return model
}

class WidgetTreeAdapter extends TreeAdapter<WidgetNode> {
    override get colCount(): number {
        return 2
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        const node = this.model.rows[pos.row].node
        switch (pos.col) {
            case 0:
                this.treeCell(pos, cell, node.label)
                break
            case 1:
                if (node.model && node.down === undefined) {
                    const x = <>
                        <TextView model={node.model} style={{ width: '50px', margin: '10px' }} />
                        <Slider model={node.model} style={{ margin: '10px' }} />
                    </>
                    cell.replaceChildren(...x)
                }
                break
        }
    }
}

class TestTreeNodeModel extends TreeNodeModel<WidgetNode> implements TestModel {
    showColumnHeaders = false
    showRowHeaders = false
    editMode = EditMode.EDIT_ON_ENTER
    getModelValueOf(col: number, row: number): string {
        if (col !== 0) {
            return ""
        }
        return this.rows[row].node.label
    }
    getCellValueOf(table: TableFriend, col: number, row: number): string {
        if (col !== 0) {
            return ""
        }
        const cell = table.body.children[col + row * table.adapter.colCount] as HTMLElement
        return cell.innerText
    }
}

function createWidgetTree(): TestTreeNodeModel {
    TreeAdapter.register(WidgetTreeAdapter, TreeNodeModel, WidgetNode)

    let model = new TestTreeNodeModel(WidgetNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    // model.addSiblingAfter(0)
    return model
}

class WidgetNode implements TreeNode {
    label: string
    next?: WidgetNode
    down?: WidgetNode
    model = new NumberModel(0, { min: 0, max: 1, step: 0.01 })
    static counter = 0
    constructor(label?: string, ...children: WidgetNode[]) {
        this.label = label ? label : ""
        if (children.length > 0) {
            this.down = children[0]
        }
        for (let i = 1; i < children.length; ++i) {
            children[i - 1].next = children[i]
        }
    }
}

function createTreeModelFromTree(): TestTreeNodeModel {
    TreeAdapter.register(WidgetTreeAdapter, TreeNodeModel, WidgetNode)
    return new TestTreeNodeModel(WidgetNode,
        new WidgetNode("",
            new WidgetNode("#0",
                new WidgetNode("#1"),
                new WidgetNode("#2")
            ),
            new WidgetNode("#3",
                new WidgetNode("#4"),
                new WidgetNode("#5")
            )
        ).down
    )
}

function rowLabel(table: TableFriend, row: number): string {
    // console.log(`${row} * ${table.adapter.colCount}`)
    // console.log(table.body.children[row * table.adapter.colCount])
    return (table.body.children[row * table.adapter.colCount].children[1] as HTMLElement).innerText
}

function rowCount(table: TableFriend): number {
    return table.adapter.rowCount
}