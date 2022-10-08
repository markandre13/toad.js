import { expect } from '@esm-bundle/chai'

import { EditMode } from '@toad/table/adapter/TableAdapter'
import { TableModel } from "@toad/table/model/TableModel"
import { Table } from "@toad/table/Table"
import { TablePos } from "@toad/table/TablePos"
import { TableAdapter, TableAdapterConfig } from "@toad/table/adapter/TableAdapter"
import { GridAdapter } from "@toad/table/adapter/GridAdapter"
import { TableFriend } from "@toad/table/private/TableFriend"

import { px2int, px2float, sleep } from "../testlib"
import { GridTableModel } from "@toad/table/model/GridTableModel"

export enum Orientation {
    HORIZONTAL, VERTICAL
}

export class Cell {
    orientation?: Orientation
    id: number
    idx: number
    size?: number

    constructor(orientation?: Orientation, id?: number, idx?: number, size?: number) {
        this.orientation = orientation
        this.id = id ?? 0
        this.idx = idx ?? 0
        this.size = size
    }
    valueOf(): string {
        if (this.orientation === undefined) {
            throw Error(`Cell has no orienttion`)
        }
        switch (this.orientation) {
            case Orientation.HORIZONTAL:
                return `#${this.id}C${this.idx}`
            case Orientation.VERTICAL:
                return `#${this.id}R${this.idx}`
        }
    }
}

export class Measure {
    id: number
    size: number
    constructor(id?: number, size?: number) {
        this.id = id !== undefined ? id : 0
        this.size = size !== undefined ? size : 0
    }
    toCells(orientation: Orientation) {
        return [
            new Cell(orientation, this.id, 0, this.size),
            new Cell(orientation, this.id, 1, undefined)
        ]
    }
}

export class MeasureModel extends GridTableModel<Cell> {
    orientation: Orientation
    columnHeaders = false
    rowHeaders = false
    config = new TableAdapterConfig()
    constructor(orientation: Orientation, nodeClass: new () => Cell, cols: number, rows: number, data?: Cell[]) {
        // console.log(`MeaasureModel(): cols=${cols}, rows=${rows}`)
        super(nodeClass, cols, rows, data)
        this.orientation = orientation
    }
}

export class MeasureAdapter extends GridAdapter<MeasureModel> {
    constructor(model: MeasureModel) {
        super(model)
        this.config = model.config
    }
    override getRowHead(row: number): Node | undefined {
        if (this.model?.rowHeaders !== true)
            return undefined
        const data = this.model!!.getCell(0, row)
        return document.createTextNode(`R${data.id}`)
    }
    override getColumnHead(col: number): Node | undefined {
        if (this.model?.columnHeaders !== true)
            return undefined
        const data = this.model!!.getCell(col, 0)
        return document.createTextNode(`C${data.id}`)
    }

    setCellSize(cell: HTMLElement, size: number) {
        switch (this.model!!.orientation) {
            case Orientation.HORIZONTAL:
                cell.style.width = `80px` // `${80 * (pos.col + 1)}px`
                cell.style.height = `${size}px`
                break
            case Orientation.VERTICAL:
                cell.style.width = `${size}px`
                break
        }
    }

    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        // const row = this.model!.data[pos.row]
        // console.log(`MeasureAdapter.showCell(${pos})`)
        const data = this.model!!.getCell(pos.col, pos.row)
        // console.log(this.model!!.asArray())
        // console.log(data)

        cell.replaceChildren(
            // document.createTextNode(`C${pos.col}R${pos.row}`)
            document.createTextNode(data.valueOf())
            // document.createTextNode(`#${row.id}C${pos.col}`)
        )
        switch (data.idx) {
            case 0:
                if (data.size === undefined) {
                    this.setCellSize(cell, 80 * (data.idx + 1))
                } else {
                    this.setCellSize(cell, data.size)
                }
                // console.log(`MeasureAdapter.showCell(${pos.col}, ${pos.row}) => size ${cell.style.width} x ${cell.style.height}`)
                break
            case 1:
                // if (data.size !== undefined) {
                //     this.setCellSize(cell, data.size!!)
                // }
                break
        }
        return undefined // ??? why do we return something ???
    }
}

