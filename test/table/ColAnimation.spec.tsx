import { expect } from '@esm-bundle/chai'
import { Animator, Reference, unbind } from "@toad"
import { Table } from '@toad/table/Table'
import { TablePos } from "@toad/table/TablePos"
import { ArrayTableModel } from "@toad/table/model/ArrayTableModel"
import { TableAdapter, TableAdapterConfig } from '@toad/table/adapter/TableAdapter'
import { ArrayAdapter } from '@toad/table/adapter/ArrayAdapter'
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { sleep, px2float } from "../testlib"
import { InsertColumnAnimation } from '@toad/table/private/InsertColumnAnimation'
import { RemoveColumnAnimation } from '@toad/table/private/RemoveColumnAnimation'
import { TableFriend } from '@toad/table/private/TableFriend'
import { GridTableModel } from '@toad/table/model/GridTableModel'
import { GridAdapter } from '@toad/table/adapter/GridAdapter'


describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        Animator.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    // TODO
    // [ ] colors for mask and staging
    // [ ] alignment in makehuman.js
    // [ ] table colors
    // [ ] with headers
    describe("row", function () {
        describe("insert", function () {
            describe("no headers", function () {
                it("two rows into empty")
                it.only("two cols at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()

                    // expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    // expect(bodyColInfo(1)).to.equal(`#4:37,0,64,18`)
              
                    // // ...at the head insert two columns
                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48).toCells(),
                        new Measure(2, 72).toCells()
                    ]))
                    model.asArray().forEach( (value, index) => console.log(`model[${index}] = id(col):${value.id}, idx(row)=${value.idx}, size=${value.size}`))
                    
                    // CHECKPOINT: MODEL IS CORRECT

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // // THEN then two columns have been measured.
                    expect(table.measure.children.length).to.equal(4)
                    for(let i=0; i<table.measure.children.length; ++i) {
                        const cell = table.measure.children[i] as HTMLSpanElement
                        console.log(`measure[${i}] = ${cell.innerHTML}, ${cell.style.width}`)
                    }

                    // the new columns are layed out per column
                    // 1st column
                    expect(table.measure.children[0].innerHTML).to.equal("#1R0")
                    expect(table.measure.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.measure.children[2].innerHTML).to.equal("#2R0")
                    expect(table.measure.children[3].innerHTML).to.equal("#2R1")

                    // // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.staging.children[0].innerHTML).to.equal("#1R0")
                    expect(table.staging.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.staging.children[2].innerHTML).to.equal("#2R0")
                    expect(table.staging.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging

                    console.log(stagingColInfo(0))
                    console.log(stagingColInfo(1))

                    expect(stagingColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#2:52,0,72,18`)

                    // // ...and are hidden by a mask
                    // const insertHeight = 48 + 72 + 4 - 1
                    // expect(maskY()).to.equal(0)
                    // expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    // animation.splitHorizontal()
                    // expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    // expect(splitRowInfo(1)).to.equal(`#4:0,33,80,64`)
                    // // THEN splitbody
                    // expect(splitBodyY()).to.equal(0)
                    // expect(splitBodyH()).to.equal(32 + 64 + 4 - 1)

                    // // WHEN we animate
                    // animation.animationFrame(1)

                    // expect(maskY()).to.equal(insertHeight - 1)
                    // expect(splitBodyY()).to.equal(insertHeight - 1)

                    // animation.joinHorizontal()
                    // expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    // expect(bodyRowInfo(1)).to.equal(`#2:0,49,80,72`)
                    // expect(bodyRowInfo(2)).to.equal(`#3:0,122,80,32`)
                    // expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
                    // expect(table.body.children).to.have.lengthOf(8)
                })
            })
        })
    })
})
function getTable() {
    return new TableFriend(
        document.querySelector("tx-table") as Table
    )
}

enum Orientation {
    HORIZONTAL, VERTICAL
}

class Cell {
    id: number
    idx: number
    size?: number

    constructor(id?: number, idx?: number, size?: number) {
        this.id = id ?? 0
        this.idx = idx ?? 0
        this.size = size
    }
    valueOf(): string {
        // return `#${this.id}C${this.idx}`
        return `#${this.id}R${this.idx}`
    }
}

class Measure {
    id: number
    size: number
    constructor(id?: number, size?: number) {
        this.id = id !== undefined ? id : 0
        this.size = size !== undefined ? size : 0
    }
    toCells() {
        return [
            new Cell(this.id, 0, this.size),
            new Cell(this.id, 1, undefined)
        ]
    }
}

