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
import { span, div } from '@toad/util/lsx'

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
    /*
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
    height: 100%;
    height: -moz-available;
    height: -webkit-fill-available;
    height: fill-available;
    */

    height: 200px;
    width: 200px;
}

.body, .cols, .rows {
    position: absolute;
}

.body {
    overflow: auto;
    right: 0;
    bottom: 0;
}

.cols, .rows {
    overflow: hidden;
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
    background: #1e1e1e;
}
.body::-webkit-scrollbar-corner {
    background: #1e1e1e;
}
.body::-webkit-scrollbar-thumb {
    background: var(--tx-gray-500);
}

.body > span, .cols > span, .rows > span, .measure > span {
    position: absolute;
    white-space: nowrap;
    border: solid 1px var(--tx-gray-200);
    border-bottom: none;
    border-right: none;
    padding: 0 2px 0 2px;
    margin: 0;
    background-color: #080808;
    font-weight: 400;
}
.cols > span.handle, .rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 0;
}

.cols > span.handle {
    cursor: col-resize;
}
.rows > span.handle {
    cursor: row-resize;
}

/* #0e2035 for selection background */

.cols > span.head, .rows > span.head, .measure > span.head {
    background: #1e1e1e;
    font-weight: 600;
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
    colHeads?: HTMLDivElement
    rowHeads?: HTMLDivElement
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

        this.body.onscroll = () => {
            if (this.colHeads) {
                this.colHeads.scrollLeft = this.body.scrollLeft
            }
            if (this.rowHeads) {
                this.rowHeads.scrollTop = this.body.scrollTop
            }
          }

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
            const adapter = TableAdapter.lookup(model) as new (model: TableModel) => TableAdapter<any>
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
        // column headers
        let columnHeaders = new Array(this.model!.colCount)
        for (let col = 0; col < this.model!.colCount; ++col) {
            const content = this.adapter!.getColumnHead(col)
            if (this.colHeads === undefined && content !== undefined) {
                this.colHeads = div()
                this.colHeads.className = "cols"
                this.root.appendChild(this.colHeads)
            }
            columnHeaders[col] = content
        }
        if (this.colHeads) {
            for (let col = 0; col < this.model!.colCount; ++col) {
                const cell = span(columnHeaders[col])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // row headers
        let rowHeaders = new Array(this.model!.rowCount)
        for (let row = 0; row < this.model!.rowCount; ++row) {
            const content = this.adapter!.getRowHead(row)
            if (this.rowHeads === undefined && content !== undefined) {
                this.rowHeads = div()
                this.rowHeads.className = "rows"
                this.root.appendChild(this.rowHeads)
            }
            rowHeaders[row] = content
        }
        if (this.rowHeads) {
            for (let row = 0; row < this.model!.rowCount; ++row) {
                const cell = span(rowHeaders[row])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // body
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
        let idx = 0

        // calculate column widths and column header height
        let colHeadHeight = 0
        const colWidth = Array<number>(this.model!.colCount)
        if (this.colHeads) {
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[idx++]
                const bounds = child.getBoundingClientRect()
                colWidth[col] = Math.ceil(bounds.width)
                colHeadHeight = Math.max(colHeadHeight, bounds.height)
            }
        } else {
            colWidth.fill(0)
        }

        for (let col = 0; col < this.model!.colCount; ++col) {
            let cw = colWidth[col]
            for (let row = 0; row < this.model!.rowCount; ++row) {
                const child = this.measure.children[col + row * this.model!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                cw = Math.max(cw, bounds.width)
            }
            colWidth[col] = Math.ceil(cw)
        }

        // calculate row widths and row header width
        let rowHeadWidth = 0
        const rowHeight = Array<number>(this.model!.rowCount)
        if (this.rowHeads) {
            for (let row = 0; row < this.model!.rowCount; ++row) {
                const child = this.measure.children[idx++]
                const bounds = child.getBoundingClientRect()
                rowHeight[row] = Math.ceil(bounds.height)
                rowHeadWidth = Math.max(rowHeadWidth, bounds.width)
            }
        } else {
            rowHeight.fill(0)
        }

        for (let row = 0; row < this.model!.rowCount; ++row) {
            let rh = rowHeight[row]
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[col + row * this.model!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                rh = Math.max(rh, bounds.height)
            }
            rowHeight[row] = Math.ceil(rh)
        }

        // place column heads
        let x, y
        if (this.colHeads) {
            x = 0
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `0px`
                child.style.width = `${colWidth[col]}px`
                child.style.height = `${colHeadHeight}px`
                this.colHeads.appendChild(child)
                x += colWidth[col]
            }

            const filler = span()
            filler.className = "head"
            filler.style.left = `${x}px`
            filler.style.top = `0`
            filler.style.width = `256px`
            filler.style.height = `${colHeadHeight}px`
            this.colHeads.appendChild(filler)

            this.colHeads.style.left = `${rowHeadWidth}px`
            this.colHeads.style.top = `0`
            this.colHeads.style.right = `0`
            this.colHeads.style.height = `${colHeadHeight}px`

            // if resizeableColumns
            x = -2
            for (let col = 0; col < this.model!.colCount - 1; ++col) {
                x += colWidth[col]
                const handle = span()
                handle.className = "handle"
                handle.style.left = `${x}px`
                handle.style.top = `0px`
                handle.style.width = `5px`
                handle.style.height = `${colHeadHeight}px`
                let x0 = x
                let delta: number | undefined = undefined
                handle.onpointerdown = (ev: PointerEvent) => {
                    ev.preventDefault()
                    handle.setPointerCapture(ev.pointerId)
                    handle.style.backgroundColor = "#f00"
                    handle.style.opacity = "1"
                    delta = ev.clientX - x0
                }
                handle.onpointermove = (ev: PointerEvent) => {
                    if (delta !== undefined) {
                        handle.style.left = `${ev.clientX - delta}px`
                        x0 = ev.clientX - delta
                    }
                }
                handle.onpointerup = (ev: PointerEvent) => {
                    if (delta !== undefined) {
                        handle.style.opacity = "0"
                    }
                }
                this.colHeads.appendChild(handle)
            }
        }

        // place row heads
        if (this.rowHeads) {
            y = 0
            for (let row = 0; row < this.model!.rowCount; ++row) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `0px`
                child.style.top = `${y}px`
                child.style.width = `${rowHeadWidth}px`
                child.style.height = `${rowHeight[row]}px`
                this.rowHeads.appendChild(child)
                y += rowHeight[row]
            }

            const filler = span()
            filler.className = "head"
            filler.style.left = `0px`
            filler.style.top = `${y}px`
            filler.style.width = `${rowHeadWidth}px`
            filler.style.height = `256px`
            this.rowHeads.appendChild(filler)

            this.rowHeads.style.left = `0px`
            this.rowHeads.style.top = `${colHeadHeight}px`
            this.rowHeads.style.width = `${rowHeadWidth}px`
            this.rowHeads.style.bottom = `0`
        }

        // place body cells
        y = 0
        for (let row = 0; row < this.model!.rowCount; ++row) {
            x = 0
            for (let col = 0; col < this.model!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `${y}px`
                child.style.width = `${colWidth[col]}px`
                child.style.height = `${rowHeight[row]}px`
                this.body.appendChild(child)
                x += colWidth[col]
            }
            y += rowHeight[row]
        }
        this.body.style.left = `${rowHeadWidth}px`
        this.body.style.top = `${colHeadHeight}px`
    }

}
Table.define("tx-table2", Table)