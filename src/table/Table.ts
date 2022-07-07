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
import { EditMode, TableAdapter } from './adapter/TableAdapter'
import { TableEvent } from './TableEvent'
import { TablePos } from './TablePos'
import { TableEditMode } from './TableEditMode'
import { TableEventType } from './TableEventType'
import { Animator } from '../util/animation'
import { TableAnimation } from './private/TableAnimation'
import { InsertRowAnimation } from './private/InsertRowAnimation'
import { RemoveRowAnimation } from './private/RemoveRowAnimation'
import { InsertColumnAnimation } from './private/InsertColumnAnimation'
import { RemoveColumnAnimation } from './private/RemoveColumnAnimation'

import { HTMLElementProps, setInitialProperties } from 'toad.jsx'

import { span, div, text } from '../util/lsx'
import { scrollIntoView } from '@toad/util/scrollIntoView'
import { style as txTable } from './style/tx-table'

// --spectrum-table-row-background-color-selected
// --spectrum-alias-highlight-selected
// --spectrum-alias-highlight-selected: rgba(20,115,230,0.1); // --tx-global-blue-500 with alias 0.1

export function px2int(s: string) {
    return parseInt(s.substring(0, s.length - 2))
}

export function px2float(s: string) {
    return parseFloat(s.substring(0, s.length - 2))
}

function isVisible(e: HTMLElement): boolean {
    if (window.getComputedStyle(e).display === "none") {
        return false
    }
    if (e.parentElement) {
        return isVisible(e.parentElement)
    }
    return true
}

interface TableProps extends HTMLElementProps {
    model?: TableModel
    selectionModel?: SelectionModel
}

export class Table extends View {
    // we can not calculate the layout when the table is not visible, hence we track the
    // visibility

    // when getBoundingClientRect() is used to measure the size of a cell, this
    // includes the padding and border, hence when using this size to set the size
    // of cells, we need to substract padding and border. which is where these
    // constants come in:
    public WIDTH_ADJUST = 6 // border left & right + padding top
    public HEIGHT_ADJUST = 2 // border left + padding top & bottom

    // FIXME: this can be improved:
    // * only add tables which are not visible
    // * disable observer when not needed
    // * don't observe the whole tree
    static observer: MutationObserver
    static allTables = new Set<Table>()
    visible = false

    // test api
    static transitionDuration = "500ms"
    animationDone?: () => void

    // delay before we can successfully start a transition after adding elements to the dom
    static renderDelay = 50

    // this will be set to lineheight
    minCellHeight = 0
    minCellWidth = 80

    protected editing?: TablePos

    // TODO: friend tabletool, ... should make these getters'n setters
    model?: TableModel
    selection?: SelectionModel
    protected adapter?: TableAdapter<any>

    protected root: HTMLDivElement // div containing everything else (why not host?)
    protected staging: HTMLDivElement
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

    private animator = new Animator()
    animation?: TableAnimation