class MeasureModel extends GridTableModel<Cell> {
    orientation = Orientation.VERTICAL
    config = new TableAdapterConfig()
    constructor(nodeClass: new () => Cell, cols: number, rows: number, data?: Cell[]) {
        super(nodeClass, cols, rows, data)
        console.log(data)
        // const size = cols * rows
        // for (let idx = 0; idx < size; ++idx) {
        //     this._data[idx].text = `IDX${idx}`
        // }
    }
    // get colCount(): number {
    //     throw new Error('Method not implemented.')
    // }
    insertMeasure(row: number, rowData: Array<Measure>): number {
        // switch (this.orientation) {
        //     case MeasureOrientation.HORIZONTAL:
        //         break
        //     case MeasureOrientation.VERTICAL: {
        //         this.insertColumn(
        //             row,
        //             rowData.map((measure, index) => new Cell(`#${measure.id}C${index})`, measure.width, measure.height))
        //         )
        //     } break

        // }
        return 0
    }
}

class MeasureAdapter extends GridAdapter<MeasureModel> {
    constructor(model: MeasureModel) {
        super(model)
        this.config = model.config
    }
    getColumnHeads() {
        // return ["id", "height"]
        return undefined
    }
    getRow(row: Measure): Reference<Measure>[] {
        throw Error("yikes")
        // return refs(row, "id", "height")
    }
    override get colCount(): number {
        return 2
    }

    setCellSize(cell: HTMLElement, size: number) {
        switch (this.model!!.orientation) {
            case Orientation.HORIZONTAL:
                cell.style.height = `${size}px`
                break
            case Orientation.VERTICAL:
                cell.style.width = `${size}px`
                break
        }
    }

    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        // const row = this.model!.data[pos.row]
        const data = this.model!!.getCell(pos.col, pos.row)
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
                console.log(`MeasureAdapter.showCell(${pos.col}, ${pos.row}) => size ${cell.style.width} x ${cell.style.height}`)
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

interface PrepareProps {
    seamless?: boolean
    expandColumn?: boolean
    width?: number
    height?: number
}

function flatMapColumns<T>(data: T[][]): T[] {
    let result: T[] = []
    if (data.length === 0)
        return result
    const rows = data[0].length
    for (let i = 0; i < rows; ++i) {
        result = result.concat(data.flatMap(it => it[i]))
    }
    return result
}

function flatMapRows<T>(data: T[][]): T[] {
    return data.flatMap(it => it)
}

async function prepareByColumns(data: Measure[], props?: PrepareProps) {
    TableAdapter.register(MeasureAdapter, MeasureModel, Cell) // FIXME:  should also work without specifiyng MeasureRow as 3rd arg
    const model = new MeasureModel(Cell, data.length, 2, flatMapColumns(data.map(it => it.toCells())))
    model.config.seamless = (props?.seamless) === true
    model.config.expandColumn = (props?.expandColumn) === true
    document.body.replaceChildren(<Table style={{
        width: `${props?.width ?? 720}px`,
        height: `${props?.height ?? 350}px`
    }} model={model} />)
    await sleep()
    return model
}


function bodyColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.body)
}
function stagingColInfo(col: number) {
    const table = getTable()
    return preparationColInfoCore(col, table, table.staging)
}
function bodyColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {
    if (col >= table.adapter.colCount) {
        throw Error(`Row ${col} does not exist. There are only ${body.children.length / table.adapter.colCount}.`)
    }
    const firstCellOfCol = body.children[col] as HTMLElement
    const x = px2float(firstCellOfCol.style.left)
    const y = px2float(firstCellOfCol.style.top)
    const w = px2float(firstCellOfCol.style.width)
    const h = px2float(firstCellOfCol.style.height)

    // for (let i = 1; i < table.adapter.colCount; ++i) {
    //     const otherCellInRow = body.children[indexOf1stCellInCol + i] as HTMLElement
    //     expect(otherCellInRow.style.top).to.equal(firstCellOfRow.style.top)
    //     expect(otherCellInRow.style.height).to.equal(firstCellOfRow.style.height)
    // }
    let id = firstCellOfCol.innerText
    id = id.substring(0, id.indexOf('C'))
    return `${id}:${x},${y},${w},${h}`
}

function preparationColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {

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

    console.log(`preparationColInfoCore(${col}): rowCount=${table.adapter.rowCount}, indexRow0=${indexRow0}, innerText=${firstCellOfCol.innerText}`)

    // for (let i = 1; i < table.adapter.colCount; ++i) {
    //     const otherCellInRow = body.children[indexOf1stCellInCol + i] as HTMLElement
    //     expect(otherCellInRow.style.top).to.equal(firstCellOfRow.style.top)
    //     expect(otherCellInRow.style.height).to.equal(firstCellOfRow.style.height)
    // }
    let id = firstCellOfCol.innerText
    id = id.substring(0, id.indexOf('R'))
    return `${id}:${x},${y},${w},${h}`
}