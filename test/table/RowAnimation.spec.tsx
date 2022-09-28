import { expect } from '@esm-bundle/chai'
import { Animator, unbind } from "@toad"
import { Table } from '@toad/table/Table'
import { TableAdapter } from '@toad/table/adapter/TableAdapter'
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { px2float, sleep } from "../testlib"
import { InsertRowAnimation } from '@toad/table/private/InsertRowAnimation'
import { RemoveRowAnimation } from '@toad/table/private/RemoveRowAnimation'
import { AnimationBase } from '@toad/util/animation'

import { Measure, prepareByRows, flatMapRows, getTable,
    bodyRowInfo, stagingRowInfo, maskY, maskH, splitRowInfo, splitBodyY, splitBodyH,
    headRowInfo, stagingRowHeadInfo,  headMaskY, headMaskH, splitRowHeadInfo, splitRowHeadY, splitRowHeadH
} from "./util"

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.maskColor = `rgba(0,0,128,0.3)`
        Table.splitColor = `rgba(255,128,0,0.5)`
        AnimationBase.animationFrameCount = 1
        Animator.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("other", function () {
        xit("staging follows scrolled body", async function () {
            // WHEN we have an empty table without headings: this test does not work anymore because staging is only visible when scrolling
            // which also mean, staging must be initialized when it's created.
            // so to test this in a nice way, all that functionality should be nicely isolated...
            await prepareByRows([
                new Measure(1, 32),
                new Measure(4, 64)
            ], { height: 32, width: 32 })
            const table = getTable()

            console.log(`------- call onscroll ----------`)
            table.body.scrollTop = 16
            table.body.scrollLeft = 24
            table.body.onscroll!(undefined as any)
            console.log(`------- called onscroll --------`)

            expect(table.getStaging()!.style.top).to.equal(`-16px`)
            expect(table.getStaging()!.style.left).to.equal(`-24px`)
        })
        describe("placement of header and body containers", function () {
            it("just row headers", async function () {
                // WHEN we have an empty table without headings
                const model = await prepareByRows([
                    new Measure(1, 32),
                    new Measure(4, 64)
                ], {
                    rowHeaders: true
                })
                const table = getTable()
                expect(table.rowHeads.style.top).equals("0px")
            })

            it("just columns headers", async function () {
                // WHEN we have an empty table without headings
                const model = await prepareByRows([
                    new Measure(1, 32),
                    new Measure(4, 64)
                ], {
                    columnHeaders: true
                })
                const table = getTable()
                expect(table.colHeads.style.left).equals("0px")
            })

            it("column and row headers", async function () {
                // WHEN we have an empty table without headings
                const model = await prepareByRows([
                    new Measure(1, 32),
                    new Measure(4, 64)
                ], {
                    rowHeaders: true,
                    columnHeaders: true
                })
                const table = getTable()
                expect(table.rowHeads.style.left).equals("")
                expect(px2float(table.rowHeads.style.top)).equals(px2float(table.colHeads.style.height) - 1)

                expect(table.colHeads.style.top).equals("")
                expect(px2float(table.colHeads.style.left)).equals(px2float(table.rowHeads.style.width) - 1)
            })
        })
    })

    // TODO
    // [ ] colors for mask and staging
    // [ ] alignment in makehuman.js
    // [ ] table colors
    // [ ] with headers

    describe("row", function () {
        describe("insert", function () {
            describe("body (no headers)", function () {
                it("two rows into empty", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([])
                    expect(model.colCount).to.equal(2)
                    expect(model.rowCount).to.equal(0)
                    const table = getTable()

                    // ...insert the 1st two rows
                    model.insertRow(0, flatMapRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ]))
                    expect(model.colCount).to.equal(2)
                    expect(model.rowCount).to.equal(2)

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.joinHorizontal()
                    check32_64()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two rows at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(0, flatMapRows([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two rows have been measured.
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight - 1)
                    expect(splitBodyY()).to.equal(insertHeight - 1)

                    animation.joinHorizontal()
                    check48_72_32_64()
                })
                it("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.joinHorizontal()
                    check32_48_72_64()
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(2, flatMapRows([
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(98 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(98 + insertHeight - 1)

                    animation.joinHorizontal()

                    check32_64_48_72()
                })
                describe("column width", function () {
                    it("keep initial", async function () {
                        // WHEN we have an empty table without headings
                        const model = await prepareByRows([
                            new Measure(1, 32),
                            new Measure(3, 64)
                        ])
                        // Animator.halt = false
                        const table = getTable()

                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,80,64`)

                        // ...at the head insert two rows
                        // model.insertRow(1, flatMapRows([
                        //     new Measure(2, 48, 200).toCells()
                        // ]))

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepare()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(2)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,80,48`)
                    })
                    it("extend", async function () {
                        // WHEN we have an empty table without headings
                        const model = await prepareByRows([
                            new Measure(1, 32),
                            new Measure(3, 64)
                        ], { expandColumn: true })
                        // Animator.halt = false
                        const table = getTable()

                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,80,64`)

                        // ...at the head insert two rows
                        // model.insertRow(1, flatMapRows([
                        //     new Measure(2, 48, 128)
                        // ]))

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepare()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(2)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,128,64`)

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,128,48`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 2
                        expect(maskY()).to.equal(33)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()
                        // THEN splitbody
                        expect(splitRowInfo(0)).to.equal(`#3:0,0,128,64`)
                        expect(splitBodyY()).to.equal(33)
                        expect(splitBodyH()).to.equal(64 + 2)

                        // WHEN we animate
                        animation.animationFrame(1)

                        // expect(maskY()).to.equal(33 + insertHeight - 1)
                        // expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,33,128,48`)
                        expect(bodyRowInfo(2)).to.equal(`#3:0,82,128,64`)
                        expect(table.body.children).to.have.lengthOf(6)
                    })
                    it("shrink")
                })
                it("seamless (two rows at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,32,80,64`) // 32 instead of 33

                    // ...at the head insert two rows
                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeNewRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#2:0,32,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,80,80,72`) // 80 instead of 82
                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 // + 4 - 1
                    expect(maskY()).to.equal(32) // 32 instead of 33
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(32) // 32 instead of 33
                    expect(splitBodyH()).to.equal(64) // 64 instead of 64 + 2

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.joinHorizontal()
                    check32_48_72_64_seamless()
                })
            })
            describe("row headers", function () {
                // NOTE: row headers will be tested for animation; column headers, ... let's see...

                xit("two rows into empty", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([])
                    const table = getTable()

                    // ...insert the 1st two rows
                    model.insertRow(0, flatMapRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ]))

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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.joinHorizontal()
                    check32_64()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                xit("two rows at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(0, flatMapRows([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepareCellsToBeMeasured()
                    await sleep()

                    // THEN then two rows have been measured.
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight - 1)
                    expect(splitBodyY()).to.equal(insertHeight - 1)

                    animation.joinHorizontal()
                    check48_72_32_64()
                })
                it.only("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(headRowInfo(1)).to.equal(`#4:0,${32+1},16,64`)

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()

                    // THEN then 4 body and 2 header cells will be measured
                    expect(table.measure.children.length).to.equal(6)
                    await sleep()

                    // WHEN ask for the new rows to be placed
                    animation.arrangeNewRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#2:0,${32+1},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#3:0,${32+48+2},16,72`)

                    expect(stagingRowInfo(0)).to.equal(`#2:0,33,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,82,80,72`)

                    // ...and are hidden by a mask

                    const insertHeight = 48 + 72 + 4 - 1
                    expect(headMaskY()).to.equal(33)
                    expect(headMaskH()).to.equal(insertHeight)

                    expect(maskY()).to.equal(33)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody

                    expect(splitRowHeadInfo(0)).to.equal(`#4:0,0,16,64`)
                    expect(splitRowHeadY()).to.equal(33)
                    expect(splitRowHeadH()).to.equal(64 + 2)

                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(33)
                    expect(splitBodyH()).to.equal(64 + 2)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(33 + insertHeight - 1)
                    expect(splitRowHeadY()).to.equal(33 + insertHeight - 1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    // return

                    animation.lastFrame()
                    check32_48_72_64()
                    checkRowHead32_48_72_64()
                })
                xit("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)

                    // ...at the head insert two rows
                    model.insertRow(2, flatMapRows([
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
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
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(98 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(98 + insertHeight - 1)

                    animation.joinHorizontal()

                    check32_64_48_72()
                })
                describe("column width", function () {
                    xit("keep initial", async function () {
                        // WHEN we have an empty table without headings
                        const model = await prepareByRows([
                            new Measure(1, 32),
                            new Measure(3, 64)
                        ])
                        // Animator.halt = false
                        const table = getTable()

                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,80,64`)

                        // ...at the head insert two rows
                        // model.insertRow(1, flatMapRows([
                        //     new Measure(2, 48, 200).toCells()
                        // ]))

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepare()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(2)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,80,48`)
                    })
                    xit("extend", async function () {
                        // WHEN we have an empty table without headings
                        const model = await prepareByRows([
                            new Measure(1, 32),
                            new Measure(3, 64)
                        ], { expandColumn: true })
                        // Animator.halt = false
                        const table = getTable()

                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,80,64`)

                        // ...at the head insert two rows
                        // model.insertRow(1, flatMapRows([
                        //     new Measure(2, 48, 128).toCells()
                        // ]))

                        // ...and ask for the new cells to be measured
                        const animation = InsertRowAnimation.current!
                        animation.prepare()
                        await sleep()

                        // THEN then two cells have been measured.
                        expect(table.measure.children.length).to.equal(2)

                        // WHEN ask for the new rows to be placed
                        animation.arrangeNewRowsInStaging()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,128,64`)

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,128,48`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 2
                        expect(maskY()).to.equal(33)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.splitHorizontal()
                        // THEN splitbody
                        expect(splitRowInfo(0)).to.equal(`#3:0,0,128,64`)
                        expect(splitBodyY()).to.equal(33)
                        expect(splitBodyH()).to.equal(64 + 2)

                        // WHEN we animate
                        animation.animationFrame(1)

                        // expect(maskY()).to.equal(33 + insertHeight - 1)
                        // expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                        animation.joinHorizontal()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,33,128,48`)
                        expect(bodyRowInfo(2)).to.equal(`#3:0,82,128,64`)
                        expect(table.body.children).to.have.lengthOf(6)
                    })
                    xit("shrink")
                })
                xit("seamless (two rows at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    const table = getTable()

                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,32,80,64`) // 32 instead of 33

                    // ...at the head insert two rows
                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeNewRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#2:0,32,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,80,80,72`) // 80 instead of 82
                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 // + 4 - 1
                    expect(maskY()).to.equal(32) // 32 instead of 33
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(32) // 32 instead of 33
                    expect(splitBodyH()).to.equal(64) // 64 instead of 64 + 2

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.joinHorizontal()
                    check32_48_72_64_seamless()
                })
            })
        })
        describe("remove", function () {
            describe("no headers", function () {
                it("all rows", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
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
                    animation.prepareStaging()
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
                    animation.animationFrame(1)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    expect(table.body.children).to.have.lengthOf(0)
                })
                it("two rows at head", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByRows([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
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
                    animation.prepareStaging()
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
                    animation.animationFrame(1)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    check32_64_remove_head()
                })
                it("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
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
                    animation.prepareStaging()
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
                    animation.animationFrame(1)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()

                    check32_64_remove_middle()
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
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
                    animation.prepareStaging()
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
                    animation.animationFrame(1)
                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight - 1)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight - 1)

                    animation.joinHorizontal()
                    check32_64()
                })
                // REFACTOR: this is copy'n pasted, with only two changes. use this as a template to refactor the other seamless test
                it("seamless (two rows at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { seamless: true })
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
                    const border = 0 // previously 1
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
                    animation.prepareStaging()
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
                    animation.animationFrame(1)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    check32_64_remove_seamless()

                    expect(table.body.children).to.have.lengthOf(4)
                })
            })
        })
        describe("test support for expected final table layouts", function () {
            describe("insert", function () {
                it("32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    check32_64()
                })
                it("48, 72, 32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check48_72_32_64()
                })
                it("32, 48, 72, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ])
                    check32_48_72_64()
                })
                it("32, 48, 72, 64 with row head", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_48_72_64()
                })
                it("32, 48, 72, 64 (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { seamless: true })
                    check32_48_72_64_seamless()
                })
                it("32, 64, 48, 72", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ])
                    check32_64_48_72()
                })
            })
            describe("remove", function () {
                it("32, 64 at head", async function () {
                    await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_head()
                })
                it("32, 64 at middle", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_middle()
                })
                it("32, 64 at middle (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    check32_64_remove_seamless()
                })
            })
        })
    })
})

function check32_64() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)
}
function check48_72_32_64() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,48`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,49,80,72`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,122,80,32`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
}
function check32_48_72_64() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,48`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,82,80,72`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
}
function checkRowHead32_48_72_64() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#2:0,33,16,48`)
    expect(headRowInfo(2)).to.equal(`#3:0,82,16,72`)
    expect(headRowInfo(3)).to.equal(`#4:0,155,16,64`)
}
function check32_48_72_64_seamless() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,32,80,48`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,${32 + 48},80,72`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,${32 + 48 + 72},80,64`)
}
function check32_64_48_72() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,98,80,48`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,147,80,72`)
}
function check32_64_remove_head() {
    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
}
function check32_64_remove_middle() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
}
function check32_64_remove_seamless() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,32,80,64`)
}

