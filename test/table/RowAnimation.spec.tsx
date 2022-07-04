import { expect } from '@esm-bundle/chai'
import { Reference, unbind } from "@toad"
import { Table } from '@toad/table/Table'
import { TablePos } from "@toad/table/TablePos"
import { ArrayModel } from "@toad/table/model/ArrayModel"
import { ArrayTableModel } from "@toad/table/model/ArrayTableModel"
import { TableAdapter } from '@toad/table/adapter/TableAdapter'
import { ArrayAdapter } from '@toad/table/adapter/ArrayAdapter'
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { sleep, px2float } from "../testlib"
import { InsertRowAnimation } from '@toad/table/private/InsertRowAnimation'
import { RemoveRowAnimation } from '@toad/table/private/RemoveRowAnimation'
import { TableFriend } from '@toad/table/private/TableFriend'

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        InsertRowAnimation.halt = true
        RemoveRowAnimation.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    // TODO
    // [ ] headers
    //   [ ] with row headers
    //   [ ] with column headers
    //   [ ] with row and column headers
    // [ ] table body has been scrolled (mask, etc. need to be place properly)
    // [ ] fast forward animation (aka. stop())
    // ...
    describe("row", function () {
        describe("insert", function () {
            describe("no headers", function () {
                it("two rows into empty", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([])
                    const table = getTable()

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
                    expect(splitBodyH()).to.equal(1)

                    // WHEN we animate
                    animation.animate()

                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two rows at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new MeasureRow(3, 32),
                        new MeasureRow(4, 64)
                    ])
                    const table = getTable()

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

                    expect(maskY()).to.equal(insertHeight - 1)
                    expect(splitBodyY()).to.equal(insertHeight - 1)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,49,80,72`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,122,80,32`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
                    expect(table.body.children).to.have.lengthOf(8)
                })
                it.only("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new MeasureRow(1, 32),
                        new MeasureRow(4, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(1, [
                        new MeasureRow(2, 48),
                        new MeasureRow(3, 72)
                    ])
                    return

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
                    // THEN splitbody
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(33)
                    expect(splitBodyH()).to.equal(64 + 2)

                    // WHEN we animate
                    animation.animate()

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,48`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,82,80,72`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new MeasureRow(1, 32),
                        new MeasureRow(2, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(2, [
                        new MeasureRow(3, 48),
                        new MeasureRow(4, 72)
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
                    expect(stagingRowInfo(0)).to.equal(`#3:0,98,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#4:0,147,80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(maskY()).to.equal(98)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitBodyY()).to.equal(98)
                    expect(splitBodyH()).to.equal(1)

                    // WHEN we animate
                    animation.animate()

                    expect(maskY()).to.equal(98 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(98 + insertHeight - 1)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,98,80,48`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,147,80,72`)
                    expect(table.body.children).to.have.lengthOf(8)
                })
            })
        })
        describe("remove", function () {
            describe("no headers", function () {
                it("all rows", async function() {
                    // WHEN we have a table without headings
                    const model = await prepare([
                        new MeasureRow(1, 32),
                        new MeasureRow(2, 64)
                    ])
                    const table = getTable()

                    //   initial       initialHeight
                    // y0 ┏━━━ 1 ━━━┓ ┐ ┐
                    //    ┃    32   ┃ │ │
                    // y1 ┣━━━ 1 ━━━┫ │ │ removeHeight & splitBody
                    //    ┃    64   ┃ │ │
                    //    ┗━━━ 1 ━━━┛ ┘ ┘
                    const border = 1
                    const y0 = 0
                    const y1 = border + 32
                    const initialHeight = y1 + border + 64 + border
                    const removeHeight = initialHeight
                    // the split body has a border on top and bottom
                    const splitY0 = 0
                    const splitH0 = initialHeight
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    const maskY0 = initialHeight
                    const maskH0 = initialHeight

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(table.body.children).to.have.lengthOf(4)

                    // ...remote all rows
                    model.removeRow(0, 2)

                    const animation = RemoveRowAnimation.current!
                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(table.body.children).to.have.lengthOf(0)

                    // ...and there is a mask at the end of staging?
                    expect(maskY()).to.equal(maskY0)
                    expect(maskH()).to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    expect(table.splitBody.children).has.length(0)

                    // THEN splitbody
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animate()

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    expect(table.body.children).to.have.lengthOf(0)
                })
                it("two rows at head", async function () {
                    // WHEN we have a table without headings
                    const model = await prepare([
                        new MeasureRow(1, 48),
                        new MeasureRow(2, 72),
                        new MeasureRow(3, 32),
                        new MeasureRow(4, 64)
                    ])
                    const table = getTable()

                    //   initial       initialHeight
                    // y0 ┏━━━ 1 ━━━┓ ┐ ┐
                    //    ┃    48   ┃ │ │
                    // y1 ┣━━━ 1 ━━━┫ │ │ removeHeight 
                    //    ┃    72   ┃ │ ┘
                    // y2 ┣━━━ 1 ━━━┫ │ ┐
                    //    ┃    32   ┃ │ │
                    // y3 ┣━━━ 1 ━━━┫ │ │ splitBody
                    //    ┃    64   ┃ │ │ 
                    //    ┗━━━ 1 ━━━┛ ┘ ┘
                    const border = 1
                    const y0 = 0
                    const y1 = border + 48
                    const y2 = y1 + border + 72
                    const y3 = y2 + border + 32
                    const initialHeight = y3 + border + 64 + border
                    const removeHeight = border + 48 + border + 72
                    // the split body has a border on top and bottom
                    const splitY0 = y2
                    const splitH0 = border + 32 + border + 64 + border
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    const maskY0 = y2
                    const maskH0 = removeHeight

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,48`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,72`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,32`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,64`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head remove two rows
                    model.removeRow(0, 2)

                    const animation = RemoveRowAnimation.current!
                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,49,80,72`)

                    expect(bodyRowInfo(0)).to.equal(`#3:0,122,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,155,80,64`)

                    // ...and there is a mask at the end of staging?
                    expect(maskY(), "maskY before animation").to.equal(maskY0)
                    expect(maskH(), "maskH before animation").to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(splitRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // THEN splitbody
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animate()

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two rows at middle", async function () {
                    // Table.transitionDuration = "5000ms"
                    // InsertRowAnimation.halt = false

                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new MeasureRow(1, 32),
                        new MeasureRow(2, 48),
                        new MeasureRow(3, 72),
                        new MeasureRow(4, 64)
                    ])
                    const table = getTable()

                    //   initial
                    // y0 ┏━━━ 1 ━━━┓ ┐
                    //    ┃    32   ┃ │ initialHeight
                    // y1 ┣━━━ 1 ━━━┫ │ ┐ removeHeight 
                    //    ┃    48   ┃ │ │
                    // y2 ┣━━━ 1 ━━━┫ │ │
                    //    ┃    72   ┃ │ ┘
                    // y3 ┣━━━ 1 ━━━┫ │ ┐
                    //    ┃    64   ┃ │ │ splitBody
                    //    ┗━━━ 1 ━━━┛ ┘ ┘
                    const border = 1
                    const y0 = 0
                    const y1 = border + 32
                    const y2 = y1 + border + 48
                    const y3 = y2 + border + 72
                    const initialHeight = y3 + border + 64 + border
                    const removeHeight = border + 48 + border + 72
                    // the split body has a border on top and bottom
                    const splitY0 = y3
                    const splitH0 = border + 64 + border
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    const maskY0 = y3
                    const maskH0 = removeHeight

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,48`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,72`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,64`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows
                    model.removeRow(1, 2)

                    const animation = RemoveRowAnimation.current!

                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#2:0,${y1},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,${y2},80,72`)

                    // ...and are hidden by a mask
                    expect(maskY(), "maskY before animation").to.equal(maskY0)
                    expect(maskH(), "maskH before animation").to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)

                    // WHEN we animate
                    // RemoveRowAnimation.halt = false
                    animation.animate()

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepare([
                        new MeasureRow(1, 32),
                        new MeasureRow(2, 64),
                        new MeasureRow(3, 48),
                        new MeasureRow(4, 72)
                    ])
                    const table = getTable()

                    //   initial
                    // y0 ┏━━━ 1 ━━━┓ ┐
                    //    ┃    32   ┃ │ initialHeight
                    // y1 ┣━━━ 1 ━━━┫ │  
                    //    ┃    64   ┃ │ 
                    // y2 ┣━━━ 1 ━━━┫ │ ┐ removeHeight
                    //    ┃    48   ┃ │ │
                    // y3 ┣━━━ 1 ━━━┫ │ │
                    //    ┃    72   ┃ │ ┘ 
                    //    ┗━━━ 1 ━━━┛ ┘   - splitBody (empty?)
                    const border = 1
                    const y0 = 0
                    const y1 = border + 32
                    const y2 = y1 + border + 64
                    const y3 = y2 + border + 48
                    const initialHeight = y3 + border + 72 + border
                    const removeHeight = border + 48 + border + 72
                    // the split body has a border on top and bottom
                    const splitY0 = y2
                    const splitH0 = border + 48 + border + 72 + border
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    // FIXME: this is one too much!!!
                    const maskY0 = initialHeight
                    const maskH0 = removeHeight + border

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,48`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,72`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows
                    model.removeRow(2, 2)
                    const animation = RemoveRowAnimation.current!

                    // WHEN ask for the new rows to be placed
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#3:0,${y2},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#4:0,${y3},80,72`)

                    // ...and are hidden by a mask
                    expect(maskY()).to.equal(maskY0)
                    expect(maskH()).to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody (the splitbody must meet the mask, height doesn't matter)
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animate()
                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight - 1)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight - 1)

                    animation.joinHorizontal()
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)
                    expect(table.body.children).to.have.lengthOf(4)
                })
            })
        })
    })
})

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

async function prepare(data: MeasureRow[]) {
    TableAdapter.register(MeasureAdapter, ArrayModel, MeasureRow)
    const model = new ArrayModel<MeasureRow>(data, MeasureRow)
    document.body.replaceChildren(<Table style={{ width: '100%', height: '350px' }} model={model} />)
    await sleep()
    return model
}
function getTable() {
    return new TableFriend(
        document.querySelector("tx-table") as Table
    )
}
function bodyRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.body)
}
function splitRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.splitBody)
}
function stagingRowInfo(row: number) {
    const table = getTable()
    return bodyRowInfoCore(row, table, table.staging)
}
function splitBodyY() {
    const table = getTable()
    return px2float(table.splitBody.style.top)
}
function splitBodyH() {
    const table = getTable()
    return px2float(table.splitBody.style.height)
}
function maskY() {
    const table = getTable()
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.top)
}
function maskH() {
    const table = getTable()
    const mask = table.staging.children[table.staging.children.length - 1] as HTMLSpanElement
    return px2float(mask.style.height)
}
function bodyRowInfoCore(row: number, table: TableFriend, body: HTMLDivElement) {
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

