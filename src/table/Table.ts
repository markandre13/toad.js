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

import {
    TableModel, TableAdapter, TableEvent, SelectionModel, View, bindModel
} from '@toad'
import { span, div, text } from '@toad/util/lsx'

export let tableStyle = document.createElement("style")
tableStyle.textContent = `
:host {
    position: relative;
    display: inline-block;
    border: 1px solid var(--tx-gray-300);
    border-radius: 3px;
    outline-offset: -2px;
    font-family: var(--tx-font-family);
    font-size: var(--tx-font-size);
    background: var(--tx-gray-50);

    /* not sure about these */
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    height: 100%;
    height: -moz-available;
    height: -webkit-fill-available;
    height: fill-available;
}

.body {
    overflow: auto;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
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

/* TODO: this doesn't support all browsers */
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