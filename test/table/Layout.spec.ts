// tests for <toad-table />'s integration into the page
import { expect, use } from "chai"
use(require('chai-subset'))

import { TestTableScene } from "./TestTableScene"

describe("toad.js", function () {
    describe("table", function () {
        describe("table should behave like an inline-block", function() {
            it("???", async function() {
                const scene = new TestTableScene()
                await scene.sleep()
                scene.expectTableLayout({
                    hasHorizontalScrollBar: false,
                    hasVerticalScrollBar: false
                })
            })

            it("a table with no specific width and height in parent larger than needed", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 512px; height: 512px;`
                const tableStyle = ``
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({
                    hasHorizontalScrollBar: false,
                    hasVerticalScrollBar: false
                })
            })

            it("a table with no specific width and height in parent smaller than needed", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 128px; height: 64px;`
                const tableStyle = ``
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                // the created HTML exceeds the height hence we also place no expectations on the table
                expect(expectedBounds.height).to.greaterThan(64 + 10)

                scene.expectTableLayout({
                    withinHostBounds: {
                        x: expectedBounds.x,
                        y: expectedBounds.y,
                        width: expectedBounds.width,
                        height: undefined
                    }
                })
            })

            it("via style: width: 200px; height: 200px;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 320px; height: 320px;`
                const tableStyle = `width: 200px; height: 200px;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({
                    withinHostBounds: expectedBounds
                })
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

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({
                    withinHostBounds: expectedBounds
                })
            })

            // both span and table exceed the surrounding div with the border. not sure about this
            it("width: 100%; height: 100%;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 200px; height: 200px;`
                const tableStyle = `width: 100%; height: 100%;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({
                    withinHostBounds: expectedBounds
                })
            })

            it("position: absolute; left: 0; right: 0; top: 0; bottom: 0;", async function() {
                const frameFrag = `<div style="border: 1px #000 solid; position: relative; top: 30px; left: 30px;`
                const frameStyle = `width: 200px; height: 200px;`
                const tableStyle = `position: absolute; left: 0; right: 0; top: 0; bottom: 0;`
                document.body.innerHTML = `${frameFrag}${frameStyle}">${TestTableScene.createHTML(tableStyle, 50)}</div>`
                const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!

                const scene = new TestTableScene({
                    html: `${frameFrag}${frameStyle}"><toad-table model='books' style="${tableStyle}"></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({
                    withinHostBounds: expectedBounds
                })
            })

            it("when neither table nor parent have a size, use a default", async function() {
                const scene = new TestTableScene({
                    html: `<div><toad-table model='books'></toad-table></div>`
                })
                await scene.sleep(10)

                scene.expectTableLayout({})
            })
        })
        describe("keep headers up to date", async () => {
            it.only("column and row headers are updated after changing the model", async function() {
                const scene = new TestTableScene()

                // const expectedBounds = document.querySelector("span")?.getBoundingClientRect()!
                // scene.expectTableLayout({
                //     hasHorizontalScrollBar: false,
                //     hasVerticalScrollBar: false
                // })
                scene.model.insert(5, scene.model.createRow())
                await scene.sleep()
            })
        })
    })
})
