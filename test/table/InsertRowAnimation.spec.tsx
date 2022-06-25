import { expect } from '@esm-bundle/chai'

import { Reference, unbind } from "@toad"

import { Table } from '@toad/table/Table'
import { TablePos } from "@toad/table/TablePos"

import { ArrayModel } from "@toad/table/model/ArrayModel"
import { ArrayTableModel } from "@toad/table/model/ArrayTableModel"
import { TableModel } from "@toad/table/model/TableModel"


import { TableAdapter } from '@toad/table/adapter/TableAdapter'
import { ArrayAdapter } from '@toad/table/adapter/ArrayAdapter'

import { refs } from "toad.jsx/lib/jsx-runtime"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

import { sleep, tabForward, tabBackward, getById, getByText, click, type, keyboard, activeElement, px2float } from "../testlib"
import { validateRender, TestModel, getTable } from "./util"
import { InsertRowAnimation } from '@toad/table/private/InsertRowAnimation'
import { TableFriend } from '@toad/table/private/TableFriend'

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        InsertRowAnimation.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("no headers", function () {
        describe("insert", function () {
            // test cases: empty table, head, middle, tail
            it.only("one row", async function () {
                Table.transitionDuration = "500ms"
                InsertRowAnimation.halt = false

                // WHEN we have an empty table without headings
                const model = await prepare([])
                const table = getTable(model)

                // ...insert a 1st row
                model.insertRow(0, new MeasureRow(1, 64))
                return

                // ...and ask for the new cells to be measured
                const animation = InsertRowAnimation.current!
                animation.prepareCellsToBeMeasured()
                await sleep()

                // THEN then two cells have been measured.
                expect(table.measure.children.length).to.equal(2)

                // WHEN ask for the new rows to be placed
                animation.arrangeNewRowsInStaging()

                // THEN they have been placed in staging
                expect(stagingRowInfo(0)).to.equal(`#1:0,0,86,66`)

                // ...and are hidden by a mask
                expect(maskY()).to.equal(0)
                expect(maskH()).to.equal(68)

                // WHEN we split the table for the animation
                animation.splitHorizontal()

                // THEN splitbody
                expect(splitBodyY()).to.equal(0)
                expect(splitBodyH()).to.equal(0)

                // WHEN we animate
                animation.animate()

                expect(maskTY()).to.equal(68)
                expect(splitBodyTY()).to.equal(68)

                animation.joinHorizontal()
                expect(bodyRowInfo(0)).to.equal(`#1:0,0,86,66`)

                expect(table.body.children).to.have.lengthOf(2)
            })
            // middle: insert < tail, insert > tail, insert > rest of window

            it("middle, insert > tail, insert < frame", async function () {
                // Table.transitionDuration = "500ms"
                // InsertRowAnimation.halt = false

                // GIVEN a table with two rows
                const model = await prepare([
                    new MeasureRow(1, 32),
                    new MeasureRow(3, 64)
                ])
                expect(bodyRowInfo(0)).to.equal(`#1,Y:0,H:32`)
                expect(bodyRowInfo(1)).to.equal(`#3,Y:33,H:64`)

                // WHEN we insert a row between them
                model.insertRow(1, new MeasureRow(2, 128))

                // THEN we measure the size of the rows to be inserted
                const animation = InsertRowAnimation.current!
                animation.prepareCellsToBeMeasured()
                await sleep()

                // THEN we move the new row into the staging
                // animation.prepareStaging()
                // expect(bodyRowInfo(0)).to.equal(`#1,Y:0,H:32`)
                // expect(bodyRowInfo(1)).to.equal(`#3,Y:33,H:64`)
                // expect(stagingRowInfo(0)).to.equal(`#2,Y:33,H:128`)

                // THEN we move the rows after the new one into split body for the animation
                // animation.splitHorizontal()
                // expect(bodyRowInfo(0)).to.equal(`#1,Y:0,H:32`)
                // expect(bodyRowInfo(1)).to.equal(`#2,Y:33,H:128`)
                // AND the splitBody has y and height for the rows to be inserted
                // so that during the animation the scrollbars match the start...
                // nope, this won't work. we can hide the new rows, but they still endup be seen...
                // BUT if we'd place the rows to be inserted behind/before the body, they would be visible
                // without affecting the scrollbars, while the split body within the body well make sure
                // the scrollbars will have the expected size
                // expect(splitRowInfo(0)).to.equal(`#3,Y:0,H:64`)
                // expect(splitBodyY()).to.equal(33)
                // expect(splitBodyH()).to.equal(128)
                // expect(animation.totalHeight).to.equal(67 + 1)

                // animation.joinHorizontal()
                // expect(bodyRowInfo(0)).to.equal(`#1,Y:0,H:61`)
                // expect(bodyRowInfo(1)).to.equal(`#2,Y:62,H:67`)
                // expect(bodyRowInfo(2)).to.equal(`#3,Y:130,H:71`)
            })
        })
    })
})

