import { expect } from 'chai'
import { bindModel, unbind } from "@toad"
import { TableAdapter } from '@toad/table/adapter/TableAdapter'
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { px2float, sleep } from "../testlib"
import { InsertRowAnimation } from '@toad/table/detail/InsertRowAnimation'
import { RemoveRowAnimation } from '@toad/table/detail/RemoveRowAnimation'
import { Animator, AnimationBase } from '@toad/util/animation'
import {
    Measure, prepareByRows, flatMapRows, getTable, testTableLayout,
    bodyRowInfo, stagingRowInfo, maskY, maskH, splitRowInfo, splitBodyY, splitBodyH,
    headRowInfo, stagingRowHeadInfo, headMaskY, headMaskH, splitRowHeadInfo, splitRowHeadY, splitRowHeadH
} from "./util"
import { forEach } from 'test/mocha-each'
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        // Table.maskColor = `rgba(0,0,128,0.3)`
        // Table.splitColor = `rgba(255,128,0,0.5)`
        AnimationBase.animationFrameCount = 1
        Animator.halt = true
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    // TODO: spreadsheet can't handle insert/remove row/column yet
    xit("spreadsheet", async function() {
        AnimationBase.animationFrameCount = 468
        Animator.halt = false
        const sheet = [
            ["Name", "Pieces", "Price/Piece", "Price"],
            ["Apple", "=4", "=0.98", "=B2*C2"],
            ["Banana", "=2", "=1.98", "=B3*C3"],
            ["Citrus", "=1", "=1.48", "=B4*C4"],
            ["SUM", "", "", "=D2+D3+D4"],
        ]

        const spreadsheet = new SpreadsheetModel(5, 5)
        for (let row = 0; row < spreadsheet.rowCount; ++row) {
            for (let col = 0; col < spreadsheet.colCount; ++col) {
                if (row < sheet.length && col < sheet[row].length) {
                    spreadsheet.setField(col, row, sheet[row][col])
                }
            }
        }
        TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
        bindModel("spreadsheet", spreadsheet)

        document.body.innerHTML=`<tx-tabletool></tx-tabletool><tx-table style="width: 100%; height: 200px;" model="spreadsheet"></tx-table>`

        const r = spreadsheet.getCell(3,4)
        expect(r.value).to.equal("9.36")
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
                await prepareByRows([
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
                await prepareByRows([
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
                await prepareByRows([
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

    // [ ] adjust spacer
    // [ ] adjust resize handles after add/delete row/column
    // [ ] resize
    //   [ ] columns
    //   [ ] head

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
                    // expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,33,80,64`)

                    // ...and are hidden by a mask
                    const insertHeight = 32 + 64 + 4 - 1
                    expect(maskY()).to.equal(0)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody
                    expect(splitBodyY()).to.equal(0)
                    expect(splitBodyH()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.join()
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
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,49,80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(maskY()).to.equal(0)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()
                    expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(splitRowInfo(1)).to.equal(`#4:0,33,80,64`)
                    // THEN splitbody
                    expect(splitBodyY()).to.equal(0)
                    expect(splitBodyH()).to.equal(32 + 64 + 4 - 1)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(insertHeight - 1)
                    expect(splitBodyY()).to.equal(insertHeight - 1)

                    animation.join()
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
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#2:0,33,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,82,80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(maskY()).to.equal(33)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()
                    // THEN splitbody
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(33)
                    expect(splitBodyH()).to.equal(64 + 2)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.join()
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
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#3:0,98,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#4:0,147,80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(maskY()).to.equal(98)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()
                    // THEN splitbody
                    // FIXME: this should contain data
                    expect(splitBodyY()).to.equal(98)
                    expect(splitBodyH()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(98 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(98 + insertHeight - 1)

                    animation.join()

                    check32_64_48_72()
                })
                xdescribe("column width", function () {
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
                        animation.arrangeInStaging()

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
                        animation.arrangeInStaging()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,128,64`)

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,128,48`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 2
                        expect(maskY()).to.equal(33)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.split()
                        // THEN splitbody
                        expect(splitRowInfo(0)).to.equal(`#3:0,0,128,64`)
                        expect(splitBodyY()).to.equal(33)
                        expect(splitBodyH()).to.equal(64 + 2)

                        // WHEN we animate
                        animation.animationFrame(1)

                        // expect(maskY()).to.equal(33 + insertHeight - 1)
                        // expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                        animation.join()
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
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowInfo(0)).to.equal(`#2:0,32,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,80,80,72`) // 80 instead of 82
                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 // + 4 - 1
                    expect(maskY()).to.equal(32) // 32 instead of 33
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()
                    // THEN splitbody
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(32) // 32 instead of 33
                    expect(splitBodyH()).to.equal(64) // 64 instead of 64 + 2

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.join()
                    check32_48_72_64_seamless()
                })
            })
            describe("row headers", function () {
                // NOTE: row headers will be tested for animation; column headers, ... let's see...

                it("two rows into empty (row and column headers)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([], { rowHeaders: true, columnHeaders: true })
                    const table = getTable()

                    // ...insert the 1st two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(0, flatMapRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ]))

                    // return

                    expect(table.root.children.length).equal(1)

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()

                    expect(table.rowHeads).to.not.be.undefined
                    expect(animation.bodyStaging).to.not.be.undefined
                    expect(animation.headStaging).to.not.be.undefined
                    await sleep()

                    // THEN then two cells have been measured.
                    // expect(table.measure.children.length).to.equal(8)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#2:0,${32 + 1},16,64`)
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,${32 + 1},80,64`)

                    // ...and are hidden by a mask
                    const insertHeight = 32 + 64 + 4 - 1
                    expect(headMaskY()).to.equal(0)
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(0)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(0)
                    expect(splitRowHeadH()).to.equal(1)
                    expect(splitBodyY()).to.equal(0)
                    expect(splitBodyH()).to.equal(1)

                    expect(table.body.style.left, `body left`).to.equal(`21px`)
                    expect(table.body.style.top, `body top`).to.equal(`19px`)

                    expect(table.rowHeads.style.top, `row container top`).to.equal(`19px`)

                    expect(table.colHeads.style.left, `column container left`).to.equal(`21px`)
                    expect(table.colHeads.style.right, `column container right`).to.equal(`0px`)
                    expect(table.colHeads.style.height, `column container height`).to.equal(`20px`)

                    expect(table.getHeadStaging()!.style.top, `head staging top`).to.equal(`19px`)
                    expect(animation.bodyStaging.style.left, `staging left`).to.equal(`21px`)
                    expect(animation.bodyStaging.style.top, `staging top`).to.equal(`19px`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(insertHeight)
                    expect(splitRowHeadY()).to.equal(insertHeight)
                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.join()
                    check32_64()
                    checkRowHead32_64()

                    expect(table.colHeads).not.be.undefined
                    expect(table.rowHeads).not.be.undefined
                    testTableLayout()
                })

                it("two rows into empty (just row headers)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([], { rowHeaders: true })
                    const table = getTable()

                    // ...insert the 1st two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(0, flatMapRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    expect(table.rowHeads).to.not.be.undefined
                    expect(animation.bodyStaging).to.not.be.undefined
                    expect(animation.headStaging).to.not.be.undefined
                    await sleep()

                    // THEN then two cells have been measured.
                    // expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#2:0,${32 + 1},16,64`)
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,${32 + 1},80,64`)

                    // ...and are hidden by a mask
                    const insertHeight = 32 + 64 + 4 - 1
                    expect(headMaskY()).to.equal(0)
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(0)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(0)
                    expect(splitRowHeadH()).to.equal(1)
                    expect(splitBodyY()).to.equal(0)
                    expect(splitBodyH()).to.equal(1)

                    expect(table.body.style.left).to.equal(`21px`)
                    expect(animation.bodyStaging.style.left).to.equal(`21px`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(insertHeight)
                    expect(splitRowHeadY()).to.equal(insertHeight)
                    expect(maskY()).to.equal(insertHeight)
                    expect(splitBodyY()).to.equal(insertHeight)

                    animation.join()
                    check32_64()
                    checkRowHead32_64()

                    expect(table.colHeads).be.undefined
                    expect(table.rowHeads).not.be.undefined
                    testTableLayout()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two rows at head", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { rowHeaders: true })
                    const table = getTable()

                    expect(headRowInfo(0)).to.equal(`#3:0,0,16,32`)
                    expect(headRowInfo(1)).to.equal(`#4:0,${32 + 1},16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,${32 + 1},80,64`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two rows
                    model.insertRow(0, flatMapRows([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two rows have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#1:0,0,16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#2:0,${48 + 1},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,${48 + 1},80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(headMaskY()).to.equal(0)
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(0)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody

                    expect(splitRowHeadInfo(0)).to.equal(`#3:0,0,16,32`)
                    expect(splitRowHeadInfo(1)).to.equal(`#4:0,${32 + 1},16,64`)
                    expect(splitRowHeadY()).to.equal(0)
                    expect(splitRowHeadH()).to.equal(32 + 64 + 4 - 1)

                    expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(splitRowInfo(1)).to.equal(`#4:0,${32 + 1},80,64`)
                    expect(splitBodyY()).to.equal(0)
                    expect(splitBodyH()).to.equal(32 + 64 + 4 - 1)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(insertHeight - 1)
                    expect(splitRowHeadY()).to.equal(insertHeight - 1)

                    expect(maskY()).to.equal(insertHeight - 1)
                    expect(splitBodyY()).to.equal(insertHeight - 1)

                    animation.join()
                    check48_72_32_64()
                    checkRowHead48_72_32_64()
                })
                it("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { rowHeaders: true })
                    const table = getTable()

                    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(headRowInfo(1)).to.equal(`#4:0,${32 + 1},16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,${32 + 1},80,64`)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()

                    // THEN then 4 body and 2 header cells will be measured
                    expect(table.measure.children.length).to.equal(6)
                    await sleep()

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#2:0,${32 + 1},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#3:0,${32 + 48 + 2},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#2:0,${32 + 1},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,${32 + 48 + 2},80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(headMaskY()).to.equal(32 + 1)
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(32 + 1)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

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

                    animation.lastFrame()
                    check32_48_72_64()
                    checkRowHead32_48_72_64()
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], { rowHeaders: true })
                    const table = getTable()

                    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${32 + 1},16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${32 + 1},80,64`)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(2, flatMapRows([
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#3:0,${32 + 64 + 2},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#4:0,${32 + 64 + 48 + 3},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#3:0,${32 + 64 + 2},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#4:0,${32 + 64 + 48 + 3},80,72`)

                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 + 4 - 1
                    expect(headMaskY()).to.equal(98)
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(98)
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(32 + 64 + 2)
                    expect(splitRowHeadH()).to.equal(1)
                    expect(splitBodyY()).to.equal(32 + 64 + 2)
                    expect(splitBodyH()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(32 + 64 + 2 + insertHeight - 1)
                    expect(splitRowHeadY()).to.equal(32 + 64 + 2 + insertHeight - 1)
                    expect(maskY()).to.equal(32 + 64 + 2 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(32 + 64 + 2 + insertHeight - 1)

                    animation.join()

                    check32_64_48_72()
                    checkRowHead32_64_48_72()
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
                        animation.arrangeInStaging()

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
                        animation.arrangeInStaging()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#3:0,33,128,64`)

                        // THEN they have been placed in staging
                        expect(stagingRowInfo(0)).to.equal(`#2:0,33,128,48`)

                        // ...and are hidden by a mask
                        const insertHeight = 48 + 2
                        expect(maskY()).to.equal(33)
                        expect(maskH()).to.equal(insertHeight)

                        // WHEN we split the table for the animation
                        animation.split()
                        // THEN splitbody
                        expect(splitRowInfo(0)).to.equal(`#3:0,0,128,64`)
                        expect(splitBodyY()).to.equal(33)
                        expect(splitBodyH()).to.equal(64 + 2)

                        // WHEN we animate
                        animation.animationFrame(1)

                        // expect(maskY()).to.equal(33 + insertHeight - 1)
                        // expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                        animation.join()
                        expect(bodyRowInfo(0)).to.equal(`#1:0,0,128,32`)
                        expect(bodyRowInfo(1)).to.equal(`#2:0,33,128,48`)
                        expect(bodyRowInfo(2)).to.equal(`#3:0,82,128,64`)
                        expect(table.body.children).to.have.lengthOf(6)
                    })
                    xit("shrink")
                })
                it("seamless (two rows at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true, rowHeaders: true })
                    const table = getTable()

                    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
                    expect(headRowInfo(1)).to.equal(`#4:0,32,16,64`) // 32 instead of 33
                    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,32,80,64`) // 32 instead of 33

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertRow(1, flatMapRows([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertRowAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#2:0,32,16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#3:0,${32 + 48},16,72`) // 80 instead of 82
                    expect(stagingRowInfo(0)).to.equal(`#2:0,32,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,${32 + 48},80,72`) // 80 instead of 82
                    // ...and are hidden by a mask
                    const insertHeight = 48 + 72 // + 4 - 1
                    expect(headMaskY()).to.equal(32) // 32 instead of 33
                    expect(headMaskH()).to.equal(insertHeight)
                    expect(maskY()).to.equal(32) // 32 instead of 33
                    expect(maskH()).to.equal(insertHeight)

                    // WHEN we split the table for the animation
                    animation.split()

                    // THEN splitbody

                    expect(splitRowHeadInfo(0)).to.equal(`#4:0,0,16,64`)
                    expect(splitRowHeadY()).to.equal(32) // 32 instead of 33
                    expect(splitRowHeadH()).to.equal(64) // 64 instead of 64 + 2

                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)
                    expect(splitBodyY()).to.equal(32) // 32 instead of 33
                    expect(splitBodyH()).to.equal(64) // 64 instead of 64 + 2

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskY()).to.equal(33 + insertHeight - 1)
                    expect(splitRowHeadY()).to.equal(33 + insertHeight - 1)
                    expect(maskY()).to.equal(33 + insertHeight - 1)
                    expect(splitBodyY()).to.equal(33 + insertHeight - 1)

                    animation.lastFrame()
                    check32_48_72_64_seamless()
                    checkRowHead32_48_72_64_seamless()
                })
            })
        })
        describe("remove", function () {
            describe("body (no headers)", function () {
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
                    const splitH0 = 1 // no rows
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    const maskY0 = initialHeight
                    const maskH0 = initialHeight

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(table.body.children).to.have.lengthOf(4)

                    // AnimationBase.animationFrameCount = 468
                    // Animator.halt = false

                    // ...remove all rows
                    model.removeRow(0, 2)

                    // return

                    const animation = RemoveRowAnimation.current!
                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
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
                    animation.prepareStagingWithRows()
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
                    animation.prepareStagingWithRows()
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
                    const splitH0 = 1 // split body is empty
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    // FIXME: this is one too much!!!
                    const maskY0 = initialHeight
                    const maskH0 = removeHeight + border

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,48`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,72`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the end remove two rows
                    model.removeRow(2, 2)
                    const animation = RemoveRowAnimation.current!

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
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
                    animation.prepareStagingWithRows()
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
            describe("row headers", function () {
                it("all rows", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], { rowHeaders: true })
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
                    const splitH0 = 1 // no rows
                    // the mask will hide the rows to be removed, hence it is placed directly below them
                    const maskY0 = initialHeight
                    const maskH0 = initialHeight

                    expect(headRowInfo(0)).to.equal(`#1:0,${y0},16,32`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${y1},16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(table.body.children).to.have.lengthOf(4)

                    // ...remove all rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeRow(0, 2)

                    // return

                    const animation = RemoveRowAnimation.current!
                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#1:0,${y0},16,32`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#2:0,${y1},16,64`)
                    expect(table.rowHeads.children).to.have.lengthOf(1) // the spacer...
                    expect(stagingRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,${y1},80,64`)
                    expect(table.body.children).to.have.lengthOf(0)

                    // ...and there is a mask at the end of staging?
                    expect(headMaskY()).to.equal(maskY0)
                    expect(headMaskH()).to.equal(maskH0)
                    expect(maskY()).to.equal(maskY0)
                    expect(maskH()).to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    expect(table.splitBody.children).has.length(0)

                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(splitY0)
                    expect(splitRowHeadH()).to.equal(splitH0)
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitRowHeadY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(headMaskY(), "maskY after animation").to.equal(maskY0 - removeHeight)
                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    expect(table.body.children).to.have.lengthOf(0)
                    expect(table.rowHeads.children).to.have.lengthOf(1) // the spacer...
                })
                it("two rows at head", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByRows([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { rowHeaders: true })
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

                    expect(headRowInfo(0)).to.equal(`#1:0,${y0},16,48`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${y1},16,72`)
                    expect(headRowInfo(2)).to.equal(`#3:0,${y2},16,32`)
                    expect(headRowInfo(3)).to.equal(`#4:0,${y3},16,64`)

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,48`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,72`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,32`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,64`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head remove two rows
                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeRow(0, 2)

                    // return

                    const animation = RemoveRowAnimation.current!
                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#1:0,0,16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#2:0,49,16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#1:0,0,80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#2:0,49,80,72`)

                    expect(headRowInfo(0)).to.equal(`#3:0,122,16,32`)
                    expect(headRowInfo(1)).to.equal(`#4:0,155,16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#3:0,122,80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#4:0,155,80,64`)

                    // ...and there is a mask at the end of staging?
                    expect(headMaskY(), "maskY before animation").to.equal(maskY0)
                    expect(headMaskH(), "maskH before animation").to.equal(maskH0)
                    expect(maskY(), "maskY before animation").to.equal(maskY0)
                    expect(maskH(), "maskH before animation").to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    expect(splitRowHeadInfo(0)).to.equal(`#3:0,0,16,32`)
                    expect(splitRowHeadInfo(1)).to.equal(`#4:0,33,16,64`)
                    expect(splitRowInfo(0)).to.equal(`#3:0,0,80,32`)
                    expect(splitRowInfo(1)).to.equal(`#4:0,33,80,64`)

                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(splitY0)
                    expect(splitRowHeadH()).to.equal(splitH0)
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitRowHeadY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(headMaskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    check32_64_remove_head()
                    checkRowHead32_64_remove_head()
                })
                it("two rows at middle", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { rowHeaders: true })
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

                    expect(headRowInfo(0)).to.equal(`#1:0,${0},16,32`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${32 + 1},16,48`)
                    expect(headRowInfo(2)).to.equal(`#3:0,${32 + 48 + 2},16,72`)
                    expect(headRowInfo(3)).to.equal(`#4:0,${32 + 48 + 72 + 3},16,64`)

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${32 + 1},80,48`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${32 + 48 + 2},80,72`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${32 + 48 + 72 + 3},80,64`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeRow(1, 2)

                    // return

                    const animation = RemoveRowAnimation.current!

                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#2:0,${32 + 1},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#3:0,${32 + 48 + 2},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#2:0,${32 + 1},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,${32 + 48 + 2},80,72`)

                    // ...and are hidden by a mask
                    expect(headMaskY(), "headMaskY before animation").to.equal(maskY0)
                    expect(headMaskH(), "headMaskH before animation").to.equal(maskH0)
                    expect(maskY(), "maskY before animation").to.equal(maskY0)
                    expect(maskH(), "maskH before animation").to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(splitY0)
                    expect(splitRowHeadH()).to.equal(splitH0)
                    expect(splitRowHeadInfo(0)).to.equal(`#4:0,0,16,64`)

                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitRowHeadY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(headMaskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()

                    check32_64_remove_middle()
                    checkRowHead32_64_remove_middle()
                })
                it("two rows at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ], { rowHeaders: true })
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

                    expect(headRowInfo(0)).to.equal(`#1:0,${0},16,32`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${32 + 1},16,64`)
                    expect(headRowInfo(2)).to.equal(`#3:0,${32 + 64 + 2},16,48`)
                    expect(headRowInfo(3)).to.equal(`#4:0,${32 + 64 + 48 + 3},16,72`)

                    expect(bodyRowInfo(0)).to.equal(`#1:0,${0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${32 + 1},80,64`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${32 + 64 + 2},80,48`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${32 + 64 + 48 + 3},80,72`)

                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    AnimationBase.animationFrameCount = 6000
                    Animator.halt = false

                    model.removeRow(2, 2)
                    const animation = RemoveRowAnimation.current!

                    return

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#3:0,${32 + 64 + 2},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#4:0,${32 + 64 + 48 + 3},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#3:0,${32 + 64 + 2},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#4:0,${32 + 64 + 48 + 3},80,72`)

                    // ...and are hidden by a mask
                    expect(headMaskY()).to.equal(maskY0)
                    expect(headMaskH()).to.equal(maskH0)
                    expect(maskY()).to.equal(maskY0)
                    expect(maskH()).to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()

                    // THEN splitbody (the splitbody must meet the mask, height doesn't matter)
                    expect(splitRowHeadY()).to.equal(splitY0)
                    expect(splitRowHeadH()).to.equal(splitH0)
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(splitRowHeadY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight - 1)
                    expect(headMaskY(), "maskY after animation").to.equal(maskY0 - removeHeight - 1)
                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight - 1)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight - 1)

                    animation.joinHorizontal()
                    check32_64()
                    checkRowHead32_64()
                })
                // REFACTOR: this is copy'n pasted, with only two changes. use this as a template to refactor the other seamless test
                it("seamless (two rows at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], {
                        seamless: true,
                        rowHeaders: true
                    })
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

                    expect(headRowInfo(0)).to.equal(`#1:0,${y0},16,32`)
                    expect(headRowInfo(1)).to.equal(`#2:0,${y1},16,48`)
                    expect(headRowInfo(2)).to.equal(`#3:0,${y2},16,72`)
                    expect(headRowInfo(3)).to.equal(`#4:0,${y3},16,64`)
                    expect(bodyRowInfo(0)).to.equal(`#1:0,${y0},80,32`)
                    expect(bodyRowInfo(1)).to.equal(`#2:0,${y1},80,48`)
                    expect(bodyRowInfo(2)).to.equal(`#3:0,${y2},80,72`)
                    expect(bodyRowInfo(3)).to.equal(`#4:0,${y3},80,64`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeRow(1, 2)

                    // return

                    const animation = RemoveRowAnimation.current!

                    expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeRowsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingRowHeadInfo(0)).to.equal(`#2:0,${y1},16,48`)
                    expect(stagingRowHeadInfo(1)).to.equal(`#3:0,${y2},16,72`)
                    expect(stagingRowInfo(0)).to.equal(`#2:0,${y1},80,48`)
                    expect(stagingRowInfo(1)).to.equal(`#3:0,${y2},80,72`)

                    // ...and are hidden by a mask
                    expect(headMaskY(), "maskY before animation").to.equal(maskY0)
                    expect(headMaskH(), "maskH before animation").to.equal(maskH0)
                    expect(maskY(), "maskY before animation").to.equal(maskY0)
                    expect(maskH(), "maskH before animation").to.equal(maskH0)

                    // WHEN we split the table for the animation
                    animation.splitHorizontal()
                    // THEN splitbody
                    expect(splitRowHeadY()).to.equal(splitY0)
                    expect(splitRowHeadH()).to.equal(splitH0)
                    expect(splitRowHeadInfo(0)).to.equal(`#4:0,0,16,64`)
                    expect(splitBodyY()).to.equal(splitY0)
                    expect(splitBodyH()).to.equal(splitH0)
                    expect(splitRowInfo(0)).to.equal(`#4:0,0,80,64`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitRowHeadY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(headMaskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    expect(splitBodyY(), "splitBodyY after animation").to.equal(splitY0 - removeHeight)
                    expect(maskY(), "maskY after animation").to.equal(maskY0 - removeHeight)

                    animation.joinHorizontal()
                    check32_64_remove_seamless()
                    checkRowHead32_64_remove_seamless()

                    expect(table.body.children).to.have.lengthOf(4)
                })
            })
        })
        describe("table layout", function () {
            describe("row and column header containers and body", function () {
                forEach([
                    [false, false, false],
                    [true, false, false],
                    [false, true, false],
                    [true, true, false],
                    [false, false, true],
                    [true, false, true],
                    [false, true, true],
                    [true, true, true]
                ]).it("row header: {}, column header: {}, seamless: {}", async function (rowHeaders: boolean, columnHeaders: boolean, seamless: boolean) {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 64),
                        new Measure(4, 72)
                    ], { rowHeaders, columnHeaders, seamless })
                    testTableLayout()
                })
            })
            describe("insert", function () {
                it("row head 32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_64()
                })
                it("body 32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    check32_64()
                })
                it("body 48, 72, 32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check48_72_32_64()
                })
                it("row head 48, 72, 32, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead48_72_32_64()
                })
                it("body 32, 48, 72, 64", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ])
                    check32_48_72_64()
                })
                it("row head 32, 48, 72, 64", async function () {
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
                it("body 32, 48, 72, 64 (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { seamless: true })
                    check32_48_72_64_seamless()
                })
                it("row head 32, 48, 72, 64 (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], {
                        seamless: true,
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_48_72_64_seamless()
                })
                it("body 32, 64, 48, 72", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ])
                    check32_64_48_72()
                })
                it("row head 32, 64, 48, 72", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_64_48_72()
                })

            })
            describe("remove", function () {
                it("body 32, 64 at head", async function () {
                    await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_head()
                })
                it("row head 32, 64 at head", async function () {
                    await prepareByRows([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_64_remove_head()
                })
                it("body 32, 64 at middle", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_middle()
                })
                it("row head 32, 64 at middle", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], {
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_64_remove_middle()
                })
                it("body 32, 64 at middle (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    check32_64_remove_seamless()
                })
                it("row head 32, 64 at middle (seamless)", async function () {
                    await prepareByRows([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], {
                        seamless: true,
                        rowHeaders: true,
                        columnHeaders: true
                    })
                    checkRowHead32_64_remove_seamless()
                })
            })
        })
    })
})

