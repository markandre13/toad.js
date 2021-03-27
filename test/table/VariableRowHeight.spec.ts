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
                    const rows = scene.table.bodyBody.children
                    expect(rows.length).to.equal(3+1)
                    // for(let i=1; i<4; ++i) {
                    //     console.log(`height: dom=${rows[i].clientHeight}, data=${scene.data[i-1].height}`)
                    // }
                    expect(rows[1].clientHeight-4).equals(scene.data[0].height)
                    expect(rows[2].clientHeight-5).equals(scene.data[1].height) // + 1 row separator
                    expect(rows[3].clientHeight-5).equals(scene.data[2].height)
                })
                // row with fields of different heights
                // row header as different height from row
                describe("the heights for animation and their display are correct", function() {
                    it("insert single row", async function() {
                        scene.model.addRowAbove(2, new VariableHeightThingy(128))
                        await scene.sleep()

                        const rows = scene.table.bodyBody.children
                        expect(rows.length).to.equal(4+1)

                        for(let i=1; i<5; ++i) {
                            console.log(`height: dom=${rows[i].clientHeight}, data=${scene.data[i-1].height}`)
                        }

                        expect(rows[1].clientHeight-4).equals(scene.data[0].height)
                        expect(rows[2].clientHeight-5).equals(scene.data[1].height) // + 1 row separator
                        expect(rows[3].clientHeight-5).equals(scene.data[2].height)
                        expect(rows[4].clientHeight-5).equals(scene.data[3].height)

                        expect(scene.table.rowAnimationHeight).to.equal(128 + 5)
                    })
                    it("remove single row", async function() {
                        scene.model.deleteRow(1)
                        await scene.sleep()

                        expect(scene.table.rowAnimationHeight).to.equal(32 + 5)
                    })
                    xit("insert multiple rows", function() {
                    })
                    xit("remove multiple rows", function() {
                    })
                })
            })
        })
    })
})

class VariableRowHeightScene {

    table: TableView
    selectionModel: SelectionModel
    data: Array<VariableHeightThingy>
    model: VHTModel

    constructor() {
        try {
        setAnimationFrameCount(0)
        unbind()
        document.body.innerHTML = ""

        TableAdapter.register(VHTTableAdapter, VHTModel, VariableHeightThingy)

        this.data = new Array<VariableHeightThingy>()
        const _init = [
            16,
            32,
            64
        ].forEach( (e) => {
            this.data.push(new VariableHeightThingy(e as number))
        })
        this.model = new VHTModel(this.data)
        bind("model", this.model)

        this.selectionModel = new SelectionModel()
        bind("model", this.selectionModel)

        document.body.innerHTML = `<toad-tabletool></toad-tabletool><div style="width: 480px"><toad-table model='model'></toad-table></div>`
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
        if (!this.model)
            return undefined
        const height = this.model.data[row].height
        const text = `${height}`

        const div = document.createElement("div")
        div.appendChild(document.createTextNode(text))
        div.style.height = text + "px"
        return div
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
