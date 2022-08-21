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
import { InsertRowAnimation } from '@toad/table/private/InsertRowAnimation'
import { RemoveRowAnimation } from '@toad/table/private/RemoveRowAnimation'
import { TableFriend } from '@toad/table/private/TableFriend'
import { GridTableModel } from '@toad/table/model/GridTableModel'
import { GridAdapter } from '@toad/table/adapter/GridAdapter'

// FIXME: don't use enum in OO code
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
        return `#${this.id}C${this.idx}`
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
                break
            case 1:
                if (data.size !== undefined) {
                    this.setCellSize(cell, data.size!!)
                }
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

async function prepare(data: Measure[], props?: PrepareProps) {
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
                // it("fun", function() {
                //     console.log(flatMapColumns([
                //         [1, 3, 5],
                //         [2, 4, 6]
                //     ]))
                //     console.log(flatMapRows([
                //         [1, 2, 3],
                //         [4, 5 ,6]
                //     ]))
                // })
                it("two rows into empty")
                it.only("two cols at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])

                    // test the model!!!

                    const table = getTable()

                    // expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    // expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // into
                    // 3,0  4,0
                    // 3,1  4,1

                    // insert
                    // 1,0     3,0 4,0    0
                    //         3,1 4,1

                    // 1,0     3,0 4,0    3
                    // 1,1     3,1 4,1

                    // 1,0 2,0 3,0 4,0    1
                    // 1,1     4,1 4,1

                    // 1,0 2,0 3,0 4,0    5
                    // 1,1 2,1 4,1 4,1

                    // idxOut: 0 

                    // 1,0  2,0  3,0  4,0
                    // 1,1  2,1  3,0  4,0

                    const ins = flatMapColumns([
                        new Measure(1, 48).toCells(),
                        new Measure(2, 72).toCells()
                    ])
                    console.log(ins)
              
                    // // ...at the head insert two rows
                    model.insertColumn(0, ins)
                    console.log(model)

                    // // ...and ask for the new cells to be measured
                    // const animation = InsertRowAnimation.current!
                    // animation.prepareCellsToBeMeasured()
                    // await sleep()

                    // // THEN then two cells have been measured.
                    // expect(table.measure.children.length).to.equal(4)

                    // // WHEN ask for the new rows to be placed
                    // animation.arrangeNewRowsInStaging()

                    // // THEN they have been placed in staging
                    // expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    // expect(stagingRowInfo(1)).to.equal(`#2:0,49,80,72`)

                    // // ...and are hidden by a mask
                    // const insertHeight = 48 + 72 + 4 - 1
                    // expect(maskY()).to.equal(0)
                    // expect(maskH()).to.equal(insertHeight)

                    // // WHEN we split the table for the animation
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