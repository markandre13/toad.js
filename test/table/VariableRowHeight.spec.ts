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
            let scene: VariableRowHeightScene

            this.beforeAll( async function() {
                scene = new VariableRowHeightScene()
                // await scene.sleep()                
            })

            describe("variable row heights", function() {
                it("initial heights of a new table is correct", function() {
                    describe("the heights for animation and their display are correct", function() {
                        it("insert single row", function() {
                        })
                        it("remove single row", function() {
                        })
                        it("insert multiple rows", function() {
                        })
                        it("remove multiple rows", function() {
                        })
                    })
                })
            })
        })
    })
})

class VariableRowHeightScene {

    table: TableView
    selectionModel: SelectionModel

    constructor() {
        try {
        setAnimationFrameCount(0)
        unbind()
        document.body.innerHTML = ""

        TableAdapter.register(VHTTableAdapter, VHTModel, VariableHeightThingy)

        const data = new Array<VariableHeightThingy>()
        const _init = [
            16,
            32,
            64
        ].forEach( (e) => {
            data.push(new VariableHeightThingy(e as number))
        })
        const books = new VHTModel(data)
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

class VariableHeightThingy {
    height: number
    constructor(height: number = 16) {
        this.height = height
    }
}

class VHTModel extends ArrayTableModel<VariableHeightThingy> {
    constructor(data: Array<VariableHeightThingy>) {
        super(data, VariableHeightThingy)
     }
    get colCount(): number { return 1 }
}

class VHTTableAdapter extends TableAdapter {
    model?: VHTModel

    setModel(model: VHTModel) {
        this.model = model
    }

    getColumnHead(col: number): Node | undefined {
        return document.createTextNode("Thing")
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
        if (this.model === undefined)
            return undefined
        return `${this.model.data[row].height}`
    }

    private setField(col: number, row: number, text: string): void {
        if (!this.model)
            return
        this.model.data[row].height = Number.parseInt(text);
        this.model.modified.trigger(new TableEvent(TableEventType.CHANGED, 0, 0))
    }
}
