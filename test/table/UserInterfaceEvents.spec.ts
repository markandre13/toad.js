import { expect, use } from "chai"
use(require('chai-subset'))

import { TextView } from "../../src/toad"
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

                it.only("input field updates after adding row", async function() {
                    scene.mouseDownAtCell(0, 3)

                    const button = document.querySelector("toad-tabletool")!
                        .shadowRoot!.querySelector("button[title='add row below']")!
                    // console.log(button)

                    console.log(scene.table.inputOverlay.clientTop);
                    console.log(scene.table.inputOverlay.clientLeft);
                    console.log(scene.table.inputOverlay.style.top);
                    console.log(scene.table.inputOverlay.style.left);

                    console.log(scene.table.inputOverlay.getBoundingClientRect().toJSON())

                    const e = new MouseEvent("click", {
                        bubbles: true,
                        relatedTarget: button
                    })
                    console.log("-------------------------- click -------------------------")
                    button.dispatchEvent(e)
                    await scene.sleep()
                    console.log("-------------------------- clicked -------------------------")
                    console.log(scene.table.inputOverlay.style.top);
                    console.log(scene.table.inputOverlay.style.left);
                    console.log(scene.table.inputOverlay.getBoundingClientRect().toJSON())
                    // console.log(scene.table.inputOverlay.children[0])

                    console.log(scene.table.rowAnimationHeight)

                    // scene.table.inputOverlay.style.top = `${-96 - scene.table.rowAnimationHeight}px`
                    // scene.table.inputOverlay.style.top = `${-153 + 2 * scene.table.rowAnimationHeight}px`


                    // issues
                    // * the input overlay is scrolling down along with the inserted row
                    //   if it stay there, it would be okay...

                    // the trick is to update (or clear the input overlay when the model changes?)
                    // or move the input overlay as if the model change was initiated by another user
                    let text = scene.table.inputOverlay.children[0] as TextView
                    expect(text.tagName).to.equal("TOAD-TEXT")
                    // expect(text.value).to.equal("")
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


