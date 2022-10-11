import { expect } from '@esm-bundle/chai'
import { Animator, unbind } from "@toad"
import { Table } from '@toad/table/Table'
import { TableAdapter } from '@toad/table/adapter/TableAdapter'
import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"
import { sleep } from "../testlib"
import { InsertColumnAnimation } from '@toad/table/private/InsertColumnAnimation'
import { RemoveColumnAnimation } from '@toad/table/private/RemoveColumnAnimation'
import { AnimationBase } from '@toad/util/animation'
import {
    Measure, prepareByColumns, flatMapColumns, getTable, testTableLayout,
    bodyColInfo, splitColInfo, stagingColInfo, stagingInsertColInfo, splitBodyX, splitBodyW, maskX, maskW,
    headColInfo, stagingColHeadInfo, headMaskX, headMaskW, splitColHeadInfo, splitColHeadX, splitColHeadW
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

    // TODO
    // [ ] colors for mask and staging
    // [ ] alignment in makehuman.js
    // [ ] table colors
    // [ ] with headers
    describe("column", function () {
        describe("insert", function () {
            describe("body (no headers)", function () {
                it("two columns into empty", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([])

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    expect(model.asArray().length).to.equal(4)

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#1R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:${0},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)

                    animation.lastFrame()
                    check48_72()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two columns at head", async function () {
                    // WHEN we have a table with two rows 
                    const model = await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()
                    const spacing = table.table.WIDTH_ADJUST - 1

                    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two columns
                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))
                    // return
                    // model.asArray().forEach( (value, index) => console.log(`model[${index}] = id(col):${value.id}, idx(row)=${value.idx}, size=${value.size}`))

                    // CHECKPOINT: MODEL IS CORRECT

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
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
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#1R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)

                    animation.lastFrame()
                    check48_72_32_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two columns at middle", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:37,0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(1, flatMapColumns([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#2R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#3R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#3R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#2:37,0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    // return
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)

                    animation.lastFrame()
                    check32_48_72_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two columns at end", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(2, flatMapColumns([
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#3R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#3R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#4R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#4R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyW()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)

                    animation.lastFrame()
                    check32_64_48_72()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                describe("column width", function () {
                    it("keep initial")
                    it("extend")
                    it("shrink")
                })
                xit("seamless (two columns at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    const table = getTable()

                    const spacing = table.table.WIDTH_ADJUST - 2

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two rows
                    model.insertColumn(1, flatMapColumns([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeNewColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingInsertColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    // THEN splitbody
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)

                    animation.joinVertical()
                    check32_48_72_64_seamless()
                })
            })
            describe("column headers", function () {
                it("two columns into empty (column and row headers)", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([], { columnHeaders: true, rowHeaders: true })

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(8)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#1R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:${0},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(1)

                    expect(table.body.style.left, `body left`).to.equal(`21px`)
                    expect(table.body.style.top, `body top`).to.equal(`19px`)

                    expect(table.colHeads.style.left, `column container left`).to.equal(`21px`)

                    expect(table.rowHeads.style.top, `row container top`).to.equal(`19px`)
                    expect(table.rowHeads.style.bottom, `row container bottom`).to.equal(`0px`)
                    expect(table.rowHeads.style.width, `row container width`).to.equal(`22px`)

                    expect(table.getHeadStaging()!.style.left, `head staging left`).to.equal(`21px`)
                    expect(animation.staging.style.top, `staging top`).to.equal(`19px`)
                    expect(animation.staging.style.left).to.equal(`21px`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitColHeadX()).to.equal(48 + 72 + 2 * spacing)
                    expect(maskX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)

                    animation.lastFrame()
                    check48_72()
                    checkColHead48_72()

                    expect(table.rowHeads).not.be.undefined
                    expect(table.colHeads).not.be.undefined
                    testTableLayout()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two columns into empty (just column headers)", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([], { columnHeaders: true })

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // return

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#1R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#1R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#2R1")

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#1:${0},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(1)

                    expect(table.body.style.top, `body top`).to.equal(`19px`)
                    expect(animation.staging.style.top, `staging top`).to.equal(`19px`)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(maskX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)

                    animation.lastFrame()
                    check48_72()
                    checkColHead48_72()

                    expect(table.rowHeads).be.undefined
                    expect(table.colHeads).not.be.undefined
                    testTableLayout()

                    expect(table.body.children).to.have.lengthOf(4)
                })
                it("two columns at head", async function () {
                    // WHEN we have a table with two rows 
                    const model = await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { columnHeaders: true })

                    const table = getTable()
                    const spacing = table.table.WIDTH_ADJUST - 1

                    expect(headColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two columns
                    model.insertColumn(0, flatMapColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                    expect(stagingInsertColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)

                    // ...and are hidden by a mask
                    expect(headMaskX()).to.equal(0)
                    expect(headMaskW()).to.equal(48 + 72 + 2 * spacing)

                    expect(maskX()).to.equal(0)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(splitColHeadInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColHeadInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    // THEN splitbody
                    expect(splitColHeadX()).to.equal(0)
                    expect(splitColHeadW()).to.equal(32 + 64 + 2 * spacing + 5) // 5 for the filler
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(headMaskX()).to.equal(48 + 72 + spacing * 2)
                    expect(splitColHeadX()).to.equal(48 + 72 + spacing * 2)

                    expect(maskX()).to.equal(48 + 72 + spacing * 2)
                    expect(splitBodyX()).to.equal(48 + 72 + spacing * 2)

                    animation.lastFrame()
                    check48_72_32_64()
                    checkColHead48_72_32_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two columns at middle", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { columnHeaders: true })

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap // 5

                    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#4:37,0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:37,0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(1, flatMapColumns([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#2R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#2R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#3R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#3R1")

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(stagingInsertColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(headMaskX()).to.equal(32 + spacing)
                    expect(headMaskW()).to.equal(48 + 72 + 2 * spacing)
                    expect(maskX()).to.equal(32 + spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitColHeadInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitColHeadX()).to.equal(32 + spacing)
                    expect(splitColHeadW()).to.equal(64 + spacing + 5) // correct?
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(headMaskX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitColHeadX()).to.equal(32 + 48 + 72 + 3 * spacing)

                    expect(maskX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)

                    animation.lastFrame()
                    check32_48_72_64()
                    checkColHead32_48_72_64()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                it("two columns at end", async function () {
                    // WHEN we have an empty table with two columns
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], { columnHeaders: true })

                    const table = getTable()
                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)

                    // ... and insert two columns in between

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.insertColumn(2, flatMapColumns([
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ]))

                    // return

                    // ...and ask for the new columns to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then four cells have been measured.
                    expect(table.measure.children.length).to.equal(6)

                    // WHEN ask for the new columns to be placed
                    animation.arrangeNewColumnsInStaging()

                    // 1st column
                    expect(table.getStaging()!.children[0].innerHTML).to.equal("#3R0")
                    expect(table.getStaging()!.children[1].innerHTML).to.equal("#3R1")
                    // 2nd column
                    expect(table.getStaging()!.children[2].innerHTML).to.equal("#4R0")
                    expect(table.getStaging()!.children[3].innerHTML).to.equal("#4R1")

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    expect(stagingInsertColInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(headMaskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(headMaskW()).to.equal(48 + 72 + 2 * spacing)
                    expect(maskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitColHeadX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitColHeadW()).to.equal(5) // FIXME?: usually 1 but there's a filler in there

                    expect(splitBodyX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyW()).to.equal(1)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(headMaskX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)
                    expect(splitColHeadX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)

                    expect(maskX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 64 + 4 * spacing)

                    animation.lastFrame()
                    check32_64_48_72()
                    checkColHead32_64_48_72()

                    expect(table.body.children).to.have.lengthOf(8)
                })
                describe("column width", function () {
                    it("keep initial")
                    it("extend")
                    it("shrink")
                })
                xit("seamless (two columns at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], { seamless: true })
                    const table = getTable()

                    const spacing = table.table.WIDTH_ADJUST - 2

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two rows
                    model.insertColumn(1, flatMapColumns([
                        new Measure(2, 48),
                        new Measure(3, 72)
                    ]))

                    // return

                    // ...and ask for the new cells to be measured
                    const animation = InsertColumnAnimation.current!
                    animation.prepare()
                    await sleep()

                    // THEN then two cells have been measured.
                    expect(table.measure.children.length).to.equal(4)

                    // WHEN ask for the new rows to be placed
                    animation.arrangeNewColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingInsertColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingInsertColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingInsertColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    // THEN splitbody
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(maskX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)

                    animation.joinVertical()
                    check32_48_72_64_seamless()
                })
            })
        })
        describe("remove", function () {
            describe("no headers", function () {
                it("all columns", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(4)

                    // ...remove all rows
                    model.removeColumn(0, 2)

                    const animation = RemoveColumnAnimation.current!
                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(0)

                    // ...and there is a mask at the end of staging?
                    expect(maskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(maskW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(table.splitBody.children).has.length(0)

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitBodyX(), "splitBodyY after animation").to.equal(-(32 + 64 + 2 * spacing))
                    expect(maskX(), "maskY after animation").to.equal(0)

                    animation.joinVertical()
                    expect(table.body.children).to.have.lengthOf(0)
                })
                it("two columns at head", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])

                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head remove two rows
                    model.removeColumn(0, 2)

                    const animation = RemoveColumnAnimation.current!
                    // expect(animation.initialWidth, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)

                    expect(bodyColInfo(0)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)

                    // ...and there is a mask at the end of staging?
                    expect(maskX(), "maskX before animation").to.equal(48 + 72 + 2 * spacing)
                    expect(maskW(), "maskW before animation").to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitBodyX(), "splitBodyY after animation").to.equal(0)
                    expect(maskX(), "maskY after animation").to.equal(0)

                    animation.joinVertical()
                    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(4)

                    check32_64_remove_head()
                })
                it("two columns at middle", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ])
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeColumn(1, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(maskX(), "maskY before animation").to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(maskW(), "maskH before animation").to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitBodyX(), "splitBodyY after animation").to.equal(32 + spacing)
                    expect(maskX(), "maskY after animation").to.equal(32 + spacing)

                    animation.joinVertical()

                    check32_64_remove_middle()
                })
                it("two columns at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ])
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeColumn(2, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    // we expect the mask right of the table, and the splitBody covering the last two columns (so it include staging)

                    // ...and are hidden by a mask
                    expect(maskX()).to.equal(32 + 64 + 48 + 72 + 4 * spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody (the splitbody must meet the mask, height doesn't matter)
                    expect(splitBodyX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(splitBodyX(), "splitBodyX after animation").to.equal(-24)
                    expect(maskX(), "maskX after animation").to.equal(106)

                    animation.joinVertical()
                    check32_64()
                })
                it("seamless (two columns at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { seamless: true })
                    const table = getTable()
                    const spacing = table.table.WIDTH_ADJUST - 2

                    expect(table.body.children).to.have.lengthOf(8)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + 1 * spacing},0,48,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two rows
                    model.removeColumn(1, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithRows()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    // ...and are hidden by a mask
                    expect(maskX(), "maskX before animation").to.equal(32 + 48 + 72 + 3 * spacing + 1) // FIXME?
                    expect(maskW(), "maskW before animation").to.equal(48 + 72 + 2 * spacing + 1) // FIXME?

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    // THEN splitbody
                    // expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyW()).to.equal(64 + spacing - 1) // FIXME?

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitBodyX(), "splitBodyX after animation").to.equal(32 + spacing)
                    expect(maskX(), "maskX after animation").to.equal(32 + spacing)

                    animation.joinVertical()

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    // expect(table.body.children).to.have.lengthOf(4)

                    check32_64_remove_seamless()
                })
            })
            describe("column headers", function () {
                it("all columns", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], { columnHeaders: true })
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(4)

                    // ...remove all rows
                    model.removeColumn(0, 2)

                    const animation = RemoveColumnAnimation.current!
                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithColumns()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(stagingColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(0)

                    // ...and there is a mask at the end of staging?
                    expect(headMaskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(headMaskW()).to.equal(32 + 64 + 2 * spacing)
                    expect(maskX()).to.equal(32 + 64 + 2 * spacing)
                    expect(maskW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(table.splitBody.children).has.length(0)

                    // THEN splitbody
                    expect(splitColHeadX()).to.equal(0)
                    expect(splitColHeadW()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyX()).to.equal(0)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitColHeadX(), "splitBodyY after animation").to.equal(-(32 + 64 + 2 * spacing))
                    expect(headMaskX(), "maskY after animation").to.equal(0)

                    expect(splitBodyX(), "splitBodyY after animation").to.equal(-(32 + 64 + 2 * spacing))
                    expect(maskX(), "maskY after animation").to.equal(0)

                    animation.joinVertical()
                    expect(table.body.children).to.have.lengthOf(0)
                    expect(table.colHeads.children).to.have.lengthOf(1) // the spacer
                })
                it("two columns at head", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { columnHeaders: true })

                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(headColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(headColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)
                    expect(headColInfo(2)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(headColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head remove two rows
                    model.removeColumn(0, 2)

                    const animation = RemoveColumnAnimation.current!
                    // expect(animation.initialWidth, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithColumns()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)
                    expect(stagingColInfo(0)).to.equal(`#1:0,0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#2:${48 + spacing},0,72,18`)

                    expect(headColInfo(0)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(headColInfo(1)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#3:${48 + 72 + 2 * spacing},0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${48 + 72 + 32 + 3 * spacing},0,64,18`)

                    // ...and there is a mask at the end of staging?
                    expect(headMaskX(), "maskX before animation").to.equal(48 + 72 + 2 * spacing)
                    expect(headMaskW(), "maskW before animation").to.equal(48 + 72 + 2 * spacing)
                    expect(maskX(), "maskX before animation").to.equal(48 + 72 + 2 * spacing)
                    expect(maskW(), "maskW before animation").to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    expect(splitColHeadInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColHeadInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    expect(splitColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(splitColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)

                    // THEN splitbody
                    expect(splitColHeadX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitColHeadW()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyX()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyW()).to.equal(32 + 64 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitColHeadX(), "splitBodyY after animation").to.equal(0)
                    expect(headMaskX(), "maskY after animation").to.equal(0)
                    expect(splitBodyX(), "splitBodyY after animation").to.equal(0)
                    expect(maskX(), "maskY after animation").to.equal(0)

                    animation.joinVertical()

                    expect(headColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    expect(table.body.children).to.have.lengthOf(4)

                    check32_64_remove_head()
                    checkColHead32_64_remove_head()
                })
                it("two columns at middle", async function () {
                    // WHEN we have a table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { columnHeaders: true })
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
                    expect(headColInfo(2)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(headColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeColumn(1, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithColumns()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)

                    // ...and are hidden by a mask
                    expect(headMaskX(), "headMaskY before animation").to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(headMaskW(), "headMaskH before animation").to.equal(48 + 72 + 2 * spacing)
                    expect(maskX(), "maskY before animation").to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(maskW(), "maskH before animation").to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody
                    expect(splitColHeadX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitColHeadW()).to.equal(64 + spacing)
                    expect(splitColHeadInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyW()).to.equal(64 + spacing)
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitColHeadX(), "splitBodyY after animation").to.equal(32 + spacing)
                    expect(headMaskX(), "maskY after animation").to.equal(32 + spacing)

                    expect(splitBodyX(), "splitBodyY after animation").to.equal(32 + spacing)
                    expect(maskX(), "maskY after animation").to.equal(32 + spacing)

                    animation.joinVertical()

                    check32_64_remove_middle()
                    checkColHead32_64_remove_middle()
                })
                it("two columns at end", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ], { columnHeaders: true })
                    const table = getTable()

                    const overlap = 1
                    const spacing = table.table.WIDTH_ADJUST - overlap

                    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(headColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(headColInfo(2)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(headColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + spacing},0,64,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)
                    expect(table.body.children).to.have.lengthOf(8)

                    // ...at the head insert two rows

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    model.removeColumn(2, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithColumns()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(stagingColHeadInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingColHeadInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)
                    expect(stagingColInfo(0)).to.equal(`#3:${32 + 64 + 2 * spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#4:${32 + 64 + 48 + 3 * spacing},0,72,18`)

                    // we expect the mask right of the table, and the splitBody covering the last two columns (so it include staging)

                    // ...and are hidden by a mask
                    expect(headMaskX()).to.equal(32 + 64 + 48 + 72 + 4 * spacing)
                    expect(headMaskW()).to.equal(48 + 72 + 2 * spacing)
                    expect(maskX()).to.equal(32 + 64 + 48 + 72 + 4 * spacing)
                    expect(maskW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we split the table for the animation
                    animation.splitVertical()

                    // THEN splitbody (the splitbody must meet the mask, height doesn't matter)
                    expect(splitColHeadX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitColHeadW()).to.equal(48 + 72 + 2 * spacing)
                    expect(splitBodyX()).to.equal(32 + 64 + 2 * spacing)
                    expect(splitBodyW()).to.equal(48 + 72 + 2 * spacing)

                    // WHEN we animate
                    animation.animationFrame(1)
                    expect(splitColHeadX(), "splitBodyX after animation").to.equal(-24)
                    expect(headMaskX(), "maskX after animation").to.equal(106)
                    expect(splitBodyX(), "splitBodyX after animation").to.equal(-24)
                    expect(maskX(), "maskX after animation").to.equal(106)

                    animation.joinVertical()
                    check32_64()
                    checkColHead32_64()
                })
                xit("seamless (two columns at middle)", async function () {
                    // WHEN we have an empty table without headings
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { columnHeaders: true, seamless: true })
                    const table = getTable()
                    const spacing = table.table.WIDTH_ADJUST - 2

                    expect(table.body.children).to.have.lengthOf(8)

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#2:${32 + 1 * spacing},0,48,18`)
                    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    // AnimationBase.animationFrameCount = 6000
                    // Animator.halt = false

                    // ...at the head insert two rows
                    model.removeColumn(1, 2)

                    // return

                    const animation = RemoveColumnAnimation.current!

                    // expect(animation.initialHeight, "initialHeight").to.equal(initialHeight)

                    // WHEN ask for the new rows to be placed
                    animation.prepareStagingWithColumns()
                    animation.arrangeColumnsInStaging()

                    // THEN they have been placed in staging
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + 48 + 72 + 3 * spacing},0,64,18`)

                    // ...and are hidden by a mask
                    expect(maskX(), "maskX before animation").to.equal(32 + 48 + 72 + 3 * spacing + 1) // FIXME?
                    expect(maskW(), "maskW before animation").to.equal(48 + 72 + 2 * spacing + 1) // FIXME?

                    // WHEN we split the table for the animation
                    animation.splitVertical()
                    // THEN splitbody
                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(stagingColInfo(0)).to.equal(`#2:${32 + spacing},0,48,18`)
                    expect(stagingColInfo(1)).to.equal(`#3:${32 + 48 + 2 * spacing},0,72,18`)
                    expect(splitColInfo(0)).to.equal(`#4:0,0,64,18`)
                    expect(splitBodyX()).to.equal(32 + 48 + 72 + 3 * spacing)
                    expect(splitBodyW()).to.equal(64 + spacing - 1) // FIXME?

                    // WHEN we animate
                    animation.animationFrame(1)

                    expect(splitBodyX(), "splitBodyX after animation").to.equal(32 + spacing)
                    expect(maskX(), "maskX after animation").to.equal(32 + spacing)

                    animation.joinVertical()

                    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
                    expect(bodyColInfo(1)).to.equal(`#4:${32 + spacing},0,64,18`)
                    // expect(table.body.children).to.have.lengthOf(4)

                    check32_64_remove_seamless()
                })
            })

        })
        describe("test support for expected final table layouts", function () {
            describe("insert", function () {
                it("body 48, 72", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ])
                    check48_72()
                })
                it("col head 48, 72", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead48_72()
                })
                it("body 48, 72, 32, 64", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check48_72_32_64()
                })
                it("col head 48, 72, 32, 64", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 48),
                        new Measure(2, 72),
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead48_72_32_64()
                })

                it("32, 48, 72, 64 (seamless)", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], {
                        seamless: true
                    })
                    check32_48_72_64_seamless()
                })
                it("body 32, 48, 72, 64", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ])
                    check32_48_72_64()
                })
                it("col head 32, 48, 72, 64", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 48),
                        new Measure(3, 72),
                        new Measure(4, 64)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead32_48_72_64()
                })
                it("body 32, 64, 48, 72", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ])
                    check32_64_48_72()
                })
                it("col head 32, 64, 48, 72", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64),
                        new Measure(3, 48),
                        new Measure(4, 72)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead32_64_48_72()
                })
            })
            describe("remove", function () {
                it("body 32, 64", async function () {
                    await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ])
                    check32_64()
                })
                it("col head 32, 64", async function () {
                    await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(2, 64)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead32_64()
                })
                it("body 32, 64 head", async function () {
                    await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_head()
                })
                it("col head 32, 64 head", async function () {
                    await prepareByColumns([
                        new Measure(3, 32),
                        new Measure(4, 64)
                    ], { rowHeaders: true, columnHeaders: true})
                    checkColHead32_64_remove_head()
                })
                it("32, 64 middle", async function () {
                    await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ])
                    check32_64_remove_middle()
                })
                it("col head 32, 64 middle", async function () {
                    await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ] , { rowHeaders: true, columnHeaders: true})
                    checkColHead32_64_remove_middle()
                })
                it("32, 64 (seamless)", async function () {
                    const model = await prepareByColumns([
                        new Measure(1, 32),
                        new Measure(4, 64)
                    ], {
                        seamless: true
                    })
                    check32_64_remove_seamless()
                })
            })
        })
    })
})