export interface PrepareProps {
    columnHeaders?: boolean
    rowHeaders?: boolean
    seamless?: boolean
    expandColumn?: boolean
    width?: number
    height?: number
}
export async function prepareByRows(data: Measure[], props?: PrepareProps) {
    TableAdapter.register(MeasureAdapter, MeasureModel, Cell) // FIXME:  should also work without specifiyng Cell as 3rd arg?
    const model = new MeasureModel(Orientation.HORIZONTAL, Cell, 2, data.length, flatMapRows(data))
    return await prepareCore(data, props, model)
}
export async function prepareByColumns(data: Measure[], props?: PrepareProps) {
    TableAdapter.register(MeasureAdapter, MeasureModel, Cell) // FIXME:  should also work without specifiyng Cell as 3rd arg?
    const model = new MeasureModel(Orientation.VERTICAL, Cell, data.length, 2, flatMapColumns(data))
    return await prepareCore(data, props, model)
}
async function prepareCore(data: Measure[], props: PrepareProps | undefined, model: MeasureModel) {
    model.config.seamless = (props?.seamless) === true
    model.config.expandColumn = (props?.expandColumn) === true
    model.rowHeaders = (props?.rowHeaders) === true
    model.columnHeaders = (props?.columnHeaders) === true
    document.body.replaceChildren(<Table style={{
        width: `${props?.width ?? 720}px`,
        height: `${props?.height ?? 350}px`
    }} model={model} />)
    await sleep()
    return model
}

export function flatMapRows(data: Measure[]) {
    return data.flatMap(it => it.toCells(Orientation.HORIZONTAL))
}

export function flatMapColumns(dataIn: Measure[]) {
    const data = dataIn.map(it => it.toCells(Orientation.VERTICAL))
    let result: Cell[] = []
    if (data.length === 0)
        return result
    const rows = data[0].length
    for (let i = 0; i < rows; ++i) {
        result = result.concat(data.flatMap(it => it[i]))
    }
    return result
}

