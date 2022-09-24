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
        this.prepareStaging()
        this.prepareCellsToBeMeasured()
    }
    firstFrame(): void {
        this.arrangeNewRowsInStaging()
        this.splitHorizontal()
    }
    animationFrame(n: number): void {
        const y = this.animationTop + n * this.animationHeight
        this.splitBody.style.top = `${y}px`
        this.mask.style.top = `${y}px`
    }
    lastFrame(): void {
        const y = this.animationTop + this.animationHeight
        this.splitBody.style.top = `${y}px`
        this.mask.style.top = `${y}px`
        this.joinHorizontal()
        this.disposeStaging()
    }

    public prepareCellsToBeMeasured() {
        // console.log(`InsertRowAnimation.prepareCellsToBeMeasured(): model=${this.adapter.model.colCount}x${this.adapter.model.rowCount}, adapter=${this.adapter.colCount}x${this.adapter.rowCount}, index=${this.event.index}, size=${this.event.size}`)

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
        const overlap = this.adapter.config.seamless ? 0 : 1

        // top := y position of the 1st cell to be inserted
        let top = 0
        const splitRow = this.event.index
        let idx = splitRow * this.adapter!.colCount
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

        // colWidth[] := width of existing columns || minCellWidth
        let colWidth = new Array<number>(this.adapter.colCount)
        if (this.body.children.length !== 0) {
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

        // rowHeight[] := height of each row to be inserted && totalHeight := height of all rows to be inserted
        let rowHeight = new Array<number>(this.event.size)
        this.totalHeight = 0
        rowHeight.fill(this.table.minCellHeight)
        idx = 0
        if (this.rowHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                rowHeight[row] = Math.max(rowHeight[row], bounds.height)
            }
        }
        for (let row = 0; row < this.event.size; ++row) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                if (this.adapter.config.expandColumn) {
                    colWidth[col] = Math.ceil(Math.max(colWidth[col], bounds.width))
                } else {
                    if (row === 0 && this.body.children.length === 0) {
                        colWidth[col] = Math.ceil(bounds.width)
                    }
                }
                // console.log(`  measured colWidth[${col}]: bounds.width=${bounds.width}, cell.style.width=${cell.style.width}`)
                rowHeight[row] = Math.max(rowHeight[row], bounds.height)
            }
            this.totalHeight += rowHeight[row] - overlap
        }

        // adust left & width of all cells
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

        // place rows
        let y = top

        if (this.rowHeads !== undefined) {

            // TODO: we could use staging to be behind body _and_ headers,
            // but what if the body and header frames impose different styles on their children?
            // it would also avoid tweaks in the calculation to have two different stagings
            // why is staging part of Table anyway?

            // this.headStaging = div()
            // this.headStaging.classList.add("staging")
            // this.root.insertBefore(this.headStaging, this.root.children[0])

            for (let row = 0; row < this.event.size; ++row) {
                const cell = this.measure.children[0] as HTMLSpanElement
                this.setCellSize(cell, 0, y, 20, rowHeight[row])
                this.headStaging.appendChild(cell)

                y += rowHeight[row] - overlap
                if (this.adapter.config.seamless) {
                    y -= 2
                }
            }
        }

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
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)
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
