import { expect } from "chai"
import {
    TableView,
    SelectionModel, TextView, TextModel, TableEvent, TableEventType,
    bind, unbind, TableAdapter, ArrayTableModel
} from "../../src/toad"
import { setAnimationFrameCount } from "../../src/scrollIntoView"

export class BookTableScene {

    table: TableView
    model: BookTableModel
    selectionModel: SelectionModel

    constructor() {
        setAnimationFrameCount(0)
        unbind()
        TableAdapter.unbind()
        
        document.body.innerHTML = ""

        TableAdapter.register(BookTableAdapter, BookTableModel, Book)

        this.model = BookTableScene.createBookModel()
        bind("books", this.model)

        this.selectionModel = new SelectionModel()
        bind("books", this.selectionModel)

        document.body.innerHTML = `<toad-tabletool></toad-tabletool><div style="width: 480px"><toad-table model='books'></toad-table></div>`
        this.table = document.body.children[1].children[0] as TableView
        expect(this.table.tagName).to.equal("TOAD-TABLE")

        setAnimationFrameCount(400)
    }

    static createBookModel() {
        const data = new Array<Book>()
        const init = [
            ["The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966],
            ["Stranger In A Strange Land", "Robert A. Heinlein", 1961],
            ["The Fountains of Paradise", "Arthur C. Clarke", 1979],
            ["Rendezvous with Rama", "Arthur C. Clarke", 1973],
            ["2001: A Space Odyssey", "Arthur C. Clarke", 1968],
            ["Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
            ["A Scanner Darkly", "Philip K. Dick", 1977],
            ["Second Variety", "Philip K. Dick", 1953]
        ].forEach((e) => {
            data.push(new Book(e[0] as string, e[1] as string, e[2] as number))
        })
        return new BookTableModel(data)
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

export class Book {
    title: string
    author: string
    year: number
    constructor(title: string = "", author: string = "", year: number = 1970) {
        this.title = title
        this.author = author
        this.year = year
    }
    toString(): string {
        return `Book("${this.title}", "${this.author}", ${this.year})`
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
        switch (col) {
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

    createEditor(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        const model = new TextModel(text)
        model.modified.add(() => {
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
        switch (col) {
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
        switch (col) {
            case 0: this.model.data[row].title = text; break
            case 1: this.model.data[row].author = text; break
            case 2: this.model.data[row].year = Number.parseInt(text); break
        }
        // FIXME: let table handle this event and maybe also provide (col, row)
        this.model.modified.trigger(new TableEvent(TableEventType.CHANGED, 0, 0))
    }
}
