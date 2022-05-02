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

import { View } from '../view/View'
import { TableModel } from './model/TableModel'
import { SelectionModel } from './model/SelectionModel'
import { TableAdapter } from './adapter/TableAdapter'
import { TableEvent } from './TableEvent'
import { TablePos } from './TablePos'
import { TableEditMode } from './TableEditMode'
import { TableEventType } from './TableEventType'
import { TableAnimation } from './TableAnimation'
import { InsertRowAnimation } from './InsertRowAnimation'
import { RemoveRowAnimation } from './RemoveRowAnimation'
import { InsertColumnAnimation } from './InsertColumnAnimation'
import { RemoveColumnAnimation } from './RemoveColumnAnimation'

import { span, div } from '@toad/util/lsx'
import { scrollIntoView } from '@toad/util/scrollIntoView'

// --spectrum-table-row-background-color-selected
// --spectrum-alias-highlight-selected
// --spectrum-alias-highlight-selected: rgba(20,115,230,0.1); // --tx-global-blue-500 with alias 0.1
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
    padding: 0 2px 0 2px;
    margin: 0;
    background-color: #080808;
    font-weight: 400;
    overflow: hidden;
    cursor: default;
}

.splitBody {
    transition: transform 5s;
}

.body > span:hover {
    background: #1a1a1a;
}

.body > span.selected, .splitBody > span.selected {
    background: #0e2035;
    border-color: #2680eb;
    z-index: 1;
}

.body > span.selected:hover {
    background: #112d4d;
}

.cols > span.handle, .rows > span.handle {
    padding: 0;
    border: 0 none;
    opacity: 0;

    background-color: #08f;
}

.cols > span.handle {
    cursor: col-resize;
}
.rows > span.handle {
    cursor: row-resize;
}

.cols > span.head, .rows > span.head, .measure > span.head {
    background: #1e1e1e;
    font-weight: 600;
}