function bodyRowInfo(row: number) {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    return bodyRowInfoCore(row, table, table.body)
}

function splitRowInfo(row: number) {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    return bodyRowInfoCore(row, table, table.splitBody)
}

function stagingRowInfo(row: number) {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    return bodyRowInfoCore(row, table, table.staging)
}
function maskY() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const mask = table.staging.children[table.staging.children.length-1] as HTMLSpanElement
    return px2float(mask.style.top)
}
function maskTY() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const mask = table.staging.children[table.staging.children.length-1] as HTMLSpanElement
    const match = mask.style.transform.match(/translateY\((.*)\)/)!
    return px2float(match[1])
}


function maskH() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const mask = table.staging.children[table.staging.children.length-1] as HTMLSpanElement
    return px2float(mask.style.height)
}

function bodyRowInfoCore(row: number, table: TableFriend, body: HTMLDivElement) {
    const idx = row * table.adapter.colCount
    if (idx >= body.children.length) {
        throw Error(`Row ${row} does not exist. There are only ${ body.children.length/table.adapter.colCount}.`)
    }
    const child = body.children[idx] as HTMLElement
    const x = px2float(child.style.left)
    const y = px2float(child.style.top)
    const w = px2float(child.style.width)
    const h = px2float(child.style.height)

    // expectAllCellsInRowToBeAligned()
    for (let i = 1; i < table.adapter.colCount; ++i) {
        const childOther = body.children[idx + i] as HTMLElement
        expect(childOther.style.top).to.equal(child.style.top)
        expect(childOther.style.height).to.equal(child.style.height)
    }
    let id = child.innerText
    id = id.substring(0, id.indexOf('C'))
    return `${id}:${x},${y},${w},${h}`
}

function splitBodyY() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    return px2float(table.splitBody.style.top)
}
function splitBodyTY() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const match = table.splitBody.style.transform.match(/translateY\((.*)\)/)!
    return px2float(match[1])
}
function splitBodyH() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    return px2float(table.splitBody.style.height)
}

let model!: ArrayTableModel<MeasureRow>

async function prepare(data: MeasureRow[]) {
    TableAdapter.register(MeasureAdapter, ArrayModel, MeasureRow)
    model = new ArrayModel<MeasureRow>(data, MeasureRow)
    document.body.appendChild(<Table style={{ width: '100%', height: '500px' }} model={model} />)
    await sleep()
    return model
}

function validateRow(model: TableModel, modelrow: number) {
    const table = getTable(model)
    console.log(table.body)
}

// each row has an id to identify it and a variable height, to check that heights are calculated correctly
class MeasureRow {
    id: number
    height: number
    constructor(id?: number, height?: number) {
        this.id = id !== undefined ? id : 0
        this.height = height !== undefined ? height : 0
    }
}

class MeasureAdapter extends ArrayAdapter<ArrayTableModel<MeasureRow>> {
    getColumnHeads() {
        // return ["id", "height"]
        return undefined
    }
    getRow(row: MeasureRow): Reference<MeasureRow>[] {
        throw Error("yikes")
        // return refs(row, "id", "height")
    }
    override get colCount(): number {
        return 2
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        // super.showCell(pos, cell)
        const row = this.model!.data[pos.row]
        cell.replaceChildren(
            document.createTextNode(`#${row.id}C${pos.col}`)
        )
        if (pos.col === 1) {
            cell.style.height = `${row.height}px`
        }
        cell.style.width = `${80 * (pos.col+1)}px`
        return undefined // ??? why do we return something ???
    }
}