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

                expectTableLayout(expectedBounds, table)
            })

            it("a table with no specific width and height in parent smaller than needed", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 128px; height: 128px;`
                const tableStyle = ``
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                expectedBounds.width = 128 + 2
                expectedBounds.height = 128 + 2

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

function b2s(r: DOMRect): string {
    return `${r.x},${r.y},${r.width},${r.height}`
}

function expectTableLayout(expectedBounds: DOMRect, table: TableView) {
    const hostBounds = table.getBoundingClientRect()
    const columnHeadBounds = table.colHeadDiv.getBoundingClientRect()
    const rowHeadBounds = table.rowHeadDiv.getBoundingClientRect()
    const bodyBounds = table.bodyDiv.getBoundingClientRect()

    const verticalScrollbarWidth = bodyBounds.width - table.bodyDiv.clientWidth
    const horizontalScrollbarHeight = bodyBounds.height - table.bodyDiv.clientHeight

    expect(b2s(expectedBounds)).to.equal(b2s(hostBounds))

    // console.log(`host   = ${b2s(hostBounds)}`)
    // console.log(`column = ${b2s(columnHeadBounds)}`)
    // console.log(`row    = ${b2s(rowHeadBounds)}`)
    // console.log(`body   = ${b2s(bodyBounds)}`)

    expect(columnHeadBounds.x).to.equal(hostBounds.x+rowHeadBounds.width)
    expect(columnHeadBounds.y).to.equal(hostBounds.y+1)
    expect(columnHeadBounds.width).to.equal(hostBounds.width - rowHeadBounds.width - verticalScrollbarWidth - 2)

    expect(rowHeadBounds.x).to.equal(hostBounds.x+1)
    expect(rowHeadBounds.y).to.equal(hostBounds.y+columnHeadBounds.height+1)
    expect(rowHeadBounds.height).to.equal(hostBounds.height - columnHeadBounds.height - horizontalScrollbarHeight - 2)

    expect(bodyBounds.x).to.equal(hostBounds.x+rowHeadBounds.width+1)
    expect(bodyBounds.y).to.equal(hostBounds.y+columnHeadBounds.height+1)
    expect(bodyBounds.width).to.equal(hostBounds.width - rowHeadBounds.width - 2)
    expect(bodyBounds.height).to.equal(hostBounds.height - columnHeadBounds.height - 2)
}