function check32_64() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,33,80,64`)
}
function checkRowHead32_64() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#2:0,33,16,64`)
}
function check48_72_32_64() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,48`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,49,80,72`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,122,80,32`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,155,80,64`)
}
function checkRowHead48_72_32_64() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,48`)
    expect(headRowInfo(1)).to.equal(`#2:0,49,16,72`)
    expect(headRowInfo(2)).to.equal(`#3:0,122,16,32`)
    expect(headRowInfo(3)).to.equal(`#4:0,155,16,64`)
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
function checkRowHead32_48_72_64_seamless() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#2:0,32,16,48`)
    expect(headRowInfo(2)).to.equal(`#3:0,${32 + 48},16,72`)
    expect(headRowInfo(3)).to.equal(`#4:0,${32 + 48 + 72},16,64`)
}
function check32_64_48_72() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#2:0,${32 + 1},80,64`)
    expect(bodyRowInfo(2)).to.equal(`#3:0,${32 + 64 + 2},80,48`)
    expect(bodyRowInfo(3)).to.equal(`#4:0,${32 + 64 + 48 + 3},80,72`)
}
function checkRowHead32_64_48_72() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#2:0,${32 + 1},16,64`)
    expect(headRowInfo(2)).to.equal(`#3:0,${32 + 64 + 2},16,48`)
    expect(headRowInfo(3)).to.equal(`#4:0,${32 + 64 + 48 + 3},16,72`)
}
function check32_64_remove_head() {
    expect(bodyRowInfo(0)).to.equal(`#3:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
}
function checkRowHead32_64_remove_head() {
    expect(headRowInfo(0)).to.equal(`#3:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#4:0,33,16,64`)
}
function check32_64_remove_middle() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,33,80,64`)
}
function checkRowHead32_64_remove_middle() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#4:0,${32 + 1},16,64`)
}
function check32_64_remove_seamless() {
    expect(bodyRowInfo(0)).to.equal(`#1:0,0,80,32`)
    expect(bodyRowInfo(1)).to.equal(`#4:0,32,80,64`)
}
function checkRowHead32_64_remove_seamless() {
    expect(headRowInfo(0)).to.equal(`#1:0,0,16,32`)
    expect(headRowInfo(1)).to.equal(`#4:0,32,16,64`)
}