function check48_72() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
}
function checkColHead48_72() {
    expect(headColInfo(0)).to.equal(`#1:0,0,48,18`)
    expect(headColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
}
function check48_72_32_64() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,48,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
    expect(bodyColInfo(2)).to.equal(`#3:${48 + 72 + 2 * 5},0,32,18`)
    expect(bodyColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * 5},0,64,18`)
}
function checkColHead48_72_32_64() {
    expect(headColInfo(0)).to.equal(`#1:0,0,48,18`)
    expect(headColInfo(1)).to.equal(`#2:${48 + 5},0,72,18`)
    expect(headColInfo(2)).to.equal(`#3:${48 + 72 + 2 * 5},0,32,18`)
    expect(headColInfo(3)).to.equal(`#4:${48 + 72 + 32 + 3 * 5},0,64,18`)
}
function check32_48_72_64() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * 5},0,72,18`)
    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * 5},0,64,18`)
}
function checkColHead32_48_72_64() {
    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(headColInfo(1)).to.equal(`#2:${32 + 5},0,48,18`)
    expect(headColInfo(2)).to.equal(`#3:${32 + 48 + 2 * 5},0,72,18`)
    expect(headColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * 5},0,64,18`)
}
function check32_48_72_64_seamless() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${32 + 4},0,48,18`)
    expect(bodyColInfo(2)).to.equal(`#3:${32 + 48 + 2 * 4},0,72,18`)
    expect(bodyColInfo(3)).to.equal(`#4:${32 + 48 + 72 + 3 * 4},0,64,18`)
}
function check32_64_48_72() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
    expect(bodyColInfo(2)).to.equal(`#3:${32 + 64 + 2 * 5},0,48,18`)
    expect(bodyColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * 5},0,72,18`)
}
function checkColHead32_64_48_72() {
    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(headColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
    expect(headColInfo(2)).to.equal(`#3:${32 + 64 + 2 * 5},0,48,18`)
    expect(headColInfo(3)).to.equal(`#4:${32 + 64 + 48 + 3 * 5},0,72,18`)
}
function check32_64() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
}
function checkColHead32_64() {
    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(headColInfo(1)).to.equal(`#2:${32 + 5},0,64,18`)
}
function check32_64_remove_head() {
    expect(bodyColInfo(0)).to.equal(`#3:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)
}
function checkColHead32_64_remove_head() {
    expect(headColInfo(0)).to.equal(`#3:0,0,32,18`)
    expect(headColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)
}
function check32_64_remove_middle() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)
}
function checkColHead32_64_remove_middle() {
    expect(headColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(headColInfo(1)).to.equal(`#4:${32 + 5},0,64,18`)
}
function check32_64_remove_seamless() {
    expect(bodyColInfo(0)).to.equal(`#1:0,0,32,18`)
    expect(bodyColInfo(1)).to.equal(`#4:${32 + 4},0,64,18`)
}