/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2022 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*

this is the 2nd version of the table
* stop using <table> internally...
  => perform layout without fighting <table>'s own layout algorithm
  => required tracking of all cell width x height makes it possible
     to adjust table to content without flicker
  => makes it possible to use sparse tables in case of huge datasets
  => simplifies implementation of row/column insert/delete animation
* stop using an input overlay (? it worked fine for the caret)
* custom scrollbars matching the theme(?) (how do other libraries do that?)

NEXT STEPS:
[ ] let Table2 use model & adapter similar to the old table
[ ] row & column headers
[ ] grab between col headers to get to initiate a resize
[ ] to resize a column with CSS
    => plan:
    * once when starting the animation
      * put the right half into a div/span which we'll then translate
      * extend the width of the left column to have row lines in the background
    * then just transform: translateX the right div/span

*/

import {
    TableModel, TableAdapter, TableEvent, SelectionModel, View, bindModel
} from '@toad'

import { span, div, text } from '@toad/util/lsx'

export let tableStyle = document.createElement("style")
tableStyle.textContent = `
:host {
    min-height: 200px;
    position: relative;
    display: inline-block;
    border: 1px solid var(--tx-gray-300);
    border-radius: 3px;
    outline-offset: -2px;
    font-family: var(--tx-font-family);
    font-size: var(--tx-font-size);
    background: var(--tx-gray-50);
}

.body {
    overflow: auto;
    scrollbar-color: rebeccapurple green;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

/*
::-webkit-scrollbar the scrollbar.
::-webkit-scrollbar-button the buttons on the scrollbar (arrows pointing upwards and downwards).
::-webkit-scrollbar-thumb the draggable scrolling handle.
::-webkit-scrollbar-track the track (progress bar) of the scrollbar.
::-webkit-scrollbar-track-piece the track (progress bar) NOT covered by the handle.
::-webkit-scrollbar-corner the bottom corner of the scrollbar, where both horizontal and vertical scrollbars meet.
::-webkit-resizer the draggable resizing handle that appears at the bottom corner of some elements.
*/

.body::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.body::-webkit-scrollbar-thumb {
    border-radius: 5px;
}
.body::-webkit-scrollbar-track {
    background: var(--tx-gray-200);
}
.body::-webkit-scrollbar-corner {
    background: var(--tx-gray-200);
}
.body::-webkit-scrollbar-thumb {
    background: var(--tx-gray-700);
}

.body > span, .measure > span {
    position: absolute;
    white-space: nowrap;
    border: solid #fff 1px;
    border-bottom: none;
    border-right: none;
    padding: 0 2px 0 2px;
    margin: 0;
}

/* rotate3d, transform3d /*
/* https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/ */


.body > .C1, .body > .C2, body > .C3 {
    transform: translateX(30px);
/*
    animation: move 1s linear infinite;
*/
}

@keyframes move {
    from { transform: translateX(0); }
    to { transform: translateX(70px); }
}

.measure {
    position: absolute;
    opacity: 0;
}
`

// https://www.bbcelite.com/deep_dives/generating_system_data.html
// https://www.bbcelite.com/deep_dives/printing_text_tokens.html
const token = ["AL", "LE", "XE", "GE", "ZA", "CE", "BI", "SO", "US", "ES", "AR", "MA", "IN", "DI", "RE", "A", "ER", "AT", "EN", "BE", "RA", "LA", "VE", "TI", "ED", "OR", "QU", "AN", "TE", "IS", "RI", "ON"]
const government = ["Anarchy", "Feudal", "Multi-government", "Dictatorship", "Communist", "Confederacy", "Democracy", "Corporate State"]
const prosperity = ["Rich", "Average", "Poor", "Mainly"]
const economy = [" Industrial", " Agricultural"]
// "Human Colonials"
const species0 = ["Large ", "Fierce ", "Small "]
const species1 = ["Green ", "Red ", "Yellow ", "Blue ", "Black ", "Harmless "]
const species2 = ["Slimy ", "Bug-Eyed ", "Horned ", "Bony ", "Fat ", "Furry "]
//                 0           1        2          3           4        5            6          7
const species3 = ["Rodents ", "Frogs", "Lizards", "Lobsters", "Birds", "Humanoids", "Felines", "Insects"]
// species3 := (random(4) + species2) % 7
// radius = 6911 km to 2816 km
// population := (tech level * 4) + economy + government + 1 (71 = 7.1 billion)

class MyModel extends TableModel {
    constructor() {
        super()
    }
    get colCount() {
        return 4
    }
    get rowCount() {
        return 64
    }
    get(col: number, row: number) {
        let h = this.hash(`${row}`)
        switch (col) {
            case 0: { // species
                let name = ""
                let l = (h % 6) + 1
                for (let j = 0; j < l; ++j) {
                    h = this.hash(`${row}`, h)
                    name += token[h % token.length]
                }
                return name.charAt(0) + name.toLowerCase().substring(1)
            }
            case 1: { // government
                return government[h % government.length]
            }
            case 2: { // economy
                h = h >>> 3
                const h0 = h % prosperity.length
                h = h >>> 2
                const h1 = h % economy.length
                return prosperity[h0] + economy[h1]
            }
            case 3: {
                h = h >>> 6
                let h0 = h % species0.length
                h = h >>> 2
                const h1 = h % species1.length
                h = h >>> 3
                const h2 = h % species2.length
                h = h >>> 3
                const h3 = (h % 4 + h2) % species3.length
                return species0[h0] + species1[h1] + species2[h2] + species3[h3]
            }
        }

        throw Error(`unreachable col ${col}, row ${row}`)
    }

