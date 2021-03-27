import { expect, use } from "chai"
use(require('chai-subset'))

import { 
    TableView, 
    SelectionModel, TextView, TextModel, TableEvent, TableEventType,
    bind, unbind, TableAdapter, ArrayTableModel
} from "../../src/toad"

import { setAnimationFrameCount } from "../../src/scrollIntoView"

describe("toad.js", function() {
    describe("table", function() {
        describe("class TableView", function() {
            let scene: BookTableScene

            this.beforeAll( async function() {
                scene = new BookTableScene()
                // await scene.sleep()                
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

class BookTableScene {

    table: TableView
    selectionModel: SelectionModel

    constructor() {
        try {
        setAnimationFrameCount(0)
        unbind()
        document.body.innerHTML = ""

        TableAdapter.register(BookTableAdapter, BookTableModel, Book)

        const data = new Array<Book>()
        const init = [
            [ "The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966 ],
            [ "Stranger In A Strange Land", "Robert A. Heinlein", 1961 ],
            [ "The Fountains of Paradise", "Arthur C. Clarke", 1979],
            [ "Rendezvous with Rama", "Arthur C. Clarke", 1973 ],
            [ "2001: A Space Odyssey", "Arthur C. Clarke", 1968 ],
            [ "Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
            [ "A Scanner Darkly", "Philip K. Dick", 1977],
            [ "Second Variety", "Philip K. Dick", 1953]
        ].forEach( (e) => {
            data.push(new Book(e[0] as string, e[1] as string, e[2] as number))
        })
        const books = new BookTableModel(data)
        bind("books", books)

        this.selectionModel = new SelectionModel()
        bind("books", this.selectionModel)

        document.body.innerHTML = `<toad-tabletool></toad-tabletool><div style="width: 480px"><toad-table model='books'></toad-table></div>`
        this.table = document.body.children[1].children[0] as TableView
        expect(this.table.tagName).to.equal("TOAD-TABLE")

        setAnimationFrameCount(400)
        }
        catch(e) {
            console.log("============================================")
            console.log(e.trace)
            throw e
        }
    }

    sleep(milliseconds: number = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('success')
            }, milliseconds)
        })
    }

    mouseDownAtCell(col: number, row: number) {
        let cell = this.table.getCellAt(col, row)
        const e = new MouseEvent("mousedown", {
            bubbles: true,
            relatedTarget: cell
        })
        cell.dispatchEvent(e)
    }

    sendTab() {
        const inp = this.table.inputOverlay.children[0]
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab"
        })
        inp.dispatchEvent(e)
    }

    sendShiftTab() {
        const inp = this.table.inputOverlay.children[0]
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            shiftKey: true,
            key: "Tab"
        })
        inp.dispatchEvent(e)
    }

    sendArrowUp() {
        const inp = this.table.inputOverlay.children[0]
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "ArrowUp"
        })
        inp.dispatchEvent(e)
    }

    sendArrowDown() {
        const inp = this.table.inputOverlay.children[0]
        const e = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "ArrowDown"
        })
        inp.dispatchEvent(e)
    }

    expectInputOverlayToEqual(text: string) {
        // @ts-ignore
        expect(this.table.inputOverlay.children[0].value).equals(text)
    }

    expectScrollAt(x: number, y: number) {
        expect(this.table.bodyDiv.scrollLeft, "x").equals(x)
        expect(this.table.bodyDiv.scrollTop, "y").equals(y)
    }
}

class Book {
    title: string
    author: string
    year: number
    constructor(title: string = "", author: string = "", year: number = 1970) {
        this.title = title
        this.author = author
        this.year = year
    }
}

class BookTableModel extends ArrayTableModel<Book> {
    constructor(data: Array<Book>) {
        super(data, Book)
     }
    get colCount(): number { return 10 }
}

class BookTableAdapter extends TableAdapter {
    model?: BookTableModel

    setModel(model: BookTableModel) {
        this.model = model
    }

    getColumnHead(col: number): Node | undefined {
        switch(col) {
            case 0: return document.createTextNode("Title")
            case 1: return document.createTextNode("Author")
            case 2: return document.createTextNode("Year")
        }
        return document.createTextNode("x")
    }

    getRowHead(row: number) {
        return document.createTextNode(`${row}`)
    }

    displayCell(col: number, row: number): Node | undefined {       
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        return document.createTextNode(text)
    }

    editCell(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        const model = new TextModel(text)
        model.modified.add( () => {
            this.setField(col, row, model.value)
        })
        const view = new TextView()
        view.setModel(model)
        return view
    }

    private getField(col: number, row: number): string | undefined {
        if (!this.model)
            return undefined
        let text: string | undefined
        switch(col) {
            case 0: text = this.model.data[row].title; break
            case 1: text = this.model.data[row].author; break
            case 2: text = `${this.model.data[row].year}`; break
            default: text = `dummy${col}:${row}`
        }
        return text
    }

    private setField(col: number, row: number, text: string): void {
        // console.log(`BookTableAdapter.setField(${col}, ${row}, "${text}")`)
        if (!this.model)
            return
        switch(col) {
            case 0: this.model.data[row].title = text; break
            case 1: this.model.data[row].author = text; break
            case 2: this.model.data[row].year = Number.parseInt(text); break
        }
        // FIXME: let table handle this event and maybe also provide (col, row)
        this.model.modified.trigger(new TableEvent(TableEventType.CHANGED, 0, 0))
    }
}

