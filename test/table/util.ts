import { expect } from '@esm-bundle/chai'

import { EditMode } from '@toad/table/adapter/TableAdapter'
import { TableModel } from "@toad/table/model/TableModel"
import { Table } from "@toad/table/Table"
import { TableFriend } from "@toad/table/private/TableFriend"

import { px2int } from "../testlib"


export class TableWrapper extends TableFriend {
    animation: Promise<void>
    constructor(table: Table) {
        super(table)
        this.animation = new Promise<void>((resolve, reject) => {
            table.animationDone = () => {
                resolve()
            }
        })
    }
}

export interface TestModel extends TableModel {
    showColumnHeaders: boolean
    showRowHeaders: boolean
    editMode: EditMode
    getValueOf(col: number, row: number): string
}

export function getTable(model: TableModel) {
    const table = document.querySelector("tx-table") as Table
    if (table === undefined) {
        throw Error("No <tx-table> found.")
    }
    if (table.getModel() !== model) {
        throw Error("<tx-model> has wrong model")
    }
    return new TableWrapper(table)
}


export function validateRender(model: TestModel) {

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
            expect(cell.innerText).to.equal(model.getValueOf(col, row))
            expect(px2int(cell.style.left), `[${col},${row}] left`).to.equal((expectCol[col].x))
            expect(px2int(cell.style.width), `[${col},${row}] width`).to.equal((expectCol[col].w))
            expect(px2int(cell.style.top), `[${col},${row}] top`).to.equal((expectRow[row].y))
            expect(px2int(cell.style.height), `[${col},${row}] height`).to.equal((expectRow[row].h))
        }
    }
}
