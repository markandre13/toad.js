import { expect, use } from "chai"
use(require('chai-subset'))

import { BookTableScene, Book } from "./BookTableScene"

describe("toad.js", function() {
    describe("table", function() {
        describe("class TableView", function() {
            let scene: BookTableScene

            this.beforeEach( async function() {
                scene = new BookTableScene()
                // await scene.sleep()                
            })

            describe.only("update view when model changes", function() {
                describe("single row", function() {
                    it("insert", async function() {
                        const rows = scene.table.bodyBody.children

                        expect(scene.model.data.length).to.equal(8)
                        expect(rows.length).to.equal(8+1)

                        const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                        scene.model.addRowAbove(3, newBook)
                        await scene.sleep()

                        // TODO: this test should be in ArrayTableModel
                        expect(scene.model.data.length).to.equal(9)
                        expect(scene.model.data[3]).to.equal(newBook)

                        expect(rows.length).to.equal(9+1)
                        expect((rows[3+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook.title)
                        expect((rows[3+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook.author)
                        expect((rows[3+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook.year}`)
                    })
                    xit("delete", function(){})
                })
                describe("two rows", function() {
                    it.only("insert", async function() {
                        const rows = scene.table.bodyBody.children

                        expect(scene.model.data.length).to.equal(8)
                        expect(rows.length).to.equal(8+1)

                        const newBook0 = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                        const newBook1 = new Book("Master of the World", "Jules Verne", 1904)
                        scene.model.addRowAbove(3, [newBook0, newBook1])
                        await scene.sleep()

                        // TODO: this test should be in ArrayTableModel
                        // scene.model.data.forEach( (row, index)=> {
                        //     console.log(`${index}: ${row}`)
                        // })
                        expect(scene.model.data.length).to.equal(10)
                        expect(scene.model.data[3]).to.equal(newBook0)
                        expect(scene.model.data[4]).to.equal(newBook1)

                        expect(rows.length).to.equal(10+1)
                        expect((rows[3+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook0.title)
                        expect((rows[3+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook0.author)
                        expect((rows[3+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook0.year}`)
                        expect((rows[4+1].childNodes[0] as HTMLElement).innerText).to.equal(newBook1.title)
                        expect((rows[4+1].childNodes[1] as HTMLElement).innerText).to.equal(newBook1.author)
                        expect((rows[4+1].childNodes[2] as HTMLElement).innerText).to.equal(`${newBook1.year}`)
                    })
                    xit("delete", function(){})
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

                // keyboard and scroll
                // fast sequence and scroll

                it("overlapping scrolls", async function() {
                    this.timeout(15000)

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

                    scene.mouseDownAtCell(0, 0)
                    await scene.sleep()
                    scene.mouseDownAtCell(3, 0)
                    await scene.sleep()
                    scene.expectScrollAt(expectedScrollX[3], 0)

                    // console.log("---------------------------------------------------------------------------------------")

                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(50)
                    scene.sendTab()
                    await scene.sleep(5000)

                    expect(scene.selectionModel.col).equals(7)
                    expect(scene.selectionModel.row).equals(0)

                    scene.expectScrollAt(expectedScrollX[7], 0)
                })
            })
        })
    })
})


