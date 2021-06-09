// tests for <toad-table />'s integration in to the page
import { expect, use } from "chai"
use(require('chai-subset'))

import { TableView } from "@toad"
import { TestTableScene } from "./TestTableScene"

describe("toad.js", function () {
    describe("table", function () {
        describe.only("table should behave like an inline-block", function() {
            describe("without styling", function() {
                xit("doesn't exceed the parent's width", function() {
                    const scence = new TestTableScene({
                        html: `
                        <div style="
                            border: 1px #000 solid;
                            position: absolute;
                            top: 0;
                            bottom 0;
                            width: 320px;
                            height: 1024px;">
                        <toad-table model='books'></toad-table>
                        </div>`
                    })
                })
                xit("doesn't exceed the parent's height", function() {
                    const scence = new TestTableScene({
                        html: `
                        <div style="
                            border: 1px #000 solid;
                            position: absolute;
                            top: 0;
                            bottom 0;
                            width: 1024px;
                            height: 150px;">
                        <toad-table model='books'></toad-table>
                        </div>`
                    })
                })
            })

            it("a table with no specific width and height in parent larger than needed", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 512px; height: 512px;`
                const tableStyle = ``
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(undefined, table)
            })

            it("a table with no specific width and height in parent smaller than needed", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 128px; height: 128px;`
                const tableStyle = ``
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                // the created HTML is exceeds the height, but the width is right
                expectedBounds.height = expectedBounds.width

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(expectedBounds, table)
            })

            it("via style: width: 200px; height: 200px;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 320px; height: 320px;`
                const tableStyle = `width: 200px; height: 200px;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(expectedBounds, table)
            })

            it("via class: width: 200px; height: 200px;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 320px; height: 320px;`
                const tableStyle = `" class="foo`
                const s = document.createElement("style")
                s.innerText = `.foo {width: 200px; height: 200px;}`
                document.head.appendChild(s)
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(expectedBounds, table)
            })

            // both span and table exceed the surrounding div with the border. not sure about this
            it("width: 100%; height: 100%;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 200px; height: 200px;`
                const tableStyle = `width: 100%; height: 100%;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(expectedBounds, table)
            })

            it("position: absolute; left: 0; right: 0; top: 0; bottom: 0;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 200px; height: 200px;`
                const tableStyle = `position: absolute; left: 0; right: 0; top: 0; bottom: 0;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle, 50)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scence = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                const table = document.querySelector("toad-table") as TableView

                // let TableView perform it's layout
                await scence.sleep(10)

                expectTableLayout(expectedBounds, table)
            })
        })
    })
})

function b2s(r: DOMRect | undefined): string {
    if (r === undefined)
        return "undefined"
    return `${r.x},${r.y},${r.width},${r.height}`
}

function expectTableLayout(expectedBounds: DOMRect | undefined, table: TableView) {
    const outerBounds = table.getBoundingClientRect()
    const hostBounds = {
        x: table.clientLeft + outerBounds.x,
        y: table.clientTop + outerBounds.y,
        width: table.clientWidth,
        height: table.clientHeight
    } as DOMRect

    const columnHeadBounds = table.colHeadDiv.getBoundingClientRect()
    const rowHeadBounds = table.rowHeadDiv.getBoundingClientRect()
    const scrollBounds = table.bodyDiv.getBoundingClientRect()
    const bodyBounds = table.bodyTable.getBoundingClientRect()

    const verticalScrollbarWidth = scrollBounds.width - table.bodyDiv.clientWidth
    const horizontalScrollbarHeight = scrollBounds.height - table.bodyDiv.clientHeight
  
    // console.log(`expected = ${b2s(expectedBounds)}`)
    // console.log(`outer    = ${b2s(outerBounds)}`)
    // console.log(`host     = ${b2s(hostBounds)}`)
    // console.log(`column   = ${b2s(columnHeadBounds)}`)
    // console.log(`row      = ${b2s(rowHeadBounds)}`)
    // console.log(`scroll   = ${b2s(scrollBounds)}`)
    // console.log(`body     = ${b2s(bodyBounds)}`)
    // console.log(`scrollbar= ${verticalScrollbarWidth}, ${horizontalScrollbarHeight}`)

    // console.log(`width = ${rowHeadBounds.width} + ${scrollBounds.width} = ${rowHeadBounds.width + scrollBounds.width}`)
    // console.log(`height= ${columnHeadBounds.height} + ${scrollBounds.height} = ${columnHeadBounds.height + scrollBounds.height}`)

    if (expectedBounds)
        expect(b2s(expectedBounds)).to.equal(b2s(outerBounds))

    expect(columnHeadBounds.x).to.equal(hostBounds.x-1+rowHeadBounds.width)
    expect(columnHeadBounds.y).to.equal(hostBounds.y)
    expect(columnHeadBounds.width).to.equal(hostBounds.width - rowHeadBounds.width - verticalScrollbarWidth + 1)

    expect(rowHeadBounds.x).to.equal(hostBounds.x)
    expect(rowHeadBounds.y).to.equal(hostBounds.y+columnHeadBounds.height)
    expect(rowHeadBounds.height).to.equal(hostBounds.height - columnHeadBounds.height - horizontalScrollbarHeight)

    expect(scrollBounds.x).to.equal(hostBounds.x+rowHeadBounds.width)
    expect(scrollBounds.y).to.equal(hostBounds.y+columnHeadBounds.height)
    expect(scrollBounds.width).to.equal(hostBounds.width - rowHeadBounds.width)
    expect(scrollBounds.height).to.equal(hostBounds.height - columnHeadBounds.height)
}