export function getTable() {
    return new TableFriend(
        document.querySelector("tx-table") as Table
    )
}
export function bodyRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.body)
}
export function splitRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.splitBody)
}
export function stagingRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.getStaging()!)
}
export function headRowInfo(row: number) {
    const table = getTable()
    return infoCore(table.rowHeads.children[row])
}
export function headColInfo(row: number) {
    const table = getTable()
    return infoCore(table.colHeads.children[row])
}
export function stagingRowHeadInfo(row: number) {
    const table = getTable()
    return infoCore(table.getHeadStaging()!.children[row])
}
export function stagingColHeadInfo(col: number) {
    const table = getTable()
    return infoCore(table.getHeadStaging()!.children[col])
}
export function splitRowHeadInfo(row: number) {
    const table = getTable()
    return infoCore(table.rowHeads.lastElementChild!.children[row])
}
export function splitColHeadInfo(col: number) {
    const table = getTable()
    return infoCore(table.colHeads.lastElementChild!.children[col])
}
function infoCore(element: Element) {
    const cell = element as HTMLElement
    const x = px2float(cell.style.left)
    const y = px2float(cell.style.top)
    const w = px2float(cell.style.width)
    const h = px2float(cell.style.height)
    let id = cell.innerText
    id = id.substring(1)
    return `#${id}:${x},${y},${w},${h}`
}
export function splitRowHeadY() {
    const table = getTable()
    const split = table.rowHeads.lastElementChild as HTMLElement
    return px2float(split.style.top)
}
export function splitRowHeadH() {
    const table = getTable()
    const split = table.rowHeads.lastElementChild as HTMLElement
    return px2float(split.style.height)
}
export function splitColHeadX() {
    const table = getTable()
    const split = table.colHeads.lastElementChild as HTMLElement
    return px2float(split.style.left)
}
export function splitColHeadW() {
    const table = getTable()
    const split = table.colHeads.lastElementChild as HTMLElement
    return px2float(split.style.width)
}
export function splitBodyY() {
    const table = getTable()
    return px2float(table.splitBody.style.top)
}
export function splitBodyH() {
    const table = getTable()
    return px2float(table.splitBody.style.height)
}
export function maskX() {
    const table = getTable()
    const mask = table.getStaging()!.children[table.getStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.left)
}
export function maskW() {
    const table = getTable()
    const mask = table.getStaging()!.children[table.getStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.width)
}
export function maskY() {
    const table = getTable()
    const mask = table.getStaging()!.children[table.getStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.top)
}
export function maskH() {
    const table = getTable()
    const mask = table.getStaging()!.children[table.getStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.height)
}
export function headMaskY() {
    const table = getTable()
    const mask = table.getHeadStaging()!.children[table.getHeadStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.top)
}
export function headMaskH() {
    const table = getTable()
    const mask = table.getHeadStaging()!.children[table.getHeadStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.height)
}
export function headMaskX() {
    const table = getTable()
    const mask = table.getHeadStaging()!.children[table.getHeadStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.left)
}
export function headMaskW() {
    const table = getTable()
    const mask = table.getHeadStaging()!.children[table.getHeadStaging()!.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.width)
}
export function bodyRowInfoCore(row: number, table: TableFriend, body: HTMLDivElement) {
    const indexOf1stCellInRow = row * table.adapter.colCount
    if (indexOf1stCellInRow >= body.children.length) {
        throw Error(`Row ${row} does not exist. There are only ${body.children.length / table.adapter.colCount}.`)
    }
    const firstCellOfRow = body.children[indexOf1stCellInRow] as HTMLElement
    const x = px2float(firstCellOfRow.style.left)
    const y = px2float(firstCellOfRow.style.top)
    const w = px2float(firstCellOfRow.style.width)
    const h = px2float(firstCellOfRow.style.height)

    for (let i = 1; i < table.adapter.colCount; ++i) {
        const otherCellInRow = body.children[indexOf1stCellInRow + i] as HTMLElement
        expect(otherCellInRow.style.top).to.equal(firstCellOfRow.style.top)
        expect(otherCellInRow.style.height).to.equal(firstCellOfRow.style.height)
    }
    let id = firstCellOfRow.innerText
    id = id.substring(0, id.indexOf('C'))
    return `${id}:${x},${y},${w},${h}`
}

