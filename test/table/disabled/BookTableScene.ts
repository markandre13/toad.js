// import { expect } from "@esm-bundle/chai"
// import {
//     TableView,
//     SelectionModel, Text, TextModel, TableEvent, TableEventType,
//     bindModel as bind, unbind, TableAdapter, ArrayTableModel
// } from "@toad"
// import { setAnimationFrameCount } from "src/util/scrollIntoView"

// export class BookTableScene {

//     table: TableView
//     data: Array<Book>
//     model: BookTableModel
//     selectionModel: SelectionModel

//     constructor() {
//         setAnimationFrameCount(0)
//         unbind()
//         TableAdapter.unbind()
        
//         document.body.innerHTML = ""

//         TableAdapter.register(BookTableAdapter, BookTableModel, Book)

//         this.data =  BookTableScene.createBookArray()
//         this.model = new BookTableModel(this.data)
        
//         bind("books", this.model)

//         this.selectionModel = new SelectionModel()
//         bind("books", this.selectionModel)

//         document.body.innerHTML = `<tx-tabletool></tx-tabletool><div style="width: 480px"><tx-table model='books'></tx-table></div>`
//         this.table = document.body.children[1].children[0] as TableView
//         expect(this.table.tagName).to.equal("TX-TABLE")

//         setAnimationFrameCount(400)
//     }

//     static createBookModel() {
//         const data =  BookTableScene.createBookArray()
//         return new BookTableModel(data)
//     }

//     static createBookArray() {
//         const data = new Array<Book>()
//         const init = [
//             ["The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966],
//             ["Stranger In A Strange Land", "Robert A. Heinlein", 1961],
//             ["The Fountains of Paradise", "Arthur C. Clarke", 1979],
//             ["Rendezvous with Rama", "Arthur C. Clarke", 1973],
//             ["2001: A Space Odyssey", "Arthur C. Clarke", 1968],
//             ["Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
//             ["A Scanner Darkly", "Philip K. Dick", 1977],
//             ["Second Variety", "Philip K. Dick", 1953]
//         ].forEach((e) => {
//             data.push(new Book(e[0] as string, e[1] as string, e[2] as number))
//         })
//         return data
//     }

//     sleep(milliseconds: number = 500) {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 resolve('success')
//             }, milliseconds)
//         })
//     }

//     mouseDownAtCell(col: number, row: number) {
//         let cell = this.table.getCellAt(col, row)!
//         const e = new MouseEvent("mousedown", {
//             bubbles: true,
//             relatedTarget: cell
//         })
//         cell.dispatchEvent(e)
//     }

//     sendTab() {
//         const inp = this.table.inputOverlay.children[0]
//         const e = new KeyboardEvent("keydown", {
//             bubbles: true,
//             key: "Tab"
//         })
//         inp.dispatchEvent(e)
//     }

//     sendShiftTab() {
//         const inp = this.table.inputOverlay.children[0]
//         const e = new KeyboardEvent("keydown", {
//             bubbles: true,
//             shiftKey: true,
//             key: "Tab"
//         })
//         inp.dispatchEvent(e)
//     }

//     sendArrowUp() {
//         const inp = this.table.inputOverlay.children[0]
//         const e = new KeyboardEvent("keydown", {
//             bubbles: true,
//             key: "ArrowUp"
//         })
//         inp.dispatchEvent(e)
//     }

//     sendArrowDown() {
//         const inp = this.table.inputOverlay.children[0]
//         const e = new KeyboardEvent("keydown", {
//             bubbles: true,
//             key: "ArrowDown"
//         })
//         inp.dispatchEvent(e)
//     }

//     clickTableToolAddRowBelow() {
//         const button = document.querySelector("tx-tabletool")!
//             .shadowRoot!.querySelector("button[title='add row below']")!
//         const e = new MouseEvent("click", {
//             bubbles: true,
//             relatedTarget: button
//         })
//         button.dispatchEvent(e)
//     }

//     clickTableToolAddRowAbove() {
//         const button = document.querySelector("tx-tabletool")!
//             .shadowRoot!.querySelector("button[title='add row above']")!
//         const e = new MouseEvent("click", {
//             bubbles: true,
//             relatedTarget: button
//         })
//         button.dispatchEvent(e)
//     }

