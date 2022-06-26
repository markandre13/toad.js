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
    describe("row", function () {
        describe("insert", function () {

            describe("no headers", function () {
                describe("empty table", function () {
                    // test cases: empty table, head, middle, tail
                    it("one row", async function () {
                        // Table.transitionDuration = "500ms"
                        // InsertRowAnimation.halt = false

                        // WHEN we have an empty table without headings
                        const model = await prepare([])
                        const table = getTable(model)

                        // ...insert a 1st row
                        model.insertRow(0, new MeasureRow(1, 64))

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepareCellsToBeMeasured()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(2)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,64`)

                        // ...and are hidden by a mask
                        const insertHeight = 64 + 2
                        expect(maskY()).to.equal(0)
                        expect(maskH(), "mask height in pixels").to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()

                        // THEN splitbody
                        expect(splitBodyY()).to.equal(0)
                        expect(splitBodyH()).to.equal(0)

                        // WHEN we animate
                        animation.animate()

                        expect(maskTY()).to.equal(insertHeight)
                        expect(splitBodyTY()).to.equal(insertHeight)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,64`)

                        expect(table.body.children).to.have.lengthOf(2)
                    })

                    it("two rows", async function () {
                        // Table.transitionDuration = "500ms"
                        // InsertRowAnimation.halt = false

                        // WHEN we have an empty table without headings
                        const model = await prepare([])
                        const table = getTable(model)

                        // ...insert the 1st two rows
                        model.insertRow(0, [
                            new MeasureRow(1, 32),
                            new MeasureRow(2, 64)
                        ])

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepareCellsToBeMeasured()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(4)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(stagingRowInfo(1)).to.equal(`#2:0,33,80,64`)

                        // ...and are hidden by a mask
                        const insertHeight = 32 + 64 + 4 - 1
                        expect(maskY()).to.equal(0)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()

                        // THEN splitbody
                        expect(splitBodyY()).to.equal(0)
                        expect(splitBodyH()).to.equal(0)

                        // WHEN we animate
                        animation.animate()

                        expect(maskTY()).to.equal(insertHeight)
                        expect(splitBodyTY()).to.equal(insertHeight)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)

                        expect(table.body.children).to.have.lengthOf(4)
                    })
                    // middle: insert < tail, insert > tail, insert > rest of window
                })
                describe("populated table", function () {
                    it("two rows at head", async function () {
                        // Table.transitionDuration = "5000ms"
                        // InsertRowAnimation.halt = false

                        // WHEN we have an empty table without headings
                        const model = await prepare([
                            new MeasureRow(3, 32),
                            new MeasureRow(4, 64)
                        ])
                        const table = getTable(model)

                        expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                        // ...at the head insert two rows
                        model.insertRow(0, [
                            new MeasureRow(1, 48),
                            new MeasureRow(2, 72)
                        ])

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepareCellsToBeMeasured()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(4)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                        expect(stagingRowInfo(1)).to.equal(`#2:0,49,80,72`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 72 + 4 - 1
                        expect(maskY()).to.equal(0)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()
                        expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                        expect(splitRowInfo(1)).to.equal(`#4:0,33,80,64`)
                        // THEN splitbody
                        expect(splitBodyY()).to.equal(0)

                        expect(splitBodyH()).to.equal(32 + 64 + 4 - 1)

                        // WHEN we animate
                        animation.animate()

                        expect(maskTY()).to.equal(insertHeight-1)
                        expect(splitBodyTY()).to.equal(insertHeight-1)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,48`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,49,80,72`)
                        expect(bodyRowInfo(2)).to.equal(`#3:0,122,80,32`)
                        expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
                        expect(table.body.children).to.have.lengthOf(8)
                    })
                    it.only("two rows at middle", async function () {
                        // Table.transitionDuration = "5000ms"
                        // InsertRowAnimation.halt = false

                        // WHEN we have an empty table without headings
                        const model = await prepare([
                            new MeasureRow(1, 32),
                            new MeasureRow(4, 64)
                        ])
                        const table = getTable(model)

                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                        // ...at the head insert two rows
                        model.insertRow(1, [
                            new MeasureRow(2, 48),
                            new MeasureRow(3, 72)
                        ])

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepareCellsToBeMeasured()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(4)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,80,48`)
                        expect(stagingRowInfo(1)).to.equal(`#3:0,82,80,72`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 72 + 4 - 1
                        expect(maskY()).to.equal(33)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()
                        expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                        // THEN splitbody
                        expect(splitBodyY()).to.equal(33)
                        expect(splitBodyH()).to.equal(64 + 2)

                        // WHEN we animate
                        animation.animate()

                        expect(maskTY()).to.equal(insertHeight-1)
                        expect(splitBodyTY()).to.equal(insertHeight-1)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,48`)
                        expect(bodyRowInfo(2)).to.equal(`#3:0,82,80,72`)
                        expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
                        expect(table.body.children).to.have.lengthOf(8)
                    })
                })
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
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.top)
}
function maskTY() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    const match = mask.style.transform.match(/translateY\((.*)\)/)!
    return px2float(match[1])
}


function maskH() {
    const tableX = document.querySelector("tx-table") as Table
    const table = new TableFriend(tableX)
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.height)
}

function bodyRowInfoCore(row: number, table: TableFriend, body: HTMLDivElement) {
    const idx = row * table.adapter.colCount
    if (idx >= body.children.length) {
        throw Error(`Row ${row} does not exist. There are only ${body.children.length / table.adapter.colCount}.`)
    }
    const child = body.children[idx] as HTMLElement
    const x = px2float(child.style.left)
    const y = px2float(child.style.top)
    const w = px2float(child.style.width)
    const h = px2float(child.style.height)

    // expectAllCellsInRowToBeAligned()
    for (let i = 1; i < table.adapter.colCount; ++i) {
        const childOther = body.children[idx + i] as HTMLElement
        // expect(childOther.style.top).to.equal(child.style.top)
        // expect(childOther.style.height).to.equal(child.style.height)
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
    document.body.replaceChildren(<Table style={{ width: '100%', height: '250px' }} model={model} />)
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
        cell.style.width = `${80 * (pos.col + 1)}px`
        return undefined // ??? why do we return something ???
    }
}