/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TablePos } from '../TablePos'
import { TableEvent } from '../TableEvent'
import { Table, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"
import { span, div } from '@toad/util/lsx'

export class InsertRowAnimation extends TableAnimation {
    static current?: InsertRowAnimation
    event: TableEvent
    totalHeight!: number
    done = false;
    initialRowCount: number
    mask!: HTMLSpanElement
    splitHead!: HTMLDivElement
    headMask!: HTMLSpanElement

    animationTop!: number
    animationHeight!: number

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinHorizontal = this.joinHorizontal.bind(this)
        this.initialRowCount = this.adapter.rowCount - event.size
        InsertRowAnimation.current = this
    }

    prepare(): void {
        this.prepareCellsToBeMeasured()
        this.prepareStagingWithRows()
    }
    firstFrame(): void {
        this.arrangeNewRowsInStaging()
        this.splitHorizontal()
    }
    animationFrame(n: number): void {
        const y = this.animationTop + n * this.animationHeight
        this.splitBody.style.top = `${y}px`
        this.mask.style.top = `${y}px`
        if (this.rowHeads !== undefined) {
            this.splitHead.style.top = `${y}px`
            this.headMask.style.top = `${y}px`
        }
    }
    lastFrame(): void {
        const y = this.animationTop + this.animationHeight
        this.splitBody.style.top = `${y}px`
        this.mask.style.top = `${y}px`
        if (this.rowHeads !== undefined) {
            this.splitHead.style.top = `${y}px`
            this.headMask.style.top = `${y}px`
        }

        this.joinHorizontal()
        this.disposeStaging()
    }

    public prepareCellsToBeMeasured() {
        this.table.prepareMinCellSize()
        // console.log(`InsertRowAnimation.prepareCellsToBeMeasured(): model=${this.adapter.model.colCount}x${this.adapter.model.rowCount}, adapter=${this.adapter.colCount}x${this.adapter.rowCount}, index=${this.event.index}, size=${this.event.size}`)

        // append row headers
        let rowHeaders = new Array(this.event.size)
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            const content = this.adapter!.getRowHead(row)
            if (this.rowHeads === undefined && content !== undefined) {
                this.rowHeads = div()
                this.rowHeads.className = "rows"
                this.root.appendChild(this.rowHeads)
                this.rowResizeHandles = div()
                this.rowResizeHandles.className = "rows"
                this.root.appendChild(this.rowResizeHandles)
            }
            rowHeaders[row - this.event.index] = content
        }
        if (this.rowHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = span(rowHeaders[row])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // FIXME: this is likely mostly duplicated code
        if (this.colHeads === undefined && this.adapter.colCount === this.event.size) {
            let colHeaders = new Array(this.adapter.colCount)
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const content = this.adapter!.getColumnHead(col)
                if (this.colHeads === undefined && content !== undefined) {
                    this.colHeads = div()
                    this.colHeads.className = "cols"
                    this.root.appendChild(this.colHeads)
                    this.colResizeHandles = div()
                    this.colResizeHandles.className = "cols"
                    this.root.appendChild(this.colResizeHandles)
                }
                colHeaders[col] = content
            }
            if (this.colHeads !== undefined) {
                for (let col = 0; col < this.adapter.colCount; ++col) {
                    const cell = span(colHeaders[col])
                    cell.className = "head"
                    this.measure.appendChild(cell)
                }
            }
        }

        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.table.createCell()
                this.adapter.showCell(new TablePos(col, row), cell)
                this.measure.appendChild(cell)
            }
        }
    }

    // FIXME: while this works, it reads like a terrible pile of garbage
    public arrangeNewRowsInStaging() {
        this.table.calculateMinCellSize()
        const overlap = this.adapter.config.seamless ? 0 : 1

        // top := y position of the 1st cell to be inserted
        let top = 0
        let idx = this.event.index * this.adapter!.colCount
        if (this.body.children.length !== 0) {
            if (idx < this.body.children.length) {
                let cell = this.body.children[idx] as HTMLSpanElement
                top = px2float(cell.style.top)
            } else {
                let cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
                let b = cell.getBoundingClientRect()
                top = px2float(cell.style.top) + b.height - overlap
            }
        }

        // colWidth[] := width of all existing columns || minCellWidth
        let colWidth = new Array<number>(this.adapter.colCount)
        if (this.body.children.length > 0) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.body.children[col] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                colWidth[col] = bounds.width
                if (this.adapter.config.seamless) {
                    colWidth[col] += 2
                }
            }
        } else {
            colWidth.fill(this.table.minCellWidth)
        }

        // --------------------------------

        // rowHeadWidth := width of the row head column
        // FIXME: this doesn't work when we're in an empty table as the rowHeads ain't there yet
        let rowHeadWidth = this.table.minCellWidth
        // take width of existing row heads
        if (this.rowHeads && this.rowHeads.children.length > 0) {
            const cell = this.rowHeads.children[0] as HTMLSpanElement
            const bounds = cell.getBoundingClientRect()
            rowHeadWidth = Math.max(rowHeadWidth, bounds.width)
            if (this.adapter.config.seamless) {
                rowHeadWidth += 2
            }
        }

        // rowHeight[] := height of each row to be inserted
        // totalHeight := height of all rows to be inserted
        // colWidth[]  : adjust if needed to new rows
        let rowHeight = new Array<number>(this.event.size)
        rowHeight.fill(this.table.minCellHeight)
        this.totalHeight = 0
        idx = 0
        if (this.rowHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                rowHeight[row] = Math.max(rowHeight[row], bounds.height)
                rowHeadWidth = Math.max(rowHeadWidth, bounds.width)
            }
        }
        rowHeadWidth = Math.ceil(rowHeadWidth)
        if (this.rowHeads) {
            this.rowHeads.style.top = `0px`
            this.rowHeads.style.bottom = `0px`
            this.rowHeads.style.width = `${rowHeadWidth}px`
            this.body.style.left = `${rowHeadWidth - overlap}px`
            this.staging.style.left = `${rowHeadWidth - overlap}px`
        }

        let colHeadHeight = this.table.minCellHeight
        if (this.colHeads !== undefined && this.colHeads.children.length === 0 && this.adapter.rowCount == this.event.size) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                colWidth[col] = Math.max(colWidth[col], bounds.width - this.table.WIDTH_ADJUST)
                colHeadHeight = Math.max(colHeadHeight, bounds.height - this.table.HEIGHT_ADJUST)
            }
        }
        colHeadHeight = Math.ceil(colHeadHeight)

        for (let row = 0; row < this.event.size; ++row) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()

                rowHeight[row] = Math.max(rowHeight[row], bounds.height)

                if (this.adapter.config.expandColumn) {
                    colWidth[col] = Math.ceil(Math.max(colWidth[col], bounds.width))
                } else {
                    // if there were no columns yet, use the new rows column width
                    if (row === 0 && this.body.children.length === 0) {
                        // FIXME: this needs to work differently when there are column headers
                        colWidth[col] = Math.ceil(bounds.width)
                    }
                }
            }
            this.totalHeight += rowHeight[row] - overlap
        }

        // when expandColumn => adust left & width of all cells
        if (this.adapter.config.expandColumn) {
            idx = 0
            let x = 0
            let col = 0
            while (idx < this.body.children.length) {
                const cell = this.body.children[idx] as HTMLSpanElement
                cell.style.left = `${x}px`
                cell.style.width = `${colWidth[col] - this.table.WIDTH_ADJUST}px`

                x += colWidth[col] - overlap
                if (this.adapter.config.seamless) {
                    x -= 2
                }
                // console.log(`cell[${idx}] to ${colWidth[col] - this.table.WIDTH_ADJUST}`)
                ++col
                ++idx
                if (col >= this.adapter.colCount) {
                    x = 0
                    col = 0
                }
            }
        }

        this.totalHeight += overlap
        if (this.adapter.config.seamless) {
            this.totalHeight -= 2 * this.event.size
        }

        // place row headers
        let y = top
        if (this.rowHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = this.measure.children[0] as HTMLSpanElement
                this.setCellSize(cell, 0, y, rowHeadWidth, rowHeight[row]) // FIXME: fixed row head width
                this.headStaging.appendChild(cell)

                y += rowHeight[row] - overlap
                if (this.adapter.config.seamless) {
                    y -= 2
                }
            }
        }

        // place column headers
        if (this.colHeads !== undefined && this.colHeads.children.length === 0 && this.adapter.rowCount == this.event.size) {
            let x = 0
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[0] as HTMLSpanElement
                cell.style.left = `${x}px`
                cell.style.width = `${colWidth[col]  - this.table.WIDTH_ADJUST}px`
                cell.style.height = `${colHeadHeight}px`
                this.colHeads.appendChild(cell)
                x += colWidth[col] - overlap
            }
            // rowHeadWidth += this.table.WIDTH_ADJUST
            colHeadHeight += this.table.HEIGHT_ADJUST
            this.body.style.top = `${colHeadHeight-overlap}px`
            this.staging.style.top = `${colHeadHeight-overlap}px`
            this.headStaging.style.top = `${colHeadHeight-overlap}px`
            this.rowHeads.style.top = `${colHeadHeight-overlap}px`
            this.colHeads.style.left = `${rowHeadWidth-overlap}px`
            this.colHeads.style.right = `0px`
            this.colHeads.style.height = `${colHeadHeight}px`
        }

        // place body cells
        y = top
        for (let row = 0; row < this.event.size; ++row) {
            let x = 0
            // console.log(`row ${row} at y = ${y}`)
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[0] as HTMLElement
                this.setCellSize(cell, x, y, colWidth[col], rowHeight[row])
                this.staging.appendChild(cell)
                x += colWidth[col] - overlap
                if (this.adapter.config.seamless) {
                    x -= 2
                }

            }
            y += rowHeight[row] - overlap
            if (this.adapter.config.seamless) {
                y -= 2
            }
        }

        // create mask
        this.mask = span()
        // this.mask.className = "mask"
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `0`
        this.mask.style.right = `0`
        this.mask.style.top = `${top}px`
        this.mask.style.border = 'none'
        this.mask.style.height = `${this.totalHeight}px`
        this.mask.style.backgroundColor = Table.maskColor
        this.staging.appendChild(this.mask)

        if (this.rowHeads !== undefined) {
            this.headMask = span()
            this.headMask.style.boxSizing = `content-box`
            this.headMask.style.left = `0`
            this.headMask.style.right = `0`
            this.headMask.style.top = `${top}px`
            this.headMask.style.border = 'none'
            this.headMask.style.height = `${this.totalHeight}px`
            this.headMask.style.backgroundColor = Table.maskColor
            this.headStaging.appendChild(this.headMask)
        }
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)

        if (this.rowHeads !== undefined) { // FIXME: Hack
            this.splitHead = this.rowHeads.lastElementChild as HTMLDivElement
        }

        this.animationHeight = this.totalHeight
        if (this.initialRowCount !== 0) {
            const overlap = this.adapter.config.seamless ? 0 : 1
            this.animationHeight -= overlap
        }
        this.animationTop = px2float(this.splitBody.style.top)
    }

    joinHorizontal() {
        if (this.done) {
            return
        }
        this.done = true

        if (this.rowHeads) {
            this.headStaging.removeChild(this.headMask)
            this.rowHeads.removeChild(this.splitHead)
            while (this.headStaging.children.length > 0) {
                this.rowHeads.appendChild(this.headStaging.children[0])
            }
            if (this.splitHead.children.length > 0) {
                let top = px2float(this.splitHead.style.top)
                while (this.splitHead.children.length > 0) {
                    const cell = this.splitHead.children[0] as HTMLSpanElement
                    cell.style.top = `${px2float(cell.style.top) + top}px`
                    this.rowHeads.appendChild(cell)
                }
            }
        }
        this.staging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)
        while (this.staging.children.length > 0) {
            this.body.appendChild(this.staging.children[0])
        }
        if (this.splitBody.children.length > 0) {
            let top = px2float(this.splitBody.style.top)
            while (this.splitBody.children.length > 0) {
                const cell = this.splitBody.children[0] as HTMLSpanElement
                cell.style.top = `${px2float(cell.style.top) + top}px`
                this.body.appendChild(cell)
            }
        }
        if (this.table.animationDone) {
            this.table.animationDone()
        }
    }
}
