import { expect } from "chai"
import {
    TableView,
    SelectionModel, TextView, TextModel, TableEvent, TableEventType,
    bind, unbind, TableAdapter, ArrayTableModel
} from "@toad"
import { setAnimationFrameCount } from "@toad/scrollIntoView"
import { throws } from "assert"

interface Options {
    html?: string
}

export class TestTableScene {
    table: TableView
    model: TestTableModel
    selectionModel: SelectionModel

    constructor(options: Options = {}) {
        setAnimationFrameCount(0)
        unbind()
        TableAdapter.unbind()       
        document.body.innerHTML = ""

        TableAdapter.register(TestTableAdapter, TestTableModel, TestRow)

        this.model = new TestTableModel()
        
        bind("books", this.model)

        this.selectionModel = new SelectionModel()
        bind("books", this.selectionModel)

        document.body.innerHTML = options.html !== undefined ? options.html : `<toad-tabletool></toad-tabletool><div style="width: 480px"><toad-table model='books'></toad-table></div>`
        this.table = document.querySelector("toad-table") as TableView
        expect(this.table.tagName).to.equal("TOAD-TABLE")

        setAnimationFrameCount(400)
    }

    static createHTMLTable(style = ""): string {
        let html = `<table border="1" style="${style}"><thead><tr>`
        for(let column=0; column<5; ++column)
            html += `<th>COLUMN:${column}</th>`
        for(let row=0; row<10; ++row) {
            html += `</tr></thead><tbody><tr>`
            for(let column=0; column<5; ++column) {
                html += `<td>CELL:${column}:${row}</td>`
            }
        }
        html += `</tr></tbody></table>`
        return html
    }
    static createHTML(style = "", amount = 50): string {
        return `<span style="border: 1px solid #000; background: #f80; display: inline-block; overflow: auto;${style}">${"Lorem ipsum! ".repeat(amount)}</span>`
    }

    sleep(milliseconds: number = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('success')
            }, milliseconds)
        })
    }

    mouseDownAtCell(col: number, row: number) {
        let cell = this.table.getCellAt(col, row)!
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

    clickTableToolAddRowBelow() {
        const button = document.querySelector("toad-tabletool")!
            .shadowRoot!.querySelector("button[title='add row below']")!
        const e = new MouseEvent("click", {
            bubbles: true,
            relatedTarget: button
        })
        button.dispatchEvent(e)
    }

    clickTableToolAddRowAbove() {
        const button = document.querySelector("toad-tabletool")!
            .shadowRoot!.querySelector("button[title='add row above']")!
        const e = new MouseEvent("click", {
            bubbles: true,
            relatedTarget: button
        })
        button.dispatchEvent(e)
    }

    clickTableToolDeleteRow() {
        const button = document.querySelector("toad-tabletool")!
            .shadowRoot!.querySelector("button[title='delete row']")!
        const e = new MouseEvent("click", {
            bubbles: true,
            relatedTarget: button
        })
        button.dispatchEvent(e)
    }

    expectInputOverlayToEqual(text: string) {
        // @ts-ignore
        expect(this.table.inputOverlay.children[0].value).equals(text)
    }

    expectScrollAt(x: number, y: number) {
        expect(this.table.bodyDiv.scrollLeft, "x").equals(x)
        expect(this.table.bodyDiv.scrollTop, "y").equals(y)
    }

    expectInputOverlayAt(col: number, row: number) {
        const c = {
            top: this.table.inputOverlay.style.top,
            left: this.table.inputOverlay.style.left,
            width: this.table.inputOverlay.style.width,
            height: this.table.inputOverlay.style.height
        }
        const cell = this.table.getCellAt(col, row)
        this.table.inputOverlay.adjustToCell(cell)
        const e = {
            top: this.table.inputOverlay.style.top,
            left: this.table.inputOverlay.style.left,
            width: this.table.inputOverlay.style.width,
            height: this.table.inputOverlay.style.height
        }
        expect(c, `expected (${e.left}, ${e.top}, ${e.width}, ${e.height}), got (${c.left}, ${c.top}, ${c.width}, ${c.height})`).to.deep.equal(e)
    }
}

export class TestRow {
    cells: string[] = []
    constructor(row: number = 777) {
        for(let col=0; col<5; ++col)
            this.cells.push(`CELL:${col}:${row}`)
    }
}

function createTestData() {
    const rows: TestRow[] = []
    for(let row=0; row<10; ++row)
        rows.push(new TestRow(row))
    return rows
}

class TestTableModel extends ArrayTableModel<TestRow> {
    constructor() {
        super(createTestData(), TestRow)        
    }
    get colCount(): number { return this.data[0].cells.length }
}

class TestTableAdapter extends TableAdapter {
    model?: TestTableModel

    override setModel(model: TestTableModel) {
        this.model = model
    }

    override getColumnHead(col: number): Node | undefined {
        return document.createTextNode(`COL${col}`)
    }

    override getRowHead(row: number) {
        return document.createTextNode(`${row}`)
    }

    override displayCell(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        return document.createTextNode(text)
    }

    override createEditor(col: number, row: number): Node | undefined {
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
        return this.model.data[row].cells[col]
    }

    private setField(col: number, row: number, text: string): void {
        if (!this.model)
            return
        this.model.data[row].cells[col] = text
        this.model.modified.trigger(new TableEvent(TableEventType.CELL_CHANGED, col, row))
    }
}