export function splitBodyX() {
    const table = getTable()
    return px2float(table.splitBody.style.left)
}
export function splitBodyW() {
    const table = getTable()
    return px2float(table.splitBody.style.width)
}
export function bodyColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.body)
}
export function splitColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.splitBody)
}
export function stagingColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.getStaging()!)
}
export function stagingInsertColInfo(col: number) {
    const table = getTable()
    return insertColInfoCore(col, table, table.getStaging()!)
}
//  1 2 3 4
//  5 6 7 8
export function bodyColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {
    // if (table.staging && body.children[body.children.length-1] === table.staging)

    let extraNodesInBody = 0
    for (let child of body.children) {
        if (child === table.getStaging() || (child as HTMLElement).style.backgroundColor === 'rgba(0, 0, 128, 0.3)') { // last is mask
            ++extraNodesInBody
            break
        }
    }
    const actualBodyColCount = (body.children.length - extraNodesInBody) / table.adapter.model.rowCount

    if (col >= actualBodyColCount) {
        throw Error(`Column ${col} does not exist. There are only ${body.children.length / table.adapter.colCount}.`)
    }

    const firstCellOfCol = body.children[col] as HTMLElement
    const x = px2float(firstCellOfCol.style.left)
    const y = px2float(firstCellOfCol.style.top)
    const w = px2float(firstCellOfCol.style.width)
    const h = px2float(firstCellOfCol.style.height)

    // console.log(`XXX ${table.adapter.rowCount}`)
    for (let row = 1; row < table.adapter.rowCount; ++row) {
        // console.log(`  check ${col}, ${row} in ${table.adapter.colCount} (${actualBodyColCount}) x ${table.adapter.rowCount}`)
        const otherCellInRow = body.children[col + row * actualBodyColCount] as HTMLElement
        const what = `${firstCellOfCol.innerText} vs ${otherCellInRow.innerText} (size=${table.adapter.colCount} x ${table.adapter.rowCount})`
        expect(otherCellInRow.style.left, `left of ${what}`).to.equal(firstCellOfCol.style.left)
        expect(otherCellInRow.style.width, `width of ${what}`).to.equal(firstCellOfCol.style.width)
    }
    let id = firstCellOfCol.innerText
    id = id.substring(0, id.indexOf('R'))
    return `${id}:${x},${y},${w},${h}`
}
// 1 3 5 7
// 2 4 6 8
export function insertColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {

    const indexRow0 = col * table.adapter.rowCount
    const indexRow1 = indexRow0 + 1

    if (indexRow1 >= body.children.length) {
        throw Error(`Column ${col} does not exist in measure/staging. There are only ${body.children.length / table.adapter.colCount} columns.`)
    }

    const firstCellOfCol = body.children[indexRow0] as HTMLElement
    const x = px2float(firstCellOfCol.style.left)
    const y = px2float(firstCellOfCol.style.top)
    const w = px2float(firstCellOfCol.style.width)
    const h = px2float(firstCellOfCol.style.height)

    // console.log(`XXX ${table.adapter.rowCount}`)
    for (let i = 1; i < table.adapter.rowCount; ++i) {
        const otherCellInRow = body.children[indexRow0 + i] as HTMLElement
        const what = `${firstCellOfCol.innerText} vs ${otherCellInRow.innerText}`
        // console.log(firstCellOfCol.innerText)
        // console.log(firstCellOfCol.style.top)

        // console.log(otherCellInRow.innerText)
        // console.log(otherCellInRow.style.top)

        expect(otherCellInRow.style.left, `left of ${what}`).to.equal(firstCellOfCol.style.left)
        expect(otherCellInRow.style.width, `width of ${what}`).to.equal(firstCellOfCol.style.width)
    }
    let id = firstCellOfCol.innerText
    id = id.substring(0, id.indexOf('R'))
    return `${id}:${x},${y},${w},${h}`
}
export function testTableLayout() {
    const table = getTable()

    const horizontalCellPadding = 2
    const verticalCellPadding = 0
    const cellBorder = table.adapter.config.seamless ? 0 : 1
    const overlap = table.adapter.config.seamless ? 0 : 1

    const rowHeadCellInnerWidth =
        table.rowHeads === undefined ? 0 : px2float((table.rowHeads.children[0] as HTMLElement).style.width)
    const colHeadCellInnerHeight =
        table.colHeads === undefined ? 0 : px2float((table.colHeads.children[0] as HTMLElement).style.height)

    const cellDeltaInnerToOuterWidth = 2 * (horizontalCellPadding + cellBorder)
    const cellDeltaInnerToOuterHeight = 2 * (verticalCellPadding + cellBorder)

    const rowHeadCellOuterWidth =
        table.rowHeads === undefined ? 0 : rowHeadCellInnerWidth + cellDeltaInnerToOuterWidth
    const colHeadCellOuterHeight =
        table.colHeads === undefined ? 0 : colHeadCellInnerHeight + cellDeltaInnerToOuterHeight

    if (table.rowHeads !== undefined) {
        let expectTop = 0
        for (let rowHead of table.rowHeads.children) {
            const cell = rowHead as HTMLElement
            expect(expectTop).to.equal(px2float(cell.style.top))
            const height = px2float(cell.style.height) + cellDeltaInnerToOuterHeight
            expectTop += height - overlap
        }
    }

    if (table.colHeads !== undefined) {
        let expectLeft = 0
        for (let colHead of table.colHeads.children) {
            const cell = colHead as HTMLElement
            expect(expectLeft).to.equal(px2float(cell.style.left))
            const width = px2float(cell.style.width) + cellDeltaInnerToOuterWidth
            expectLeft += width - overlap
        }
    }

    // TODO: check header cell size
    // TODO: check body cell position and size

    const rowHeadContainerWidth =
        table.rowHeads === undefined ? 0 : px2float(table.rowHeads.style.width)
    expect(rowHeadContainerWidth, `row header container width`).to.equal(rowHeadCellOuterWidth)

    const colHeadContainerHeight =
        table.colHeads === undefined ? 0 : px2float(table.colHeads.style.height)
    expect(colHeadContainerHeight, `col header container height`).to.equal(colHeadCellOuterHeight)

    if (table.rowHeads) {
        if (table.colHeads) {
            expect(px2float(table.rowHeads.style.top), `row header container top`).to.equal(colHeadContainerHeight - overlap)
        } else {
            expect(px2float(table.rowHeads.style.top), `row header container top`).to.equal(0)
        }
        expect(px2float(table.rowHeads.style.bottom)).to.equal(0)
    }

    if (table.colHeads) {
        if (table.rowHeads) {
            expect(px2float(table.colHeads.style.left), `column header container left`).to.equal(rowHeadContainerWidth - overlap)
        } else {
            expect(px2float(table.colHeads.style.left), `column header container left`).to.equal(0)
        }
        expect(px2float(table.colHeads.style.right)).to.equal(0)
    }

    if (table.rowHeads) {
        expect(px2float(table.body.style.left), `body container left`).to.equal(rowHeadContainerWidth - overlap)
    } else {
        expect(px2float(table.body.style.left), `body container left`).to.equal(0)
    }
    if (table.colHeads) {
        expect(px2float(table.body.style.top), `body container top`).to.equal(colHeadContainerHeight - overlap)
    } else {
        expect(px2float(table.body.style.top), `body container top`).to.equal(0)
    }
}