//     clickTableToolDeleteRow() {
//         const button = document.querySelector("tx-tabletool")!
//             .shadowRoot!.querySelector("button[title='delete row']")!
//         const e = new MouseEvent("click", {
//             bubbles: true,
//             relatedTarget: button
//         })
//         button.dispatchEvent(e)
//     }

//     expectInputOverlayToEqual(text: string) {
//         // @ts-ignore
//         expect(this.table.inputOverlay.children[0].value).equals(text)
//     }

//     expectScrollAt(x: number, y: number) {
//         expect(this.table.scrollDiv.scrollLeft, "x").equals(x)
//         expect(this.table.scrollDiv.scrollTop, "y").equals(y)
//     }

//     expectInputOverlayAt(col: number, row: number) {
//         const c = {
//             top: this.table.inputOverlay.style.top,
//             left: this.table.inputOverlay.style.left,
//             width: this.table.inputOverlay.style.width,
//             height: this.table.inputOverlay.style.height
//         }
//         const cell = this.table.getCellAt(col, row)
//         this.table.inputOverlay.adjustToCell(cell)
//         const e = {
//             top: this.table.inputOverlay.style.top,
//             left: this.table.inputOverlay.style.left,
//             width: this.table.inputOverlay.style.width,
//             height: this.table.inputOverlay.style.height
//         }
//         expect(c, `expected (${e.left}, ${e.top}, ${e.width}, ${e.height}), got (${c.left}, ${c.top}, ${c.width}, ${c.height})`).to.deep.equal(e)
//     }
// }

// export class Book {
//     title: string
//     author: string
//     year: number
//     constructor(title: string = "", author: string = "", year: number = 1970) {
//         this.title = title
//         this.author = author
//         this.year = year
//     }
//     toString(): string {
//         return `Book("${this.title}", "${this.author}", ${this.year})`
//     }
// }

// class BookTableModel extends ArrayTableModel<Book> {
//     constructor(data: Array<Book>) {
//         super(data, Book)
//     }
//     get colCount(): number { return 10 }
// }

// class BookTableAdapter extends TableAdapter<BookTableModel> {

//     override getColumnHead(col: number): Node | undefined {
//         switch (col) {
//             case 0: return document.createTextNode("Title")
//             case 1: return document.createTextNode("Author")
//             case 2: return document.createTextNode("Year")
//         }
//         return document.createTextNode("x")
//     }

//     override getRowHead(row: number) {
//         return document.createTextNode(`${row}`)
//     }

//     override getDisplayCell(col: number, row: number): Node | undefined {
//         const text = this.getField(col, row)
//         if (text === undefined)
//             return undefined
//         return document.createTextNode(text)
//     }

//     override getEditorCell(col: number, row: number): Node | undefined {
//         const text = this.getField(col, row)
//         if (text === undefined)
//             return undefined
//         const model = new TextModel(text)
//         model.modified.add(() => {
//             this.setField(col, row, model.value)
//         })
//         const view = new Text()
//         view.setModel(model)
//         return view
//     }

//     private getField(col: number, row: number): string | undefined {
//         if (!this.model)
//             return undefined
//         let text: string | undefined
//         if (row<0 || row>=this.rowCount) {
//             const msg = `BookTableAdapter.getField(${col}, ${row}) is out of range, size is ${this.colCount}, ${this.rowCount}`
//             console.trace(msg)
//             throw Error(msg)
//         }
//         switch (col) {
//             case 0: text = this.model.data[row].title; break
//             case 1: text = this.model.data[row].author; break
//             case 2: text = `${this.model.data[row].year}`; break
//             default: text = `dummy${col}:${row}`
//         }
//         return text
//     }

//     private setField(col: number, row: number, text: string): void {
//         // console.log(`BookTableAdapter.setField(${col}, ${row}, "${text}")`)
//         if (!this.model)
//             return
//         // FIXME: hide data and let the model itself generate the trigger
//         switch (col) {
//             case 0: this.model.data[row].title = text; break
//             case 1: this.model.data[row].author = text; break
//             case 2: this.model.data[row].year = Number.parseInt(text); break
//         }
//         // FIXME: let table handle this event and maybe also provide (col, row)
//         this.model.modified.trigger(new TableEvent(TableEventType.CELL_CHANGED, col, row))
//     }
// }
