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
import { AnimationBase } from '@toad/util/animation'

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms" // OBSOLETE
        Table.maskColor = `rgba(0,0,128,0.3)`
        Table.splitColor = `rgba(255,128,0,0.5)`
        AnimationBase.animationFrameCount = 1
        Animator.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("test support for expected final table layouts", function () {
        describe("insert", function () {
            it("48, 72", async function () {
                const model = await prepareByColumns([
                    new Measure(1, 48),
                    new Measure(2, 72)
                ])
                check48_12()
            })
            it("48, 72, 32, 64", async function () {
                const model = await prepareByColumns([
                    new Measure(1, 48),
                    new Measure(2, 72),
                    new Measure(3, 32),
                    new Measure(4, 64)
                ])
                check48_72_32_64()
            })
            it("32, 48, 72, 64", async function () {
                const model = await prepareByColumns([
                    new Measure(1, 32),
                    new Measure(2, 48),
                    new Measure(3, 72),
                    new Measure(4, 64)
                ])
                check32_48_72_64()
            })
            it("32, 64, 48, 72", async function () {
                const model = await prepareByColumns([
                    new Measure(1, 32),
                    new Measure(2, 64),
                    new Measure(3, 48),
                    new Measure(4, 72)
                ])
                check32_64_48_72()
            })
        })
        describe("remove", function () {
            it("32, 64", async function () {
                const model = await prepareByColumns([
                    new Measure(1, 32),
                    new Measure(2, 64)
                ])
                check32_64()
            })
        })
    })
    function check48_12() {
        expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
        expect(bodyColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
    }
    function check48_72_32_64() {
        expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
        expect(bodyColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
        expect(bodyColInfo(2)).to.equal(`#3:${48 + 72 + 2 * 5},0,32,18`)
        expect(bodyColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * 5},0,64,18`)
    }
    function check32_48_72_64() {
        expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
        expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
        expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * 5},0,72,18`)
        expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * 5},0,64,18`)
    }
    function check32_64_48_72() {
        expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
        expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
        expect(bodyColInfo(2)).to.equal(`#3:${32 + 64 + 2 * 5},0,48,18`)
        expect(bodyColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * 5},0,72,18`)
    }
    function check32_64() {

    }

    // TODO
    // [ ] colors for mask and staging
    // [ ] alignment in makehuman.js
    // [ ] table colors
    // [ ] with headers
    describe("row", function () {
        describe("insert", function () {
            describe("no headers", function () {
                it("two rows into empty", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([])

                    const table = getTable()

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48).toCells(),
                        new Measure(2, 72).toCells()
                    ]))

                    expect(model.asArray().length).to.equal(4)

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.staging.children[0].innerHTML).to.equal("#1R0")
                    expect(table.staging.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.staging.children[2].innerHTML).to.equal("#2R0")
                    expect(table.staging.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:${0},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 5 + 72 + 4 - 1)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(48 + 5 + 72 + 5 - 2) // FIXME -2?
                    expect(splitBodyX()).to.equal(48 + 5 + 72 + 5 - 2) // FIXME -2??

                    animation.lastFrame()
                    check48_12()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two cols at head", async function () {
                    // WHEN we have a table with two rows 
                    const model = await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()

                    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:37,0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two columns
                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48).toCells(),
                        new Measure(2, 72).toCells()
                    ]))
                    // return
                    // model.asArray().forEach( (value, index) => console.log(`model[${index}] = id(col):${value.id}, idx(row)=${value.idx}, size=${value.size}`))

                    // CHECKPOINT: MODEL IS CORRECT

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // // THEN then two columns have been measured.
                    expect(table.measure.children.length).to.equal(4)
                    // for (let i = 0; i < table.measure.children.length; ++i) {
                    //     const cell = table.measure.children[i] as HTMLSpanElement
                    //     console.log(`measure[${i}] = ${cell.innerHTML}, ${cell.style.width}`)
                    // }

                    // the new columns are layed out per column
                    // 1st column
                    expect(table.measure.children[0].innerHTML).to.equal("#1R0")
                    expect(table.measure.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.measure.children[2].innerHTML).to.equal("#2R0")
                    expect(table.measure.children[3].innerHTML).to.equal("#2R1")

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.staging.children[0].innerHTML).to.equal("#1R0")
                    expect(table.staging.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.staging.children[2].innerHTML).to.equal("#2R0")
                    expect(table.staging.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 5 + 72 + 4 - 1)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColInfo(1)).to.equal(`#4:37,0,64,18`)
                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(32 + 5 + 64 + 5)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskX()).to.equal(128)
                    expect(splitBodyX()).to.equal(128)

                    animation.lastFrame()
                    check48_72_32_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two rows at middle", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:37,0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(1, flatMapColumns([
                        new Measure(2, 48).toCells(),
                        new Measure(3, 72).toCells()
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.staging.children[0].innerHTML).to.equal("#2R0")
                    expect(table.staging.children[1].innerHTML).to.equal("#2R1")
                    // 2nd column
                    expect(table.staging.children[2].innerHTML).to.equal("#3R0")
                    expect(table.staging.children[3].innerHTML).to.equal("#3R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#2:37,0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${37 + 48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + 5)
                    expect(maskW()).to.equal(48 + 5 + 72 + 4 - 1)

                    // WHEN we split the table for the animation
                    // return
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + 5)
                    expect(splitBodyW()).to.equal(64 + 5)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(32 + 5 + 48 + 5 + 72 + 5 - 2) // FIXME -2?
                    expect(splitBodyX()).to.equal(32 + 5 + 48 + 5 + 72 + 5 - 2) // FIXME -2??

                    animation.lastFrame()
                    check32_48_72_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])

                    const table = getTable()

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:37,0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(2, flatMapColumns([
                        new Measure(3, 48).toCells(),
                        new Measure(4, 72).toCells()
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.staging.children[0].innerHTML).to.equal("#3R0")
                    expect(table.staging.children[1].innerHTML).to.equal("#3R1")
                    // 2nd column
                    expect(table.staging.children[2].innerHTML).to.equal("#4R0")
                    expect(table.staging.children[3].innerHTML).to.equal("#4R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#3:${32 + 5 + 64 + 5},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#4:${32 + 5 + 64 + 5 + 48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + 5 + 64 + 5)
                    expect(maskW()).to.equal(48 + 5 + 72 + 4 - 1)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(32 + 5 + 64 + 5)
                    expect(splitBodyW()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(32 + 5 + 48 + 5 + 72 + 5 + 64 + 5 - 2) // FIXME -2?
                    expect(splitBodyX()).to.equal(32 + 5 + 48 + 5 + 72 + 5 + 64 + 5 - 2) // FIXME -2??

                    animation.lastFrame()
                    check32_64_48_72()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                describe("column width", function () {
                    it("keep initial")
                    it("extend")
                    it("shrink")
                })
                it("seamless (two rows at middle)")
            })
            describe("remove", function () {
                describe("no headers", function () {
                    it("all rows")
                    it("two rows at head", async function () {
                        // WHEN we have a table without headings
                        const model = await prepareByColumns([
                            new Measure(1, 48),
                            new Measure(2, 72),
                            new Measure(3, 32),
                            new Measure(4, 64)
                        ])

                        const table = getTable()

                        expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
                        expect(bodyColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
                        expect(bodyColInfo(2)).to.equal(`#3:${48 + 72 + 2 * 5},0,32,18`)
                        expect(bodyColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * 5},0,64,18`)
                        expect(table.body.children).to.have.lengthOf(8)

                        // ...at the head remove two rows
                        model.removeColumn(0, 2)

                        const animation = RemoveColumnAnimation.current!
                        // expect(animation.initialWidth, "initialHeight").to.equal(initialHeight)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeColumnsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingColInfo(0)).to.equal(`#1:0,0,48,18`)
                        expect(stagingColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                        expect(bodyColInfo(0)).to.equal(`#3:${48 + 72 + 2 * 5},0,32,18`)
                        expect(bodyColInfo(1)).to.equal(`#4:${48 + 72 + 32 + 3 * 5},0,64,18`)

                        // ...and there is a mask at the end of staging?
                        expect(maskX(), "maskX before animation").to.equal(48 + 72 + 2 * 5)
                        expect(maskW(), "maskW before animation").to.equal(48 + 72 + 2 * 5)

                        // WHEN we split the table for the animation
                        animation.splitVertical()
                        expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                        expect(splitColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)

                        // THEN splitbody
                        expect(splitBodyX()).to.equal(48 + 72 + 2 * 5)
                        expect(splitBodyW()).to.equal(32 + 64 + 2 * 5)

                        // WHEN we animate
                        animation.animationFrame(1)

                        expect(splitBodyX(), "splitBodyY after animation").to.equal(0)
                        expect(maskX(), "maskY after animation").to.equal(0)

                        animation.joinVertical()
                        expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                        expect(bodyColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)
                        expect(table.body.children).to.have.lengthOf(4)

                        check32_64()
                    })
                    it("two rows at middle", async function () {
                        // WHEN we have a table without headings
                        const model = await prepareByColumns([
                            new Measure(1, 32),
                            new Measure(2, 48),
                            new Measure(3, 72),
                            new Measure(4, 64)
                        ])
                        const table = getTable()

                        expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                        expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
                        expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * 5},0,72,18`)
                        expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * 5},0,64,18`)

                        expect(table.body.children).to.have.lengthOf(8)

                        // ...at the head insert two rows

                        // AnimationBase.animationFrameCount = 6000
                        // Animator.halt = false

                        model.removeColumn(1, 2)

                        // return

                        const animation = RemoveColumnAnimation.current!

                        // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeColumnsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingColInfo(0)).to.equal(`#2:${32 + 5},0,48,18`)
                        expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * 5},0,72,18`)

                        // ...and are hidden by a mask
                        expect(maskX(), "maskY before animation").to.equal(32 + 48 + 72 + 3 * 5)
                        expect(maskW(), "maskH before animation").to.equal(48 + 72 + 2 * 5)

                        // WHEN we split the table for the animation
                        animation.splitVertical()

                        // THEN splitbody
                        expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * 5)
                        expect(splitBodyW()).to.equal(64 + 5)
                        expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)

                        // WHEN we animate
                        animation.animationFrame(1)

                        expect(splitBodyX(), "splitBodyY after animation").to.equal(32 + 5)
                        expect(maskX(), "maskY after animation").to.equal(32 + 5)

                        animation.joinVertical()

                        check32_64()
                    })
                    it("two rows at end", async function () {
                        // WHEN we have an empty table without headings
                        const model = await prepareByColumns([
                            new Measure(1, 32),
                            new Measure(2, 64),
                            new Measure(3, 48),
                            new Measure(4, 72)
                        ])
                        const table = getTable()

                        expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                        expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
                        expect(bodyColInfo(2)).to.equal(`#3:${32 + 64 + 2 * 5},0,48,18`)
                        expect(bodyColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * 5},0,72,18`)
                        expect(table.body.children).to.have.lengthOf(8)

                        // ...at the head insert two rows

                        // AnimationBase.animationFrameCount = 6000
                        // Animator.halt = false

                        model.removeColumn(2, 2)

                        // return

                        const animation = RemoveColumnAnimation.current!

                        // WHEN ask for the new rows to be placed
                        animation.arrangeColumnsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingColInfo(0)).to.equal(`#3:${32 + 64 + 2 * 5},0,48,18`)
                        expect(stagingColInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * 5},0,72,18`)

                        // we expect the mask right of the table, and the splitBody covering the last two columns (so it include staging)

                        // ...and are hidden by a mask
                        expect(maskX()).to.equal(32 + 64 + 48 + 72 + 4 * 5)
                        expect(maskW()).to.equal(48 + 72 + 2 * 5)

                        // WHEN we split the table for the animation
                        animation.splitVertical()

                        // THEN splitbody (the splitbody must meet the mask, height doesn't matter)
                        expect(splitBodyX()).to.equal(32 + 64 + 2 * 5)
                        expect(splitBodyW()).to.equal(48 + 72 + 2 * 5)

                        // WHEN we animate
                        animation.animationFrame(1)
                        expect(splitBodyX(), "splitBodyX after animation").to.equal(-24)
                        expect(maskX(), "maskX after animation").to.equal(106)

                        animation.joinVertical()
                        check32_64()
                    })
                    it("seamless (two rows at middle)")
                })
            })
        })
        describe("other", function () {
            it("staging follows scrolled body")
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
        // console.log(data)
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
    override getRowHead(row: number): Node | undefined {
        return undefined
    }
    override getColumnHead(col: number): Node | undefined {
        return undefined
    }
    getColumnHeads() {
        // return ["id", "height"]
        return undefined
    }
    getRow(row: Measure): Reference<Measure>[] {
        throw Error("yikes")
        // return refs(row, "id", "height")
    }
    override get rowCount(): number {
        return 2
    }
    override get colCount(): number {
        return this.model?.colCount ?? 0
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
function splitBodyX() {
    const table = getTable()
    return px2float(table.splitBody.style.left)
}
function splitBodyW() {
    const table = getTable()
    return px2float(table.splitBody.style.width)
}
function maskX() {
    const table = getTable()
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.left)
}
function maskW() {
    const table = getTable()
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.width)
}
function bodyColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.body)
}
function splitColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.splitBody)
}
function stagingColInfo(col: number) {
    const table = getTable()
    return bodyColInfoCore(col, table, table.staging)
}
function stagingInsertColInfo(col: number) {
    const table = getTable()
    return insertColInfoCore(col, table, table.staging)
}
function bodyColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {
    if (col >= table.adapter.model.colCount) {
        throw Error(`Column ${col} does not exist. There are only ${body.children.length / table.adapter.colCount}.`)
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
    id = id.substring(0, id.indexOf('R'))
    return `${id}:${x},${y},${w},${h}`
}

function insertColInfoCore(col: number, table: TableFriend, body: HTMLDivElement) {

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

    // console.log(`preparationColInfoCore(${col}): rowCount=${table.adapter.rowCount}, indexRow0=${indexRow0}, innerText=${firstCellOfCol.innerText}`)

    // for (let i = 1; i < table.adapter.colCount; ++i) {
    //     const otherCellInRow = body.children[indexOf1stCellInCol + i] as HTMLElement
    //     expect(otherCellInRow.style.top).to.equal(firstCellOfRow.style.top)
    //     expect(otherCellInRow.style.height).to.equal(firstCellOfRow.style.height)
    // }
    let id = firstCellOfCol.innerText
    id = id.substring(0, id.indexOf('R'))
    return `${id}:${x},${y},${w},${h}`
}