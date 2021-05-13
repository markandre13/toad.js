import { expect, use } from "chai"
use(require('chai-subset'))

import { TextView } from "../../src/toad"
import { findScrollableParent, isScrollable } from "../../src/scrollIntoView"
import { BookTableScene, Book } from "./BookTableScene"

describe("toad.js", function() {
    describe("table", function() {
        describe("class TableView", function() {
            let scene: BookTableScene
            let rows: HTMLCollection

            this.beforeEach( async function() {
                scene = new BookTableScene()
                rows = scene.table.bodyBody.children
                expect(rows.length).to.equal(8+1)
            })

            describe("update view when model changes", function() {
                xit("cell value changes", function() {
                    // missing
                })
                describe("insert row", function() {
                    it("single row", async function() {
                        const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                        scene.model.insert(3, newBook)
                        await scene.sleep()

                        expect(rows.length).to.equal(9+1)
                        expect((rows[3+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook.title)
                        expect((rows[3+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook.author)
                        expect((rows[3+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook.year}`)
                    })
                    it("multiple rows", async function() {
                        const newBook0 = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                        const newBook1 = new Book("Master of the World", "Jules Verne", 1904)
                        scene.model.insert(3, [newBook0, newBook1])
                        await scene.sleep()

                        expect(rows.length).to.equal(10+1)
                        expect((rows[3+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook0.title)
                        expect((rows[3+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook0.author)
                        expect((rows[3+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook0.year}`)
                        expect((rows[4+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook1.title)
                        expect((rows[4+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook1.author)
                        expect((rows[4+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook1.year}`)
                    })
                })
                describe("delete row", function() {                    
                    it("single row", async function(){
                        // FIXME!!! rowAnimationHeight isn't checked by any of the tests anymore...
                        // or... VariableRowHeight.spec.ts covers that...
                        scene.model.remove(2, 2)
                        await scene.sleep()

                        expect(rows.length).to.equal(6+1)
                        expect((rows[1+1].childNodes[0] as HTMLElement).innerText).to.equal("Stranger In A Strange Land")
                        expect((rows[2+1].childNodes[0] as HTMLElement).innerText).to.equal("2001: A Space Odyssey")
                    })
                    it("multiple rows", async function(){
                        scene.model.remove(2)
                        await scene.sleep()

                        expect(rows.length).to.equal(7+1)
                        expect((rows[1+1].childNodes[0] as HTMLElement).innerText).to.equal("Stranger In A Strange Land")
                        expect((rows[2+1].childNodes[0] as HTMLElement).innerText).to.equal("Rendezvous with Rama")
                    })
                })
            })

            describe("user interface events", function() {
                it("mousedown on a cell updates the selection model", function() {
                    scene.mouseDownAtCell(2, 1)
                    expect(scene.selectionModel.col).equals(2)
                    expect(scene.selectionModel.row).equals(1)

                    scene.mouseDownAtCell(0, 2)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(2)
                })

                it("mousedown on a cell makes the cell editable", function() {
                    scene.mouseDownAtCell(2, 1)
                    scene.expectInputOverlayToEqual("1961")

                    scene.mouseDownAtCell(0, 2)
                    scene.expectInputOverlayToEqual("The Fountains of Paradise")
                })

                it("scroll selected cell into view", async function() {
                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()
                    scene.expectScrollAt(0, 0)

                    scene.mouseDownAtCell(7, 1)                   
                    await scene.sleep()
                    scene.expectScrollAt(225, 0)
                })

                it("tab goes to the next cell", function() {
                    scene.mouseDownAtCell(0, 0)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendTab()
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("tab at end of row goes to head of next row", function() {
                    scene.mouseDownAtCell(9, 0)
                    expect(scene.selectionModel.col).equals(9)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendTab()
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(1)
                })

                it("shift tab goes to the previous cell", function() {
                    scene.mouseDownAtCell(1, 0)
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendShiftTab()
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("shift tab at head of row goes to last cell of previous row", function() {
                    scene.mouseDownAtCell(0, 1)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(1)

                    scene.sendShiftTab()
                    expect(scene.selectionModel.col).equals(9)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("cursor up goes to the cell above", function() {
                    scene.mouseDownAtCell(1, 1)
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(1)

                    scene.sendArrowUp()
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("cursor down goes to the cell below", function() {
                    scene.mouseDownAtCell(1, 1)
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(1)

                    scene.sendArrowDown()
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(2)
                })
            })

            describe("UX finetuning", function() {

                // ON SAFARI, WHEN
                //   TableView.goToCell(element: HTMLTableDataCellElement | undefined)
                // calls
                //   this.prepareInputOverlayForCell(element)
                // then
                //   TableView.bodyDiv.scroll[Left|Top]
                // is modified
                // THEREFORE
                //   goToCell must save and restore bodyDiv's scroll position
                xit("GIVEN 2nd row selected, 1st row visible WHEN 1st row click THEN do not scroll", async function() {

                    const cell00 = scene.table.getCellAt(0, 0)
                    const body = findScrollableParent(cell00)!

                    console.log(`#0 bodyDiv @ (${body.scrollLeft}, ${body.scrollTop})`)
                    scene.mouseDownAtCell(0, 1)
                    await scene.sleep()

                    expect(isScrollable(body)).to.be.true        
                    console.log(`#1 bodyDiv @ (${body.scrollLeft}, ${body.scrollTop})`)

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()
                    console.log(`#2 bodyDiv @ (${body.scrollLeft}, ${body.scrollTop})`)
                })

                it("input overlay is at correct position after insert row below selection", async function() {
                    scene.mouseDownAtCell(0, 3)

                    scene.clickTableToolAddRowBelow()
                    await scene.sleep()

                    // selection hasn't changed
                    expect(scene.selectionModel.row).to.equal(3)

                    scene.expectInputOverlayAt(0, 3)
                })

                it("input overlay is at correct position after insert row above selection", async function() {
                    scene.mouseDownAtCell(0, 3)

                    scene.clickTableToolAddRowAbove()
                    await scene.sleep()

                    // selection moved downwards
                    expect(scene.selectionModel.row).to.equal(4)

                    scene.expectInputOverlayAt(0, 4)
                })

                // keyboard and scroll
                // fast sequence and scroll

                it("handle horizontal scrolling when tab is pressed before scroll animation is finished", async function() {
                    this.timeout(15000)

                    // send tab keys in an interval slower than the scroll animation
                    // and remember the horizontal scroll position
                    const expectedScrollX = new Array<number>()
                    for(let i=0; i<10; ++i) {
                        if (i===0)
                            scene.mouseDownAtCell(0, 0)
                        else
                            scene.sendTab()
                        await scene.sleep()
                        expectedScrollX.push(scene.table.bodyDiv.scrollLeft)
                        // console.log(`${i}: ${scene.table.bodyDiv.scrollLeft}`)
                    }

                    // select last visible cell on the right in the 1st row
                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()
                    scene.mouseDownAtCell(3, 0)
                    await scene.sleep()
                    scene.expectScrollAt(expectedScrollX[3], 0)

                    // send 4 tab keys in an interval faster than the scroll animation
                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(5000)

                    // expect the correct cell being selected
                    expect(scene.selectionModel.col).equals(7)
                    expect(scene.selectionModel.row).equals(0)

                    // expect scroll x to be at that field
                    scene.expectScrollAt(expectedScrollX[7], 0)
                })
            })
        })
    })
})