.measure {
    position: absolute;
    opacity: 0;
}
`

export function px2int(s: string) {
    return parseInt(s.substring(0, s.length - 2))
}

export function px2float(s: string) {
    return parseFloat(s.substring(0, s.length - 2))
}

export class Table extends View {

    // TODO: friend tabletool, ... should make these getters'n setters
    model?: TableModel
    selection?: SelectionModel
    protected adapter?: TableAdapter<any>

    _style: HTMLStyleElement
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
    protected deltaHandle?: number
    protected deltaSplitBody?: number
    protected deltaColumn?: number
    protected deltaSplitHead?: number
    protected splitHead?: HTMLDivElement
    protected splitBody?: HTMLDivElement

    animation?: TableAnimation

    constructor() {
        super()

        this.tabIndex = 0 // FIXME: value depends on selection model

        this.arrangeAllMeasuredInGrid = this.arrangeAllMeasuredInGrid.bind(this)
        this.keyDown = this.keyDown.bind(this)
        this.pointerDown = this.pointerDown.bind(this)
        this.handleDown = this.handleDown.bind(this)
        this.handleMove = this.handleMove.bind(this)
        this.handleUp = this.handleUp.bind(this)
        this.setHeadingFillerSizeToScrollbarSize = this.setHeadingFillerSizeToScrollbarSize.bind(this)
        this.selectionChanged = this.selectionChanged.bind(this)
        this.modelChanged = this.modelChanged.bind(this)

        this.root = div(
            this.body = div()
        )
        this.root.className = "root"
        this.body.className = "body"
        this.measure = div()
        this.measure.classList.add("measure")

        this.onkeydown = this.keyDown
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
        this.body.onpointerdown = this.pointerDown

        this.attachShadow({ mode: 'open' })
        this._style = document.importNode(tableStyle, true)
        this.shadowRoot!.appendChild(this._style)
        this.shadowRoot!.appendChild(this.root)
        this.shadowRoot!.appendChild(this.measure)
    }

    override connectedCallback(): void {
        super.connectedCallback()
        if (this.selection === undefined) {
            this.selection = new SelectionModel(TableEditMode.SELECT_CELL)
            this.selection.modified.add(this.selectionChanged, this)
        }
    }

    keyDown(ev: KeyboardEvent) {
        // console.log(`keydown: ${ev.key}, mode: ${TableEditMode[this.selection!.mode]}`)
        if (!this.selection)
            return
        // FIXME: based on the selection model we could plug in a behaviour class
        switch (this.selection.mode) {
            case TableEditMode.SELECT_ROW: {
                let row = this.selection.value.row
                switch (ev.key) {
                    case "ArrowDown":
                        if (row + 1 < this.adapter!.rowCount)
                            ++row
                        break
                    case "ArrowUp":
                        if (row > 0)
                            --row
                        break
                }
                this.selection.row = row
            } break
            case TableEditMode.SELECT_CELL: {
                let pos = { col: this.selection.col, row: this.selection.row }
                switch (ev.key) {
                    case "ArrowRight":
                        if (pos.col + 1 < this.adapter!.colCount) {
                            ++pos.col
                        }
                        break
                    case "ArrowLeft":
                        if (pos.col > 0) {
                            --pos.col
                        }
                        break
                    case "ArrowDown":
                        if (pos.row + 1 < this.adapter!.rowCount)
                            ++pos.row
                        break
                    case "ArrowUp":
                        if (pos.row > 0)
                            --pos.row
                        break
                }
                this.selection.value = pos
            } break
        }
    }

    pointerDown(ev: PointerEvent) {
        ev.preventDefault()
        this.focus()

        const x = ev.clientX
        const y = ev.clientY

        let col, row
        for (col = 0; col < this.adapter!.colCount; ++col) {
            const b = this.body.children[col]!.getBoundingClientRect()
            if (b.x <= x && x < b.x + b.width)
                break
        }
        if (col >= this.adapter!.colCount) {
            return
        }
        let idx = 0
        for (row = 0; row < this.adapter!.rowCount; ++row) {
            const b = this.body.children[idx]!.getBoundingClientRect()
            if (b.y <= y && y < b.y + b.height)
                break
            idx += this.adapter!.colCount
        }
        if (row >= this.adapter!.rowCount) {
            return
        }

        this.selection!.value = new TablePos(col, row)
    }

    override setModel(model?: TableModel | SelectionModel): void {
        if (!model) {
            if (this.selection) {
                this.selection.modified.remove(this)
            }
            this.model = undefined
            this.selection = new SelectionModel()
            this.selection.modified.add(this.selectionChanged, this)
            //   this.updateView()
            return
        }

        if (model instanceof SelectionModel) {
            if (this.selection) {
                this.selection.modified.remove(this)
            }
            this.selection = model
            // this.createSelection()
            this.selection.modified.add(this.selectionChanged, this)
            return
        }

        if (model instanceof TableModel) {
            this.model = model
            this.model.modified.add(this.modelChanged, this)
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

    selectionChanged() {
        // console.log(`Table2.selectionChanged: ${this.selection}`)
        if (this.selection === undefined) {
            return
        }
        switch (this.selection.mode) {
            case TableEditMode.EDIT_CELL: {
                // this.log(Log.SELECTION, `TableView.createSelection(): mode=EDIT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                let allSelected = this.body.querySelectorAll(".selected")
                for (let selected of allSelected) {
                    selected.classList.remove("selected")
                }
                const cell = this.body.children[this.selection!.col + this.selection!.row * this.adapter!.colCount] as HTMLSpanElement
                cell.classList.add("selected")
                scrollIntoView(cell)
                // this.prepareInputOverlayForPosition(new TablePos(this.selectionModel.col, this.selectionModel.row))
                // delete (this.rootDiv as any).tabIndex
            } break
            case TableEditMode.SELECT_CELL: {
                // this.log(Log.SELECTION, `TableView.createSelection(): mode=SELECT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                let allSelected = this.body.querySelectorAll(".selected")
                for (let selected of allSelected) {
                    selected.classList.remove("selected")
                }
                const cell = this.body.children[this.selection!.col + this.selection!.row * this.adapter!.colCount] as HTMLSpanElement
                cell.classList.add("selected")
                // this.toggleCellSelection(this.selectionModel.value, true)
                this.tabIndex = 0
                scrollIntoView(cell)
                break
            }
            case TableEditMode.SELECT_ROW: {
                // this.log(Log.SELECTION, `TableView.createSelection(): mode=SELECT_ROW, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                // let allSelected = this.bodyBody.querySelectorAll("tbody > tr.selected")
                // for (let selected of allSelected)
                //   selected.classList.remove("selected")
                // this.toggleRowSelection(this.selectionModel.value.row, true)
                this.tabIndex = 0
                break
            }
        }
    }

    modelChanged(event: TableEvent) {
        // console.log(`Table2.modelChanged: ${event}`)
        switch (event.type) {
            case TableEventType.INSERT_ROW: {
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new InsertRowAnimation(this, event)
                this.animation.run()
            } break
            case TableEventType.REMOVE_ROW: {
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new RemoveRowAnimation(this, event)
                this.animation.run()
            } break
            case TableEventType.INSERT_COL: {
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new InsertColumnAnimation(this, event)
                this.animation.run()
            } break
            case TableEventType.REMOVE_COL: {
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new RemoveColumnAnimation(this, event)
                this.animation.run()
            } break
            default:
                console.log(`Table.modelChanged(): ${event} is not implemented`)
        }
    }

    prepareCells() {
        // column headers
        let columnHeaders = new Array(this.adapter!.colCount)
        for (let col = 0; col < this.adapter!.colCount; ++col) {
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
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const cell = span(columnHeaders[col])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // row headers
        let rowHeaders = new Array(this.adapter!.rowCount)
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
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
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                const cell = span(rowHeaders[row])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // body
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            for (let col = 0; col < this.adapter!.colCount; ++col) {
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
        const colWidth = Array<number>(this.adapter!.colCount)
        if (this.colHeads) {
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[idx++]
                const bounds = child.getBoundingClientRect()
                colWidth[col] = Math.ceil(bounds.width)
                colHeadHeight = Math.max(colHeadHeight, bounds.height)
            }
        } else {
            colWidth.fill(0)
        }

        for (let col = 0; col < this.adapter!.colCount; ++col) {
            let cw = colWidth[col]
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                const child = this.measure.children[col + row * this.adapter!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                cw = Math.max(cw, bounds.width)
            }
            colWidth[col] = Math.ceil(cw)
        }

        // calculate row widths and row header width
        let rowHeadWidth = 0
        const rowHeight = Array<number>(this.adapter!.rowCount)
        if (this.rowHeads) {
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                const child = this.measure.children[idx++]
                const bounds = child.getBoundingClientRect()
                rowHeight[row] = Math.ceil(bounds.height)
                rowHeadWidth = Math.max(rowHeadWidth, bounds.width)
            }
        } else {
            rowHeight.fill(0)
        }

        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            let rh = rowHeight[row]
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[col + row * this.adapter!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                rh = Math.max(rh, bounds.height)
            }
            rowHeight[row] = Math.ceil(rh)
        }

        // place column heads
        let x, y
        if (this.colHeads) {
            x = 0
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `0px`
                child.style.width = `${colWidth[col] - 5}px`
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
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                x += colWidth[col]
                const handle = span()
                handle.className = "handle"
                handle.style.left = `${x}px`
                handle.style.top = `0`
                handle.style.width = `5px`
                handle.style.height = `${colHeadHeight}px`
                handle.dataset["idx"] = `${col}`
                handle.onpointerdown = this.handleDown
                handle.onpointermove = this.handleMove
                handle.onpointerup = this.handleUp
                this.colResizeHandles!.appendChild(handle)
            }

            x += 5 // handle width
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
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
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
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                y += rowHeight[row]
                const handle = span()
                handle.className = "handle"
                handle.style.left = `0`
                handle.style.top = `${y}px`
                handle.style.width = `${rowHeadWidth}px`
                handle.style.height = `5px`
                handle.dataset["idx"] = `${row}`
                handle.onpointerdown = this.handleDown
                handle.onpointermove = this.handleMove
                handle.onpointerup = this.handleUp
                this.rowResizeHandles!.appendChild(handle)
            }

            y += 5 // handle width
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
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            x = 0
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `${y}px`
                child.style.width = `${colWidth[col] - 5}px`
                child.style.height = `${rowHeight[row] - 1}px`
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
        this.handleIndex = parseInt(this.handle.dataset["idx"]!) + 1
        this.handle.setPointerCapture(ev.pointerId)

        const isColumn = this.handle.parentElement === this.colResizeHandles
        if (isColumn) {
            this.deltaHandle = ev.clientX - px2int(this.handle.style.left)
            this.deltaSplitBody = ev.clientX
            this.deltaSplitHead = ev.clientX - px2float(this.body.style.left)
            const cell = this.colHeads!.children[this.handleIndex - 1] as HTMLSpanElement
            this.deltaColumn = ev.clientX - px2float(cell.style.width)
            this.splitVertical(this.handleIndex!)
        } else {
            this.deltaHandle = ev.clientY - px2float(this.handle.style.top)
            this.deltaSplitBody = ev.clientY
            this.deltaSplitHead = ev.clientY - px2float(this.body.style.top)
            const cell = this.rowHeads!.children[this.handleIndex - 1] as HTMLSpanElement
            this.deltaColumn = ev.clientY - px2float(cell.style.height)
            this.splitHorizontal(this.handleIndex!)
        }
    }
    protected handleMove(ev: PointerEvent) {
        if (this.handle === undefined) {
            return
        }

        const isColumn = this.handle.parentElement === this.colResizeHandles
        if (isColumn) {
            let clientX = ev.clientX
            const xLimit = this.deltaColumn! + 8
            if (clientX < xLimit) {
                clientX = xLimit
            }
            this.handle!.style.left = `${clientX - this.deltaHandle!}px`
            this.splitHead!.style.left = `${clientX - this.deltaSplitHead!}px`
            this.splitBody!.style.left = `${clientX - this.deltaSplitBody!}px`
            const h = this.handleIndex!;
            // adjust col head width
            (this.colHeads!.children[h - 1] as HTMLSpanElement).style.width = `${clientX - this.deltaColumn!}px`
            // adjust row cells width
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                (this.body.children[h - 1 + row * h] as HTMLSpanElement).style.width = `${clientX - this.deltaColumn!}px`
            }
        } else {
            let clientY = ev.clientY
            const yLimit = this.deltaColumn! + 8
            if (clientY < yLimit) {
                clientY = yLimit
            }
            this.handle!.style.top = `${clientY - this.deltaHandle!}px`
            this.splitHead!.style.top = `${clientY - this.deltaSplitHead!}px`
            this.splitBody!.style.top = `${clientY - this.deltaSplitBody!}px`
            const h = this.handleIndex!;
            // adjust row head height
            (this.rowHeads!.children[h - 1] as HTMLSpanElement).style.height = `${clientY - this.deltaColumn!}px`
            // adjust row cells height
            let idx = (h - 1) * this.adapter!.colCount
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                (this.body.children[idx + col] as HTMLSpanElement).style.height = `${clientY - this.deltaColumn!}px`
            }
        }
    }
    protected handleUp(ev: PointerEvent) {
        if (this.handle === undefined) {
            return
        }
        this.handleMove(ev)
        const isColumn = this.handle.parentElement === this.colResizeHandles
        if (isColumn) {
            let clientX = ev.clientX
            const xLimit = this.deltaColumn! + 8
            if (clientX < xLimit) {
                clientX = xLimit
            }
            this.joinVertical(this.handleIndex!, clientX - this.deltaSplitBody!)
        } else {
            let clientY = ev.clientY
            const yLimit = this.deltaColumn! + 8
            if (clientY < yLimit) {
                clientY = yLimit
            }
            this.joinHorizontal(this.handleIndex!, clientY - this.deltaSplitBody!)
        }
        this.handle = undefined
    }

    // create 'splitBody' and move the right half of 'body' into it to begin animation
    // TODO: split/join only the visible area
    splitVertical(splitColumn: number, extra: number = 0) {
        // initialize splitHead
        if (this.colHeads !== undefined) {
            this.splitHead = div()
            this.splitHead.className = "cols"
            this.splitHead.style.left = this.colHeads!.style.left
            this.splitHead.style.height = this.colHeads!.style.height
            this.root.appendChild(this.splitHead)
            setTimeout(() => {
                this.splitHead!.scrollTop = this.colHeads!.scrollTop
                this.splitHead!.scrollLeft = this.colHeads!.scrollLeft
            }, 0)   
        }

        // initialize splitBody
        this.splitBody = div()
        this.splitBody.className = "splitBody"
        const b = this.body.getBoundingClientRect()
        this.splitBody.style.width = `${b.width}px`
        this.splitBody.style.height = `${b.height}px`

        this.body.appendChild(this.splitBody)

        // move the heads into splitHead
        // const handle = this.handleIndex!
        const bodyWidth = splitColumn
        const splitBodyColumns = this.adapter!.colCount - splitColumn + extra

        if (this.splitHead !== undefined) {
            for (let i = 0; i < splitBodyColumns; ++i) {
                this.splitHead.appendChild(this.colHeads!.children[splitColumn])
            }
            // clone the filler
            this.splitHead.appendChild(this.colHeads!.children[this.colHeads!.children.length - 1].cloneNode())
        }

        // move cells into splitBody
        let idx = splitColumn
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            for (let col = 0; col < splitBodyColumns; ++col) {
                this.splitBody.appendChild(this.body.children[idx])
            }
            idx += bodyWidth
        }
    }

    // move 'splitBody' back into 'body' to end animation
    joinVertical(splitCol: number, delta: number, extra: number = 0, colCount?: number, rowCount?: number) {
        // const handle = this.handleIndex!
        if (colCount === undefined) {
            colCount = this.adapter!.colCount
        }
        if (rowCount === undefined) {
            rowCount = this.adapter!.rowCount
        }

        const splitBodyColumns = colCount - splitCol
        let idx = splitCol

        if (this.colHeads !== undefined) {
            // move column headers back and adjust their positions
            const filler = this.colHeads!.children[this.colHeads!.children.length - 1] as HTMLSpanElement
            for (let col = 0; col < splitBodyColumns; ++col) {
                const cell = this.splitHead!.children[0] as HTMLSpanElement
                const left = px2float(cell.style.left)
                cell.style.left = `${left + delta}px`
                this.colHeads!.insertBefore(cell, filler)
            }
            const fillerLeft = filler.style.left
            const left = px2float(fillerLeft)
            filler.style.left = `${left + delta}px`
        }

        // adjust handles and filler on the right
        for (let col = idx; col <= colCount; ++col) {
            const cell = this.colResizeHandles!.children[col] as HTMLSpanElement
            const left = px2float(cell.style.left)
            cell.style.left = `${left + delta}px`
        }

        for (let row = 0; row < rowCount; ++row) {
            let beforeChild
            if (idx < this.body.children.length) {
                beforeChild = this.body.children[idx]
            } else {
                beforeChild = null
            }
            for (let i = 0; i < splitBodyColumns; ++i) {
                const cell = this.splitBody!.children[0] as HTMLSpanElement
                const left = px2float(cell.style.left)
                cell.style.left = `${left + delta}px`
                this.body.insertBefore(cell, beforeChild)
            }
            idx += colCount
        }

        if (this.colHeads !== undefined) {
            this.root.removeChild(this.splitHead!)
            this.splitHead = undefined
            }
        this.body.removeChild(this.splitBody!)
        this.splitBody = undefined
    }

    splitHorizontal(splitRow: number, extra: number = 0) {
        // initialize splitHead
        if (this.rowHeads !== undefined) {
            this.splitHead = div()
            this.splitHead.className = "rows"
            this.splitHead.style.top = this.rowHeads!.style.top
            this.splitHead.style.width = this.rowHeads!.style.width
            this.root.appendChild(this.splitHead)
            setTimeout(() => {
                this.splitHead!.scrollTop = this.rowHeads!.scrollTop
                this.splitHead!.scrollLeft = this.rowHeads!.scrollLeft
            }, 0)
        }

        // initialize splitBody
        this.splitBody = div()
        this.splitBody.className = "splitBody"

        const b = this.body.getBoundingClientRect()
        this.splitBody.style.width = `${b.width}px`
        this.splitBody.style.height = `${b.height}px`

        this.body.appendChild(this.splitBody)

        const splitBodyRows = this.adapter!.rowCount - splitRow + extra

        // move heads into splitHead
        if (this.splitHead !== undefined) {
            for (let i = 0; i < splitBodyRows; ++i) {
                this.splitHead.appendChild(this.rowHeads!.children[splitRow])
            }
            // clone the filler
            this.splitHead.appendChild(this.rowHeads!.children[this.rowHeads!.children.length - 1].cloneNode())
        }

        // move cells into splitBody
        let idx = this.adapter!.colCount * splitRow
        for (let row = 0; row < splitBodyRows; ++row) {
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                this.splitBody.appendChild(this.body.children[idx])
            }
        }
    }

    // move 'splitBody' back into 'body' to end animation
    joinHorizontal(splitRow: number, delta: number, extra: number = 0, colCount?: number, rowCount?: number) {

        if (colCount === undefined) {
            colCount = this.adapter!.colCount
        }
        if (rowCount === undefined) {
            rowCount = this.adapter!.rowCount
        }

        const splitBodyRows = rowCount - splitRow + extra

        // move row headers back and adjust their positions
        if (this.rowHeads !== undefined) {
            const filler = this.rowHeads!.children[this.rowHeads!.children.length - 1] as HTMLSpanElement
            for (let row = 0; row < splitBodyRows; ++row) {
                const cell = this.splitHead!.children[0] as HTMLSpanElement
                const top = px2float(cell.style.top)
                cell.style.top = `${top + delta}px`
                this.rowHeads!.insertBefore(cell, filler)
            }
            const fillerTop = filler.style.top
            const top = px2float(fillerTop)
            filler.style.top = `${top + delta}px`

            // adjust handles and filler on the right
            let idx = splitRow
            for (let row = idx; row <= rowCount; ++row) {
                const cell = this.rowResizeHandles!.children[row] as HTMLSpanElement
                const top = px2float(cell.style.top)
                cell.style.top = `${top + delta}px`
            }
        }

        for (let row = 0; row < splitBodyRows; ++row) {
            for (let col = 0; col < colCount; ++col) {
                const cell = this.splitBody!.children[0] as HTMLSpanElement
                const top = px2float(cell.style.top)
                cell.style.top = `${top + delta}px`
                // console.log(`[${col},${row}] adjusted top of ${cell.innerText}`)
                this.body.appendChild(cell)
            }
        }

        if (this.rowHeads !== undefined) {
            this.root.removeChild(this.splitHead!)
            this.splitHead = undefined
        }
        this.body.removeChild(this.splitBody!)
        this.splitBody = undefined
    }

    setHeadingFillerSizeToScrollbarSize() {
        const bounds = this.body.getBoundingClientRect()
        if (this.colHeads !== undefined) {
            const w = Math.ceil(bounds.width - this.body.clientWidth);
            (this.colHeads.children[this.colHeads.children.length - 1] as HTMLSpanElement).style.width = `${w}px`
            this.colHeads.style.right = `${w}px`
        }
        if (this.rowHeads !== undefined) {
            const h = Math.ceil(bounds.height - this.body.clientHeight);
            (this.rowHeads.children[this.rowHeads.children.length - 1] as HTMLSpanElement).style.height = `${h}px`
            this.rowHeads.style.bottom = `${h}px`
        }
    }
}
Table.define("tx-table2", Table)
