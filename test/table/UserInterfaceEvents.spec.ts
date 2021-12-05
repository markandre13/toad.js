import { expect } from "@esm-bundle/chai"

import { Text } from "@toad"
import { findScrollableParent, isScrollable } from "src/util/scrollIntoView"
import { BookTableScene } from "./BookTableScene"
import { TreeViewScene } from "./TreeViewScene"
import { TestRow, TestTableScene } from "./TestTableScene"

describe("view", function() {
    describe("table", function() {
        describe("class TableView", function() {
            describe("update view when model changes", function() {
                describe("after cell was edited, update cell and model after focus moved away via", function() {
                    it("mouse", async function() {
                        const scene = new TestTableScene()
                        const rows = scene.table.bodyBody.children

                        scene.table.focus()
                        scene.mouseDownAtCell(0, 0)

                        const textView = scene.table.editView as Text
                        textView.value = "XXX"
                        await scene.sleep()

                        scene.mouseDownAtCell(0, 1)

                        expect(scene.model.data[0].cells[0]).to.equal("XXX")
                        expect((rows[0 + 1].childNodes[0] as HTMLElement).innerText).to.equal("XXX")
                    })
                    it("keyboard", async function() {
                        const scene = new TestTableScene()
                        const rows = scene.table.bodyBody.children

                        scene.table.focus()
                        scene.mouseDownAtCell(0, 0)

                        const textView = scene.table.editView as Text
                        textView.value = "XXX"
                        await scene.sleep()

                        scene.sendArrowDown()

                        expect(scene.model.data[0].cells[0]).to.equal("XXX")
                        expect((rows[0 + 1].childNodes[0] as HTMLElement).innerText).to.equal("XXX")
                    })
                    // TODO: test this when just a cell in the model changes
                    // TODO: test this with two table views
                })
                describe("insert row", function() {
                    describe("basic delete operations", function() {
                        it("single row", async function() {
                            const scene = new TestTableScene()
                            const rows = scene.table.bodyBody.children

                            const newRow = new TestRow(101)
                            scene.model.insert(3, newRow)
                            await scene.sleep()

                            expect(rows.length).to.equal(11+1)
                            expect((rows[3 + 1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:101")
                            expect((rows[3 + 1].childNodes[4] as HTMLElement).innerText).to.equal("CELL:4:101")

                            expect(scene.table.rowAnimationHeight).to.equal(rows[3+1].clientHeight)
                        })
                        it("multiple rows", async function() {
                            const scene = new TestTableScene()
                            const rows = scene.table.bodyBody.children

                            const newRow0 = new TestRow(101)
                            const newRow1 = new TestRow(102)
                            scene.model.insert(3, [newRow0, newRow1])
                            await scene.sleep()

                            expect(rows.length).to.equal(12+1)
                            expect((rows[3 + 1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:101")
                            expect((rows[3 + 1].childNodes[4] as HTMLElement).innerText).to.equal("CELL:4:101")
                            expect((rows[4 + 1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:102")
                            expect((rows[4 + 1].childNodes[4] as HTMLElement).innerText).to.equal("CELL:4:102")

                            expect(scene.table.rowAnimationHeight).to.equal(rows[3+1].clientHeight + rows[4+1].clientHeight)
                        })
                        it("multiple rows in tree", async function() {
                            const scene = new TreeViewScene()
                            const rows = scene.table.bodyBody.children

                            // close
                            const previousHeight = rows[1+1].clientHeight + rows[1+2].clientHeight
                            scene.mouseDownAtCell(0, 1, 20, 5)
                            await scene.sleep()
                            expect(scene.table.rowAnimationHeight).to.equal(previousHeight)

                            // open
                            scene.mouseDownAtCell(0, 1, 20, 5)
                            await scene.sleep()
                            expect(scene.table.rowAnimationHeight).to.equal(previousHeight)
                        })
                        // // easier to check visually for now
                        // it.only("multiple rows in tree at table bottom", async function() {
                        //     const scene = new TreeViewScene({rowHeads: true})
                        //     const rows = scene.table.bodyBody.children

                        //     // close the 1st node
                        //     scene.mouseDownAtCell(0, 0, 5, 5)
                        //     await scene.sleep()

                        //     // close
                        //     const previousHeight = rows[1+2].clientHeight + rows[1+4].clientHeight
                        //     scene.mouseDownAtCell(0, 1, 5, 5)
                        //     await scene.sleep()
                        //     // expect(scene.table.rowAnimationHeight).to.equal(previousHeight)

                        //     // open
                        //     scene.mouseDownAtCell(0, 1, 5, 5)
                        //     await scene.sleep()
                        //     // expect(scene.table.rowAnimationHeight).to.equal(previousHeight)
                        // })
                    })
                    describe("interaction with the selection and input overlay", function() {
                        it("selection is BEFORE inserted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 3
                            await scene.sleep(0)

                            const newRow0 = new TestRow(101)
                            const newRow1 = new TestRow(102)
                            scene.model.insert(5, [newRow0, newRow1])
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(3)
                            scene.expectInputOverlayAt(0, 3)
                        })
                        it("selection is AT inserted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 3
                            await scene.sleep(0)

                            const newRow0 = new TestRow(101)
                            const newRow1 = new TestRow(102)
                            scene.model.insert(3, [newRow0, newRow1])
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(5)
                            scene.expectInputOverlayAt(0, 5)
                        })
                        it("selection is AFTER inserted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 5
                            await scene.sleep(0)

                            const newRow0 = new TestRow(101)
                            const newRow1 = new TestRow(102)
                            scene.model.insert(3, [newRow0, newRow1])
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(7)
                            scene.expectInputOverlayAt(0, 7)
                        })
                    })
                })
                describe("delete row", function() {
                    describe("basic delete operations", function() {
                        it("single rows", async function(){
                            const scene = new TestTableScene()
                            const rows = scene.table.bodyBody.children

                            scene.model.remove(2)
                            await scene.sleep()

                            expect(rows.length).to.equal(9+1)
                            expect((rows[1+1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:1")
                            expect((rows[2+1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:3")
                        })                 
                        it("multiple rows", async function(){
                            const scene = new TestTableScene()
                            const rows = scene.table.bodyBody.children

                            scene.model.remove(2, 2)
                            await scene.sleep()

                            expect(rows.length).to.equal(8+1)
                            expect((rows[1+1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:1")
                            expect((rows[2+1].childNodes[0] as HTMLElement).innerText).to.equal("CELL:0:4")
                        })
                    })
                    describe("interaction with the selection and input overlay", function() {
                        it("selection is BEFORE deleted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 3
                            await scene.sleep(0)

                            scene.model.remove(5, 3)
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(3)
                            scene.expectInputOverlayAt(0, 3)
                        })

                        it("selection is INSIDE AT HEAD of deleted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 4
                            await scene.sleep(0)

                            scene.model.remove(4, 2)
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(4)
                            scene.expectInputOverlayAt(0, 4)
                        })

                        it("selection is INSIDE deleted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 5
                            await scene.sleep(0)

                            scene.model.remove(4, 3)
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(4)
                            scene.expectInputOverlayAt(0, 4)
                        })

                        it("selection is INSIDE deleted area and there are NO FURTHER ROWS after the area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 7
                            await scene.sleep(0)

                            scene.model.remove(6, 4)
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(5)
                            scene.expectInputOverlayAt(0, 5)
                        })

                        it("selection is BEHIND deleted area", async function() {
                            const scene = new TestTableScene()
                            scene.mouseDownAtCell(0, 0)     // move focus to the table
                            await scene.sleep(0)
                            scene.selectionModel.row = 7
                            await scene.sleep(0)

                            scene.model.remove(2, 3)
                            await scene.sleep()

                            expect(scene.selectionModel.row).equals(4)
                            scene.expectInputOverlayAt(0, 4)
                        })

                    })
                })
            })

            describe("user interface events", function() {
                it("mousedown on a cell updates the selection model", function() {
                    const scene = new TestTableScene()

                    scene.mouseDownAtCell(2, 1)
                    expect(scene.selectionModel.col).equals(2)
                    expect(scene.selectionModel.row).equals(1)

                    scene.mouseDownAtCell(0, 2)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(2)
                })

                it("mousedown on a cell makes the cell editable", function() {
                    const scene = new TestTableScene()

                    scene.mouseDownAtCell(2, 1)
                    scene.expectInputOverlayToEqual("CELL:2:1")

                    scene.mouseDownAtCell(0, 2)
                    scene.expectInputOverlayToEqual("CELL:0:2")
                })

                it("scroll selected cell into view", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()
                    scene.expectScrollAt(0, 0)

                    scene.mouseDownAtCell(7, 1)                   
                    await scene.sleep()
                    scene.expectScrollAt(212, 0)
                })

                it("tab goes to the next cell", function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 0)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendTab()
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("tab at end of row goes to head of next row", function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(9, 0)
                    expect(scene.selectionModel.col).equals(9)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendTab()
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(1)
                })

                it("shift tab goes to the previous cell", function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(1, 0)
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)

                    scene.sendShiftTab()
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("shift tab at head of row goes to last cell of previous row", function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 1)
                    expect(scene.selectionModel.col).equals(0)
                    expect(scene.selectionModel.row).equals(1)

                    scene.sendShiftTab()
                    expect(scene.selectionModel.col).equals(9)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("cursor up goes to the cell above", function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(1, 1)
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(1)

                    scene.sendArrowUp()
                    expect(scene.selectionModel.col).equals(1)
                    expect(scene.selectionModel.row).equals(0)
                })

                it("cursor down goes to the cell below", function() {
                    const scene = new BookTableScene()

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
                    const scene = new BookTableScene()

                    const cell00 = scene.table.getCellAt(0, 0)!
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

                it("input overlay is at correct position after inserting row below selection", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 3)
                    await scene.sleep(1)

                    scene.clickTableToolAddRowBelow()
                    await scene.sleep()

                    // selection hasn't changed
                    expect(scene.selectionModel.row).to.equal(3) // // FIXME: separate test

                    scene.expectInputOverlayAt(0, 3)
                    expect(document.activeElement).to.equal(scene.table)
                    expect(scene.table.shadowRoot?.activeElement).to.equal(scene.table.editView)
                })

                it("input overlay is at correct position after inserting row above selection", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 3)
                    await scene.sleep(1)

                    scene.clickTableToolAddRowAbove()
                    await scene.sleep()

                    // selection moved downwards
                    expect(scene.selectionModel.row).to.equal(4) // FIXME: separate test

                    scene.expectInputOverlayAt(0, 4)
                    expect(document.activeElement).to.equal(scene.table)
                    expect(scene.table.shadowRoot?.activeElement).to.equal(scene.table.editView)
                })

                it("input overlay is at correct position after deleting row at selection", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 3)
                    await scene.sleep(1)

                    let textView = scene.table.editView as Text
                    expect(textView.value).to.equal("Rendezvous with Rama")

                    scene.clickTableToolDeleteRow()
                    await scene.sleep()

                    // selection hasn't changed
                    expect(scene.selectionModel.row).to.equal(3) // FIXME: separate test

                    textView = scene.table.editView as Text
                    expect(textView.value).to.equal("2001: A Space Odyssey")

                    scene.expectInputOverlayAt(0, 3)
                    expect(document.activeElement).to.equal(scene.table)
                    expect(scene.table.shadowRoot?.activeElement).to.equal(scene.table.editView)
                })

                xit("adding a row at the bottom has to be animated correctly")
                xit("after deleting multiple row, selection is at correct position")

                it("input overlay is at correct position after deleting row at selection in last row", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 6)
                    scene.sendArrowDown()
                    await scene.sleep(1)

                    scene.clickTableToolDeleteRow()
                    await scene.sleep()

                    expect(scene.selectionModel.row).to.equal(6)
                    scene.expectInputOverlayAt(0, 6)
                    expect(document.activeElement).to.equal(scene.table)
                    expect(scene.table.shadowRoot?.activeElement).to.equal(scene.table.editView)  
                })

                it("changing selection updates view", async function() {
                    const scene = new BookTableScene()

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep(1)
                    scene.selectionModel.row = 2

                    await scene.sleep(1)
                    scene.expectInputOverlayAt(0, 2)
                    expect(document.activeElement).to.equal(scene.table)
                    expect(scene.table.shadowRoot?.activeElement).to.equal(scene.table.editView)  
                })

                // keyboard and scroll
                // fast sequence and scroll

                it("handle horizontal scrolling when tab is pressed before scroll animation is finished", async function() {
                    const scene = new BookTableScene()

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
                        expectedScrollX.push(scene.table.scrollDiv.scrollLeft)
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

                it("don't mess up when opening/closing a tree view very fast", async function() {
                    const scene = new TreeViewScene()

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep(0)

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()

                    // this caused an exception earlier, additionally check the the numbers of visible rows
                })
            })
            
        })
    })
})