// ========= OLD AND DEPRECATED CODE =========

export interface TestModel extends TableModel {
    showColumnHeaders: boolean
    showRowHeaders: boolean
    editMode: EditMode

    // these functions are to compare model and render
    getModelValueOf(col: number, row: number): string
    getCellValueOf(table: TableFriend, col: number, row: number): string
}

// this method checks if the layout of the table cells fits the expectations,
// especially after various insert/remove row/column operations
export function validateRender(model: TestModel, print: boolean = false) {

    // console.log(`validateRender: size ${adapter.colCount} x ${adapter.rowCount} = ${adapter.colCount * adapter.rowCount}`)

    const table = getTable()
    const adapter = table.adapter
    const body = table.body
    // console.log(`  body has length ${body.children.length}`)

    const expectCol: { x: number, w: number }[] = []
    let x = 0
    for (let col = 0; col < adapter.colCount; ++col) {
        const cell = body.children[col] as HTMLSpanElement
        const w = px2int(cell.style.width)
        expectCol.push({ x, w })
        // console.log(`expectCol[${col}] = {x: ${x}, w: ${w}}`)
        x += w + 6 - 1
        if (table.adapter.config.seamless) {
            --x
        }
    }

    const expectRow: { y: number, h: number }[] = []
    let y = 0
    for (let row = 0; row < adapter.rowCount; ++row) {
        const cell = body.children[row * adapter.colCount] as HTMLSpanElement
        const h = px2int(cell.style.height)
        expectRow.push({ y, h })
        // console.log(`expectRow[${row}] = {x: ${y}, w: ${h}}`)
        y += h + 2 - 1
        if (table.adapter.config.seamless) {
            --y
        }
    }

    if (print) {
        let idx0 = 0
        let txt = "cols (x,w): "
        for (let col = 0; col < adapter.colCount; ++col) {
            txt += `${expectCol[col].x},${expectCol[col].w} `
        }
        console.log(txt)

        txt = "rows (y,h): "
        for (let row = 0; row < adapter.rowCount; ++row) {
            txt += `${expectRow[row].y},${expectRow[row].h} `
        }
        console.log(txt)
        txt = ""

        for (let row = 0; row < adapter.rowCount; ++row) {
            for (let col = 0; col < adapter.colCount; ++col) {
                const cell = body.children[idx0++] as HTMLSpanElement
                txt = `${txt}[${col},${row}]='${cell.textContent}' (${px2float(cell.style.left)},${px2float(cell.style.top)},${px2float(cell.style.width)},${px2float(cell.style.height)}):(${expectCol[col].x},${expectRow[row].y},${expectCol[col].w},${expectRow[row].h} )  `
            }
            console.log(txt)
            txt = ""
        }
    }

    if (model.showColumnHeaders) {
        const colHeads = table.colHeads!
        const colHandles = table.colResizeHandles!
        expect(colHeads.children.length).to.equal(adapter.colCount + 1)
        expect(colHandles.children.length).to.equal(adapter.colCount + 1)
        const height = px2int((colHeads.children[0] as HTMLSpanElement).style.height)
        for (let col = 0; col < adapter.colCount; ++col) {
            const rowHeader = colHeads.children[col] as HTMLSpanElement
            expect(rowHeader.innerText, `column header ${col}`).to.equal((table.adapter.getColumnHead(col) as Text).data)
            expect(px2int(rowHeader.style.left), `column header ${col} left`).to.equal(expectCol[col].x)
            expect(px2int(rowHeader.style.width), `column header ${col} width`).to.equal(expectCol[col].w)
            expect(px2int(rowHeader.style.top), `column header ${col} top`).to.equal(0)
            expect(px2int(rowHeader.style.height), `column header ${col} height`).to.equal(height)

            const rowHandle = colHandles.children[col] as HTMLSpanElement
            expect(rowHandle.dataset["idx"], `row handle ${col} index`).to.equal(`${col}`)
            if (col + 1 < adapter.colCount) {
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
        expect(rowHeads.children.length).to.equal(adapter.rowCount + 1)
        expect(rowHandles.children.length).to.equal(adapter.rowCount + 1)
        const width = px2int((rowHeads.children[0] as HTMLSpanElement).style.width)
        for (let row = 0; row < adapter.rowCount; ++row) {
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
            if (row + 1 < adapter.rowCount) {
                expect(px2int(colHandle.style.top), `column handle ${row} top`).to.equal(expectRow[row + 1].y - 3)
            } else {
                expect(px2int(colHandle.style.top), `column handle last top`).to.equal(expectRow[row].y + expectRow[row].h - 2)
            }
            expect(px2int(colHandle.style.height), `column handle ${row} height`).to.equal(5)
        }
    }

    expect(body.children.length).to.equal(table.adapter.colCount * table.adapter.rowCount)

    // console.log(`model size = ${model.colCount}, ${model.rowCount}, adapter size = ${table.adapter.colCount}, ${table.adapter.rowCount}`)

    for (let row = 0; row < adapter.rowCount; ++row) {
        for (let col = 0; col < adapter.colCount; ++col) {
            const idx = col + row * adapter.colCount
            const cell = body.children[idx] as HTMLSpanElement

            // console.log(`CELL ${col},${row}, IDX ${idx}`)
            // console.log(cell)

            expect(model.getCellValueOf(table, col, row)).to.equal(model.getModelValueOf(col, row))
            expect(px2int(cell.style.left), `[${col},${row}] left`).to.equal((expectCol[col].x))
            expect(px2int(cell.style.width), `[${col},${row}] width`).to.equal((expectCol[col].w))
            expect(px2int(cell.style.top), `[${col},${row}] top`).to.equal((expectRow[row].y))
            expect(px2int(cell.style.height), `[${col},${row}] height`).to.equal((expectRow[row].h))
        }
    }
}