    // cyrb53 from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
    hash(str: string, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i)
            h1 = Math.imul(h1 ^ ch, 2654435761)
            h2 = Math.imul(h2 ^ ch, 1597334677)
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
        return 4294967296 * (2097151 & h2) + (h1 >>> 0)
    }
}

class MyAdapter extends TableAdapter<MyModel> {

    constructor(model: MyModel) {
        super(model)
    }

    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.get(col, row)
        )
    }
    // getEditorCell(col: number, row: number): Node | undefined { return undefined }
}

// TODO: something else to redesign:
// static register<T, A extends TypedTableAdapter<TypedTableModel<T>>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
function register<T extends TableModel>(adapter: new(model: T) => TableAdapter<any>, model: new(...args: any[])=>T): void
// static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel, data?: any): void
{
    TableAdapter.register(adapter as any, model)
}
const model = new MyModel()
bindModel("solarsystems", model)
register(MyAdapter, MyModel)

export class Table extends View {

    model?: TableModel
    selection?: SelectionModel
    adapter?: TableAdapter<any>

    root: HTMLDivElement
    body: HTMLDivElement
    measure: HTMLDivElement

    constructor() {
        super()
        this.arrangeAllMeasuredInGrid = this.arrangeAllMeasuredInGrid.bind(this)

        this.root = div(
            this.body = div()
        )
        this.root.className = "root"
        this.body.className = "body"
        this.measure = div()
        this.measure.classList.add("measure")

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
        this.shadowRoot!.appendChild(this.root)
        this.shadowRoot!.appendChild(this.measure)
    }

    override setModel(model?: TableModel | SelectionModel): void {
        if (!model) {
            if (this.selection)
                this.selection.modified.remove(this)
            this.model = undefined
            this.selection = new SelectionModel()
            //   this.selection.modified.add(() => {
            //     this.createSelection()
            //   }, this)
            //   this.updateView()
            return
        }

        if (model instanceof SelectionModel) {
            if (this.selection) {
                this.selection.modified.remove(this)
            }
            this.selection = model
            // this.createSelection()
            this.selection.modified.add(() => {
                // this.createSelection()
            }, this)
            return
        }

        if (model instanceof TableModel) {
            this.model = model
            // this.model.modified.add((event: TableEvent) => { this.modelChanged(event) }, this)
            const adapter = TableAdapter.lookup(model) as new(model: TableModel) => TableAdapter<any>
            try {
                this.adapter = new adapter(model)
            }
            catch (e) {
                console.log(`TableView.setModel(): failed to instantiate table adapter: ${e}`)
                console.log(`setting TypeScript's target to 'es6' might help`)
                throw e
            }
            this.adapter.setModel(model)
            // this.updateCompact()
            // this.updateView()
            this.prepareCells()
            return
        }
        if ((model as any) instanceof Object) {
            throw Error("TableView.setModel(): unexpected model of type " + (model as Object).constructor.name)
        }
    }

    prepareCells() {
        for (let row = 0; row < this.model!.rowCount; ++row) {
            for (let col = 0; col < this.model!.colCount; ++col) {
                const cell = span(
                    this.adapter!.getDisplayCell(col, row) as Node
                )
                this.measure.appendChild(cell)
            }
        }
        setTimeout(this.arrangeAllMeasuredInGrid, 0)
    }

    arrangeAllMeasuredInGrid() {
        const colInfo = Array<number>(this.model!.colCount)
        const rowInfo = Array<number>(this.model!.rowCount)
        colInfo.fill(0)
        rowInfo.fill(0)

        for (let row = 0; row < this.model!.rowCount; ++row) {
            let rowHeight = 0
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[col + row * this.model!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                rowHeight = Math.max(rowHeight, bounds.height)
            }
            rowInfo[row] = Math.ceil(rowHeight)
        }

        for (let col = 0; col < this.model!.colCount; ++col) {
            let colWidth = 0
            for (let row = 0; row < this.model!.rowCount; ++row) {
                const child = this.measure.children[col + row * this.model!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                colWidth = Math.max(colWidth, bounds.width)
            }
            colInfo[col] = Math.ceil(colWidth)
        }

        let y = 0
        for (let row = 0; row < this.model!.rowCount; ++row) {
            let x = 0
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `${y}px`
                child.style.width = `${colInfo[col]}px`
                child.style.height = `${rowInfo[row]}px`
                this.body.appendChild(child)
                x += colInfo[col]
            }
            y += rowInfo[row]
        }
    }

}
Table.define("tx-table2", Table)
