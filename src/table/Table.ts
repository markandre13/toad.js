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
    TableModel, TableAdapter, TableEvent, SelectionModel, View
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
    background: #1e1e1e;

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

.splitBody {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: clip;
}

.cols {
    right: 0;
    top: 0;
}

.rows {
    left: 0;
    bottom: 0;
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

.body > span, .splitBody > span, .cols > span, .rows > span, .measure > span {
    position: absolute;
    white-space: nowrap;
    border: solid 1px var(--tx-gray-200);
    border-bottom: none;
    border-right: none;
    padding: 0 2px 0 2px;
    margin: 0;
    background-color: #080808;
    font-weight: 400;
    overflow: hidden;
}
.cols > span.handle, .rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 1;

    background-color: #08f;
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

    protected model?: TableModel
    protected selection?: SelectionModel
    protected adapter?: TableAdapter<any>

    protected root: HTMLDivElement // div containing everything else
    protected body: HTMLDivElement
    protected colHeads?: HTMLDivElement
    protected colResizeHandles?: HTMLDivElement
    protected rowHeads?: HTMLDivElement // if set, div containign the row heads
    protected rowResizeHandles?: HTMLDivElement
    protected measure: HTMLDivElement // invisible div used to measure cells

    // for column/row resize
    protected handle?: HTMLSpanElement // if set, the handle between the column/row headers currently grabbed/moved
    protected handleIndex?: number
    protected deltaHandleLeft?: number
    protected deltaSplitBodyLeft?: number
    protected deltaColumnWidth?: number
    protected deltaSplitHeadLeft?: number
    protected splitHead?: HTMLDivElement
    protected splitBody?: HTMLDivElement

    constructor() {
        super()
        this.arrangeAllMeasuredInGrid = this.arrangeAllMeasuredInGrid.bind(this)
        this.handleDown = this.handleDown.bind(this)
        this.handleMove = this.handleMove.bind(this)
        this.handleUp = this.handleUp.bind(this)
        this.setHeadingFillerSizeToScrollbarSize = this.setHeadingFillerSizeToScrollbarSize.bind(this)

        this.root = div(
            this.body = div()
        )
        this.root.className = "root"
        this.body.className = "body"
        this.measure = div()
        this.measure.classList.add("measure")

        this.body.onresize = this.setHeadingFillerSizeToScrollbarSize
        this.body.onscroll = () => {
            this.setHeadingFillerSizeToScrollbarSize()
            if (this.colHeads) {
                this.colHeads.scrollLeft = this.body.scrollLeft
                this.colResizeHandles!.scrollLeft = this.body.scrollLeft
                // console.log(`colResizeHandles.scrollLeft=${this.colResizeHandles!.scrollLeft} (${this.body.scrollLeft})`)
            }
            if (this.rowHeads) {
                this.rowHeads.scrollTop = this.body.scrollTop
                this.rowResizeHandles!.scrollTop = this.body.scrollTop
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
                this.colResizeHandles = div()
                this.colResizeHandles.className = "cols"
                this.root.appendChild(this.colResizeHandles)
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
                this.rowResizeHandles = div()
                this.rowResizeHandles.className = "rows"
                this.root.appendChild(this.rowResizeHandles)
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

            let filler = span()
            filler.className = "head"
            filler.style.left = `${x}px`
            filler.style.top = `0`
            filler.style.width = `256px`
            filler.style.height = `${colHeadHeight}px`
            this.colHeads.appendChild(filler)

            this.colHeads.style.left = `${rowHeadWidth}px`
            this.colHeads.style.height = `${colHeadHeight}px`

            // if resizeableColumns
            this.colResizeHandles!.style.left = `${rowHeadWidth}px`
            this.colResizeHandles!.style.height = `${colHeadHeight}px`
            x = -2
            for (let col = 0; col < this.model!.colCount; ++col) {
                x += colWidth[col]
                const handle = span()
                handle.className = "handle"
                handle.style.left = `${x}px`
                handle.style.top = `0`
                handle.style.width = `5px`
                handle.style.height = `${colHeadHeight}px`
                handle.onpointerdown = this.handleDown
                handle.onpointermove = this.handleMove
                handle.onpointerup = this.handleUp
                this.colResizeHandles!.appendChild(handle)
            }

            x+=5 // handle width
            filler = span()
            filler.className = "head"
            filler.style.left = `${x}px`
            filler.style.top = `0`
            filler.style.width = `256px`
            filler.style.height = `${colHeadHeight}px`
            this.colResizeHandles!.appendChild(filler)
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

            let filler = span()
            filler.className = "head"
            filler.style.left = `0`
            filler.style.top = `${y}px`
            filler.style.width = `${rowHeadWidth}px`
            filler.style.height = `256px`
            this.rowHeads.appendChild(filler)

            // this.rowHeads.style.left = `0px`
            this.rowHeads.style.top = `${colHeadHeight}px`
            this.rowHeads.style.width = `${rowHeadWidth}px`
            // this.rowHeads.style.bottom = `0`

            // if resizeableRows
            this.rowResizeHandles!.style.top = `${colHeadHeight}px`
            this.rowResizeHandles!.style.width = `${rowHeadWidth}px`
            y = -2
            for (let row = 0; row < this.model!.rowCount; ++row) {
                y += rowHeight[row]
                const handle = span()
                handle.className = "handle"
                handle.style.left = `0`
                handle.style.top = `${y}px`
                handle.style.width = `${rowHeadWidth}px`
                handle.style.height = `5px`
                handle.onpointerdown = this.handleDown
                handle.onpointermove = this.handleMove
                handle.onpointerup = this.handleUp
                this.rowResizeHandles!.appendChild(handle)
            }

            y+=5 // handle width
            filler = span()
            filler.className = "head"
            filler.style.left = `0`
            filler.style.top = `${y}0px`
            filler.style.width = `${rowHeadWidth}px`
            filler.style.height = `256px`
            this.rowResizeHandles!.appendChild(filler)
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

        this.setHeadingFillerSizeToScrollbarSize()
    }

    //
    // Column/Row Resize
    //

    protected handleDown(ev: PointerEvent) {
        ev.preventDefault()
        this.handle = ev.target as HTMLSpanElement
        this.handleIndex = this.getHandleId()

        this.handle.setPointerCapture(ev.pointerId)
        const leftOfHandle = this.handle.style.left
        this.deltaHandleLeft = ev.clientX - parseFloat(leftOfHandle.substring(0, leftOfHandle.length - 2))

        this.deltaSplitBodyLeft = ev.clientX

        const leftOfBody = this.body.style.left
        const x = parseFloat(leftOfBody.substring(0, leftOfBody.length - 2))
        this.deltaSplitHeadLeft = ev.clientX - x

        const widthOfColumn = (this.colHeads!.children[this.handleIndex - 1] as HTMLSpanElement).style.width
        this.deltaColumnWidth = ev.clientX - parseFloat(widthOfColumn.substring(0, widthOfColumn.length - 2))

        this.splitVertical()
    }
    protected handleMove(ev: PointerEvent) {
        if (this.handle !== undefined) {
            let clientX = ev.clientX
            const xLimit = this.deltaColumnWidth! + 8
            if (clientX < xLimit) {
                clientX = xLimit
            }

            this.handle!.style.left = `${clientX - this.deltaHandleLeft!}px`
            this.splitHead!.style.left = `${clientX - this.deltaSplitHeadLeft!}px`
            this.splitBody!.style.left = `${clientX - this.deltaSplitBodyLeft!}px`
            const h = this.handleIndex!;
            (this.colHeads!.children[h - 1] as HTMLSpanElement).style.width = `${clientX - this.deltaColumnWidth!}px`
            for (let row = 0; row < this.model!.rowCount; ++row) {
                (this.body.children[h - 1 + row * h] as HTMLSpanElement).style.width = `${clientX - this.deltaColumnWidth!}px`
            }
        }
    }
    protected handleUp(ev: PointerEvent) {
        if (this.handle !== undefined) {
            this.handleMove(ev)
            this.joinVertical(ev.clientX - this.deltaSplitBodyLeft!)
            this.handle = undefined
        }
    }

    // create 'splitBody' and move the right half of 'body' into it to begin animation
    // TODO: split/join only the visible area
    splitVertical() {
        // initialize splitHead
        this.splitHead = div()
        this.splitHead.className = "cols"
        this.splitHead.style.left = this.colHeads!.style.left
        this.splitHead.style.height = this.colHeads!.style.height
        this.root.appendChild(this.splitHead)

        // initialize splitBody
        this.splitBody = div()
        this.splitBody.className = "splitBody"

        setTimeout(() => {
            this.splitHead!.scrollTop = this.colHeads!.scrollTop
            this.splitHead!.scrollLeft = this.colHeads!.scrollLeft
        }, 0)

        this.body.appendChild(this.splitBody)

        // move cells into splitHead and splitBody
        const handle = this.handleIndex!
        const bodyWidth = handle
        const splitBodyWidth = this.model!.colCount - handle
        let idx = handle

        for (let i = 0; i < splitBodyWidth; ++i) {
            this.splitHead.appendChild(this.colHeads!.children[idx])
        }
        // clone the filler
        this.splitHead.appendChild(this.colHeads!.children[this.colHeads!.children.length-1].cloneNode())

        for (let row = 0; row < this.model!.rowCount; ++row) {
            for (let i = 0; i < splitBodyWidth; ++i) {
                this.splitBody.appendChild(this.body.children[idx])
            }
            idx += bodyWidth
        }
    }

    // move 'splitBody' back into 'body' to end animation
    joinVertical(delta: number) {
        const handle = this.handleIndex!
        const splitBodyWidth = this.model!.colCount - handle
        let idx = handle

        // move column headers back and adjust their positions
        const filler = this.colHeads!.children[this.colHeads!.children.length - 1] as HTMLSpanElement
        for (let i = 0; i < splitBodyWidth; ++i) {
            const cell = this.splitHead!.children[0] as HTMLSpanElement
            const leftOfCell = cell.style.left
            const left = parseFloat(leftOfCell.substring(0, leftOfCell.length - 2))
            cell.style.left = `${left + delta}px`
            this.colHeads!.insertBefore(cell, filler)
        }
        const fillerLeft = filler.style.left
        const left = parseFloat(fillerLeft.substring(0, fillerLeft.length - 2))
        filler.style.left = `${left + delta}px`

        // adjust handles and filler on the right
        for (let i = idx; i <= this.model!.colCount; ++i) {
            const cell = this.colResizeHandles!.children[i] as HTMLSpanElement
            const leftOfCell = cell.style.left
            const left = parseFloat(leftOfCell.substring(0, leftOfCell.length - 2))
            cell.style.left = `${left + delta}px`
        }

        for (let row = 0; row < this.model!.rowCount; ++row) {
            let beforeChild
            if (idx < this.body.children.length) {
                beforeChild = this.body.children[idx]
            } else {
                beforeChild = null
            }
            for (let i = 0; i < splitBodyWidth; ++i) {
                const cell = this.splitBody!.children[0] as HTMLSpanElement
                const leftOfCell = cell.style.left
                const left = parseFloat(leftOfCell.substring(0, leftOfCell.length - 2))
                cell.style.left = `${left + delta}px`
                this.body.insertBefore(cell, beforeChild)
            }
            idx += this.model!.colCount
        }

        this.root.removeChild(this.splitHead!)
        this.splitHead = undefined
        this.body.removeChild(this.splitBody!)
        this.splitBody = undefined
    }

    setHeadingFillerSizeToScrollbarSize() {
        const bounds = this.body.getBoundingClientRect()
        if (this.colHeads !== undefined) {
            const w = Math.ceil(bounds.width - this.body.clientWidth);
            (this.colHeads.children[this.colHeads.children.length-1] as HTMLSpanElement).style.width = `${w}px`
            this.colHeads.style.right = `${w}px`
        }
        if (this.rowHeads !== undefined) {
            const h = Math.ceil(bounds.height - this.body.clientHeight);
            (this.rowHeads.children[this.rowHeads.children.length-1] as HTMLSpanElement).style.height = `${h}px`
            this.rowHeads.style.bottom = `${h}px`
        }
    }

    getHandleId() {
        for (let i = 0; i < this.model!.colCount; ++i) {
            if (this.colResizeHandles!.children[i] === this.handle) {
                return i+1
            }
        }
        throw Error("yikes")
    }
}
Table.define("tx-table2", Table)