    constructor(props?: TableProps) {
        super()

        this.arrangeAllMeasuredInGrid = this.arrangeAllMeasuredInGrid.bind(this)
        this.hostKeyDown = this.hostKeyDown.bind(this)
        this.cellKeyDown = this.cellKeyDown.bind(this)
        this.cellFocus = this.cellFocus.bind(this)
        this.focusIn = this.focusIn.bind(this)
        this.focusOut = this.focusOut.bind(this)
        this.pointerDown = this.pointerDown.bind(this)
        this.handleDown = this.handleDown.bind(this)
        this.handleMove = this.handleMove.bind(this)
        this.handleUp = this.handleUp.bind(this)
        this.setHeadingFillerSizeToScrollbarSize = this.setHeadingFillerSizeToScrollbarSize.bind(this)
        this.selectionChanged = this.selectionChanged.bind(this)
        this.modelChanged = this.modelChanged.bind(this)

        this.root = div(
            this.staging = div(),
            this.body = div()
        )
        this.root.className = "root"
        this.staging.className = "staging"
        this.body.className = "body"
        this.measure = div()
        this.measure.classList.add("measure")

        this.onkeydown = this.hostKeyDown
        this.addEventListener("focusin", this.focusIn)
        this.addEventListener("focusout", this.focusOut)

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

        this.attachShadow({ mode: 'open', delegatesFocus: true })
        this.attachStyle(txTable)
        this.shadowRoot!.appendChild(this.root)
        this.shadowRoot!.appendChild(this.measure)

        if (props) {
            setInitialProperties(this, props)
            if (props.selectionModel)
                this.setModel(props.selectionModel)
        }

        if (Table.observer === undefined) {
            Table.observer = new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
                Table.allTables.forEach(table => {
                    if (table.visible === false) {
                        table.prepareCells()
                    }
                })
            })
            Table.observer.observe(document.body, {
                attributes: true,
                subtree: true
            })
        }

    }

    override connectedCallback(): void {
        Table.allTables.add(this)
        super.connectedCallback()
        if (this.selection === undefined) {
            this.selection = new SelectionModel(TableEditMode.SELECT_CELL)
            this.selection.modified.add(this.selectionChanged, this)
        }
    }

    override disconnectedCallback(): void {
        Table.allTables.delete(this)
    }

    hostKeyDown(ev: KeyboardEvent) {
        // console.log(`Table.hostKeyDown: ${ev.key}, mode: ${TableEditMode[this.selection!.mode]}`)
        // // console.log(ev)
        if (!this.selection)
            return
        // // FIXME: based on the selection model we could plug in a behaviour class
        switch (this.selection.mode) {
            //     case TableEditMode.SELECT_ROW: {
            //         let row = this.selection.value.row
            //         switch (ev.key) {
            //             case "ArrowDown":
            //                 if (row + 1 < this.adapter!.rowCount)
            //                     ++row
            //                 break
            //             case "ArrowUp":
            //                 if (row > 0)
            //                     --row
            //                 break
            //         }
            //         this.selection.row = row
            //     } break
            case TableEditMode.SELECT_CELL: {
                let pos = { col: this.selection.col, row: this.selection.row }
                switch (ev.key) {
                    case "ArrowRight":
                        if (this.editing === undefined && pos.col + 1 < this.adapter!.colCount) {
                            ++pos.col
                            ev.preventDefault()
                            ev.stopPropagation()
                        }
                        break
                    case "ArrowLeft":
                        if (this.editing === undefined && pos.col > 0) {
                            --pos.col
                            ev.preventDefault()
                            ev.stopPropagation()
                        }
                        break
                    case "ArrowDown":
                        if (pos.row + 1 < this.adapter!.rowCount) {
                            ++pos.row
                            ev.preventDefault()
                            ev.stopPropagation()
                        }
                        break
                    case "ArrowUp":
                        if (pos.row > 0) {
                            --pos.row
                            ev.preventDefault()
                            ev.stopPropagation()
                        }
                        break
                    //             case "Tab":
                    //                 if (ev.shiftKey) {
                    //                     if (pos.col > 0) {
                    //                         --pos.col
                    //                         ev.preventDefault()
                    //                         ev.stopPropagation()
                    //                     } else {
                    //                         if (pos.row > 0) {
                    //                             pos.col = this.adapter!.colCount - 1
                    //                             --pos.row
                    //                             ev.preventDefault()
                    //                             ev.stopPropagation()
                    //                         }
                    //                     }
                    //                 } else {
                    //                     if (pos.col + 1 < this.adapter!.colCount) {
                    //                         ++pos.col
                    //                         ev.preventDefault()
                    //                         ev.stopPropagation()
                    //                     } else {
                    //                         if (pos.row + 1 < this.adapter!.rowCount) {
                    //                             pos.col = 0
                    //                             ++pos.row
                    //                             ev.preventDefault()
                    //                             ev.stopPropagation()
                    //                         }
                    //                     }
                    //                 }
                    //                 break
                    case "Enter":
                        if (this.adapter?.config.editMode !== EditMode.EDIT_ON_ENTER) {
                            break
                        }
                        if (this.editing === undefined) {
                            this.editCell()
                        } else {
                            this.saveCell()
                            if (pos.row + 1 < this.adapter!.rowCount) {
                                ++pos.row
                                this.selection.value = pos
                                this.editCell()
                            }
                        }
                        ev.preventDefault()
                        ev.stopPropagation()
                        break
                    // default:
                    //     console.log(ev)
                }
                this.selection.value = pos
            } break
        }
    }

    cellKeyDown(ev: KeyboardEvent) {
        const cell = ev.target as HTMLElement
        // console.log(`### CELL KEYDOWN ${ev.key}, edit=${cell.classList.contains("edit")}, editing=${this.editing !== undefined}`)
        // console.log(cell)
        if (ev.key === "Enter") {
            // console.log(`### CELL ENTER`)
            this.hostKeyDown(ev)
            ev.preventDefault()
            return
        }

        if (!cell.classList.contains("edit") && this.editing === undefined) {
            // console.log(`### CELL SPECIAL`)
            switch (ev.key) {
                case "ArrowDown":
                case "ArrowUp":
                case "ArrowRight":
                case "ArrowLeft":
                case "Tab":
                case "Enter":
                    // either let it bubble or just force it right here:
                    // this.hostKeyDown(ev)
                    // ev.preventDefault()
                    // return
                    break
                default:
                    // console.log("### CELL KEYDOWN PREVENT DEFAULT")
                    ev.preventDefault()
            }
        } else {
            // console.log(`### CELL NO SPECIAL`)
        }

        // console.log(`Table.cellKeyDown: ${ev.key}, mode: ${TableEditMode[this.selection!.mode]}`)
        // switch(ev.key) {
        //     case "ArrowDown":
        //     case "ArrowUp":
        //     case "ArrowRight": // FIXME: not when editing
        //     case "ArrowLeft": // FIXME: no when editing
        //     case "Tab":
        //     case "Enter":
        //         this.hostKeyDown(ev)
        //         break
        // }
    }

    cellFocus(event: FocusEvent) {
        // console.log("Table.cellFocus() >>>>>>>>>>>>>")
        const cell = event.target
        if (cell instanceof HTMLElement) {
            const b = cell.getBoundingClientRect()
            const p = this.clientPosToTablePos(b.x + b.width / 2, b.y + b.height / 2)
            if (p !== undefined) {
                this.selection!.value = p
            }
        }
    }

    focusIn(event: FocusEvent) {
        // console.log("Table.focusIn() >>>>>>>>>>>>>")
        // console.log(event)
        // if (event.target && event.relatedTarget) {
        //     try {
        //         if (isNodeBeforeNode(event.relatedTarget as Node, this)) {
        //             // console.log("Table.focusIn() -> 1st cell")
        //             this.selection!.value = { col: 0, row: 0 }
        //         } else {
        //             // console.log("Table.focusIn() -> last cell")
        //             this.selection!.value = { col: this.adapter!.colCount - 1, row: this.adapter!.rowCount - 1 }
        //         }
        //     }
        //     catch (e) { }
        // // } else {
        //     // console.log(`  target=${event.target}, relatedTarget=${event.relatedTarget}`)
        // }
        // this.selectionChanged() // HACK
        // // console.log("Table.focusIn() <<<<<<<<<<<<<<<")
    }

    focusOut(ev: FocusEvent) {
        // this.selectionChanged() // HACK
    }

    editCell() {
        const col = this.selection!.value.col
        const row = this.selection!.value.row
        const cell = this.body.children[col + row * this.adapter!.colCount] as HTMLSpanElement
        this.editing = new TablePos(col, row)
        cell.classList.add("edit")
        this.adapter!.editCell(this.editing, cell)
        // cell.onkeydown = this.cellKeyDown
    }

    saveCell() {
        if (this.editing === undefined) {
            return
        }
        const col = this.editing.col
        const row = this.editing.row
        const cell = this.body.children[col + row * this.adapter!.colCount] as HTMLSpanElement
        // console.log(`save cell ${this.editing.col}, ${this.editing.row}`)
        // cell.onkeydown = null
        cell.classList.remove("edit")
        this.adapter!.saveCell(this.editing, cell)
        this.editing = undefined
        this.focus()
    }

    pointerDown(ev: PointerEvent) {
        // // console.log("Table.pointerDown()")
        // ev.preventDefault()
        // // this.focus()

        // const pos = this.clientPosToTablePos(ev.clientX, ev.clientY)
        // if (pos === undefined) {
        //     return
        // }
        // this.selection!.value = pos
    }

    getModel(): TableModel | undefined {
        return this.model
    }

    override setModel(model?: TableModel | SelectionModel): void {
        if (model === undefined) {
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
            // console.log(`Table.setModel(TableModel)`)
            this.model = model
            this.model.modified.add(this.modelChanged, this)
            const adapter = TableAdapter.lookup(model) as new (model: TableModel) => TableAdapter<any>
            try {
                this.adapter = new adapter(model)
            }
            catch (e) {
                console.log(`Table.setModel(): failed to instantiate table adapter: ${e}`)
                console.log(`setting TypeScript's target to 'es6' might help`)
                throw e
            }
            // this.adapter.setModel(model)
            // this.updateCompact()
            // this.updateView()
            this.prepareCells()
            return
        }
        if ((model as any) instanceof Object) {
            throw Error("Table.setModel(): unexpected model of type " + (model as Object).constructor.name)
        }
    }

    selectionChanged() {
        // console.log(`Table.selectionChanged: ${this.selection?.col}, ${this.selection?.row}, mode=${this.selection ? TableEditMode[this.selection!.mode] : 'undefined'}`)
        if (this.selection === undefined) {
            return
        }
        this.saveCell()
        switch (this.selection.mode) {
            case TableEditMode.EDIT_CELL: {
                // this.log(Log.SELECTION, `Table.createSelection(): mode=EDIT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                if (document.activeElement === this) {
                    const cell = this.body.children[this.selection!.col + this.selection!.row * this.adapter!.colCount] as HTMLSpanElement
                    cell.focus()
                    scrollIntoView(cell)
                }
            } break
            case TableEditMode.SELECT_CELL: {
                // this.log(Log.SELECTION, `Table.createSelection(): mode=SELECT_CELL, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                if (document.activeElement === this) {
                    const cell = this.body.children[this.selection!.col + this.selection!.row * this.adapter!.colCount] as HTMLSpanElement
                    cell.focus()
                    scrollIntoView(cell)
                }
                break
            }
            case TableEditMode.SELECT_ROW: {
                // this.log(Log.SELECTION, `Table.createSelection(): mode=SELECT_ROW, selection=${this.selectionModel.col}, ${this.selectionModel.row}`)
                // this.toggleRowSelection(this.selectionModel.value.row, true)
                break
            }
        }
    }

    modelChanged(event: TableEvent) {
        // console.log(`Table.modelChanged(${event})`)
        switch (event.type) {
            case TableEventType.CELL_CHANGED: {
                const cell = this.body.children[event.col + event.row * this.adapter!.colCount] as HTMLSpanElement
                this.adapter!.showCell(event, cell)
            } break
            case TableEventType.INSERT_ROW:
                this.animator.run(new InsertRowAnimation(this, event))
                break
            case TableEventType.REMOVE_ROW:
                this.animator.run(new RemoveRowAnimation(this, event))
                break
            case TableEventType.INSERT_COL:
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new InsertColumnAnimation(this, event)
                this.animation.run()
                break
            case TableEventType.REMOVE_COL:
                if (this.animation) {
                    this.animation.stop()
                }
                this.animation = new RemoveColumnAnimation(this, event)
                this.animation.run()
                break
            default:
                console.log(`Table.modelChanged(): ${event} is not implemented`)
        }
    }

    prepareCells() {
        if (!this.adapter) {
            return
        }
        this.visible = isVisible(this)
        if (!this.visible) {
            return
        }

        // console.log(`Table.prepareCells()`)
        // console.log(`  rows=${this.adapter!.rowCount}`)

        if (this.adapter!.config.seamless) {
            this.root.classList.add("seamless")
        }

        const measureLineHeight = span(text("Tg")) // let the adapter provide this
        this.measure.appendChild(measureLineHeight)

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
                const cell = this.createCell()
                this.adapter!.showCell({ col, row }, cell)
                this.measure.appendChild(cell)
            }
        }

        setTimeout(this.arrangeAllMeasuredInGrid, 0)
    }

    createCell() {
        const cell = span()
        cell.onfocus = this.cellFocus
        cell.onkeydown = this.cellKeyDown
        cell.tabIndex = 0
        if (this.adapter?.config.editMode === EditMode.EDIT_ON_ENTER) {
            cell.setAttribute("contenteditable", "")
        }
        return cell
    }

    // this method is called once during the initial setup
    // TODO: refactor so that it can also be used for insert operations
    arrangeAllMeasuredInGrid() {
        const seam = this.adapter!.config.seamless ? 0 : 1

        // use line height as minimal row height        
        const measureLineHeight = this.measure.children[0] as HTMLElement
        const b = measureLineHeight.getBoundingClientRect()
        this.minCellHeight = Math.ceil(b.height)
        this.measure.removeChild(this.measure.children[0])

        const colWidth = this.calculateColumnWidths()

        let colHeadHeight = 0
        if (this.colHeads) {
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[col]
                const bounds = child.getBoundingClientRect()
                colHeadHeight = Math.max(colHeadHeight, bounds.height)
            }
        }
        colHeadHeight = Math.ceil(colHeadHeight)

        // calculate row widths and row header width

        let idx = this.colHeads ? this.adapter!.colCount : 0
        let rowHeadWidth = 0
        const rowHeight = Array<number>(this.adapter!.rowCount)
        if (this.rowHeads) {
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                const child = this.measure.children[idx++]
                const bounds = child.getBoundingClientRect()
                rowHeight[row] = Math.max(bounds.height, this.minCellHeight)
                rowHeadWidth = Math.max(rowHeadWidth, bounds.width)
            }
        } else {
            rowHeight.fill(this.minCellHeight)
        }
        rowHeadWidth = Math.ceil(rowHeadWidth)

        // calculate body row heights
        idx = (this.colHeads ? this.adapter!.colCount : 0) + (this.rowHeads ? this.adapter!.rowCount : 0)
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            let rh = rowHeight[row]
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[idx + col + row * this.adapter!.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                rh = Math.max(rh, bounds.height)
                // console.log(`[${col},${row}] -> ${bounds.width}, ${bounds.height}`)
            }
            rowHeight[row] = Math.ceil(rh)
        }

        // move and place column heads
        let x, y
        if (this.colHeads) {
            x = 0
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `0px`
                child.style.width = `${colWidth[col] - this.WIDTH_ADJUST}px`
                child.style.height = `${colHeadHeight - this.HEIGHT_ADJUST}px`
                this.colHeads.appendChild(child)
                x += colWidth[col] - 1 - 1 + seam
            }

            let filler = span()
            filler.className = "head"
            filler.style.left = `${x}px`
            filler.style.top = `0`
            filler.style.width = `256px`
            filler.style.height = `${colHeadHeight}px`
            this.colHeads.appendChild(filler)

            this.colHeads.style.left = `${rowHeadWidth - 1}px`
            this.colHeads.style.height = `${colHeadHeight}px`

            // if resizeableColumns
            this.colResizeHandles!.style.left = `${rowHeadWidth}px`
            this.colResizeHandles!.style.height = `${colHeadHeight}px`
            x = -3
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                x += colWidth[col] - 1
                const handle = this.createHandle(col, x, 0, 5, colHeadHeight)
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
                child.style.width = `${rowHeadWidth - this.WIDTH_ADJUST}px`
                child.style.height = `${rowHeight[row] - this.HEIGHT_ADJUST}px`
                this.rowHeads.appendChild(child)
                y += rowHeight[row] - 1 - 1 + seam
            }

            let filler = span()
            filler.className = "head"
            filler.style.left = `0`
            filler.style.top = `${y}px`
            filler.style.width = `${rowHeadWidth}px`
            filler.style.height = `256px`
            this.rowHeads.appendChild(filler)

            // this.rowHeads.style.left = `0px`
            this.rowHeads.style.top = `${colHeadHeight - 1}px`
            this.rowHeads.style.width = `${rowHeadWidth}px`
            // this.rowHeads.style.bottom = `0`

            // if resizeableRows
            this.rowResizeHandles!.style.top = `${colHeadHeight}px`
            this.rowResizeHandles!.style.width = `${rowHeadWidth}px`
            y = -3
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                y += rowHeight[row] - 1
                const rowHandle = this.createHandle(row, 0, y, rowHeadWidth, 5)
                this.rowResizeHandles!.appendChild(rowHandle)
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
                child.style.width = `${colWidth[col] - this.WIDTH_ADJUST}px`
                child.style.height = `${rowHeight[row] - this.HEIGHT_ADJUST}px`
                this.body.appendChild(child)
                x += colWidth[col] - 2 + seam
            }
            y += rowHeight[row] - 2 + seam
        }
        if (rowHeadWidth > 0) {
            --rowHeadWidth
        }
        if (colHeadHeight > 0) {
            --colHeadHeight
        }
        this.body.style.left = `${rowHeadWidth}px`
        this.body.style.top = `${colHeadHeight}px`

        this.setHeadingFillerSizeToScrollbarSize()
    }

    setColumnWidths(withinBody = false, colWidth: number[]) {
        const overlap = this.adapter!.config.seamless ? 1 : 0
        let idx = 0
        for (let row = 0; row < this.adapter!.rowCount; ++row) {
            let x = 0
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                let child
                if (withinBody) {
                    child = this.body.children[idx++] as HTMLSpanElement
                } else {
                    child = this.measure.children[0] as HTMLSpanElement
                    this.body.appendChild(child)
                }
                child.style.left = `${x}px`
                child.style.width = `${colWidth[col] - this.WIDTH_ADJUST}px`
                x += colWidth[col] - 4 - overlap
            }
        }
    }

    calculateColumnWidths(withinBody = false): number[] {
        // console.log(`calculateColumnWidths(withinBody = ${withinBody})`)
        // header
        const colWidth = Array<number>(this.adapter!.colCount)
        if (this.colHeads) {
            for (let col = 0; col < this.adapter!.colCount; ++col) {
                const child = this.measure.children[col]
                const bounds = child.getBoundingClientRect()
                colWidth[col] = Math.max(bounds.width, this.minCellWidth)
            }
        } else {
            colWidth.fill(this.minCellWidth)
        }

        // body
        let idxStart
        if (withinBody) {
            idxStart = 0
        } else {
            idxStart = (this.colHeads ? this.adapter!.colCount : 0) + (this.rowHeads ? this.adapter!.rowCount : 0)
        }
        for (let col = 0; col < this.adapter!.colCount; ++col) {
            let cw = colWidth[col]
            for (let row = 0; row < this.adapter!.rowCount; ++row) {
                let child
                let idx = idxStart + col + row * this.adapter!.colCount
                if (withinBody) {
                    child = this.body.children[idx] as HTMLSpanElement
                } else {
                    child = this.measure.children[idx] as HTMLSpanElement
                }
                const bounds = child.getBoundingClientRect()
                cw = Math.max(cw, bounds.width)
            }
            colWidth[col] = Math.ceil(cw)
        }
        return colWidth
    }

    createHandle(idx: number, x: number, y: number, w: number, h: number) {
        const handle = span()
        handle.className = "handle"
        handle.style.left = `${x}px`
        handle.style.top = `${y}px`
        handle.style.width = `${w}px`
        handle.style.height = `${h}px`
        handle.dataset["idx"] = `${idx}`
        handle.onpointerdown = this.handleDown
        handle.onpointermove = this.handleMove
        handle.onpointerup = this.handleUp
        return handle
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
        if (colCount === undefined) {
            colCount = this.adapter!.colCount
        }
        if (rowCount === undefined) {
            rowCount = this.adapter!.rowCount
        }

        const splitBodyColumns = colCount - splitCol + extra
        let idx = splitCol - extra

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

            // adjust handles and filler on the right
            for (let col = idx; col <= colCount; ++col) {
                const cell = this.colResizeHandles!.children[col] as HTMLSpanElement
                const left = px2float(cell.style.left)
                cell.style.left = `${left + delta}px`
            }
        }

        for (let row = 0; row < rowCount; ++row) {
            let beforeChild = this.body.children[idx] as HTMLSpanElement
            for (let col = 0; col < splitBodyColumns; ++col) {
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

    // move all rows in body into splitBody, starting with row splitRow
    // splitRow refers to the actual display, not to the model
    splitHorizontalNew(splitRow: number) {
        // console.log(`Table.splitHorizontalNew(splitRow=${splitRow})`)
        const overlap = this.adapter!.config.seamless ? 0 : 1
        this.splitBody = div()
        this.splitBody.style.transitionProperty = "transform"
        this.splitBody.style.transitionDuration = Table.transitionDuration
        this.splitBody.className = "splitBody"
        this.splitBody.style.left = `0`
        this.splitBody.style.right = `0`
        this.splitBody.style.backgroundColor = 'rgba(255,128,0,0.5)'
        const idx = splitRow * this.adapter!.colCount
        if (this.body.children.length === 0) {
            this.splitBody.style.top = `0px`
            this.splitBody.style.height = `1px`
        } else
            if (idx < this.body.children.length) {
                // console.log(`  split at existing row`)
                let cell = this.body.children[idx] as HTMLSpanElement
                let col = this.adapter!.colCount
                let height = 0
                const top = px2float(cell.style.top)
                while (idx < this.body.children.length) {
                    cell = this.body.children[idx] as HTMLSpanElement
                    --col
                    if (col === 0) {
                        const b = cell.getBoundingClientRect()
                        height += b.height - overlap
                        col = this.adapter!.colCount
                    }
                    let y = px2float(cell.style.top)
                    cell.style.top = `${y - top}px`
                    this.splitBody.appendChild(cell)
                }
                height += overlap
                this.splitBody.style.top = `${top}px`
                this.splitBody.style.height = `${height}px`
            } else {
                let cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
                let b = cell.getBoundingClientRect()
                let top = px2float(cell.style.top) + b.height - overlap
                this.splitBody.style.top = `${top}px`
                this.splitBody.style.height = `1px`
            }
        this.body.appendChild(this.splitBody)
    }

    splitHorizontal(splitRow: number, extra: number = 0, event?: TableEvent) {
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
        this.splitBody.style.backgroundColor = 'rgba(255,128,0,0.5)'

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

        if (this.splitBody.children.length > 0) {
            // console.log("[0]")
            idx = this.splitBody.children.length - 1
            const last = this.splitBody.children[idx] as HTMLElement
            const top = px2int(last.style.top)
            for (let i = 0; i < this.splitBody.children.length; ++i) {
                const c = this.splitBody.children[i] as HTMLElement
                const y = px2int(c.style.top)
                c.style.top = `${y - top}px`
            }
            this.splitBody.style.backgroundColor = '#f80' // #1e1e1e
            this.splitBody.style.top = `${top}px`
            this.splitBody.style.height = `${b.height - top}px`
        } else
            if (event !== undefined && this.body.children.length > 0) {
                // console.log("[1]")
                idx = event.index * this.adapter!.colCount
                const last = this.body.children[idx] as HTMLElement
                const top = px2int(last.style.top)
                this.splitBody.style.top = `${top}px`
                this.splitBody.style.height = `${b.height - top}px`
            } else
                if (this.body.children.length > 0) {
                    // console.log("[2]")
                    const filler = span()
                    idx = this.body.children.length - 2
                    const last = this.body.children[idx] as HTMLElement
                    const bf = this.body.children[idx].getBoundingClientRect()
                    filler.style.border = 'none'
                    filler.style.backgroundColor = '#1e1e1e'
                    // filler.style.backgroundColor = '#f80'
                    const top = px2int(last.style.top) + bf.height
                    // console.log(last)
                    filler.style.top = `${top}px`
                    filler.style.left = `0px`
                    filler.style.width = `${b.width - 2}px`
                    filler.style.height = `${b.height - top}px`
                    this.splitBody.appendChild(filler)
                } else {
                    // FIXME: handle case when that are no children, then top is 0
                    // console.log("[3]")
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

    protected clientPosToTablePos(x: number, y: number): TablePos | undefined {
        let col, row
        for (col = 0; col < this.adapter!.colCount; ++col) {
            const b = this.body.children[col]!.getBoundingClientRect()
            if (b.x <= x && x < b.x + b.width)
                break
        }
        if (col >= this.adapter!.colCount) {
            return undefined
        }
        let idx = 0
        for (row = 0; row < this.adapter!.rowCount; ++row) {
            const b = this.body.children[idx]!.getBoundingClientRect()
            if (b.y <= y && y < b.y + b.height)
                break
            idx += this.adapter!.colCount
        }
        if (row >= this.adapter!.rowCount) {
            return undefined
        }
        return new TablePos(col, row)
    }
}
Table.define("tx-table", Table)
