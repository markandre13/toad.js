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

import { TableEvent } from '../TableEvent'
import { Table, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"
import { span } from '@toad/util/lsx'

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
    }

    public prepareCellsToBeMeasured() {
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.table.createCell()
                this.adapter.showCell({ col, row }, cell)
                this.measure.appendChild(cell)
            }
        }
    }

    public arrangeNewRowsInStaging() {
        const overlap = this.adapter.config.seamless ? 0 : 1

        const splitRow = this.event.index
        let idx = splitRow * this.adapter!.colCount
        let top = 0
        if (this.body.children.length === 0) {} else
        if (idx < this.body.children.length) {
            let cell = this.body.children[idx] as HTMLSpanElement
            top = px2float(cell.style.top)
        } else {
            let cell = this.body.children[this.body.children.length-1] as HTMLSpanElement
            let b = cell.getBoundingClientRect()
            top = px2float(cell.style.top) + b.height - overlap
        }

        // measure row
        this.totalHeight = 0
        let colWidth = new Array<number>(this.adapter.colCount)
        let rowHeight = new Array<number>(this.event.size)
        rowHeight.fill(this.table.minCellHeight)
        idx = 0
        for (let row = 0; row < this.event.size; ++row) {
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[idx++]
                const bounds = cell.getBoundingClientRect()
                colWidth[col] = Math.ceil(bounds.width)
                rowHeight[row] = Math.max(rowHeight[row], bounds.height)
            }
            this.totalHeight += rowHeight[row] - overlap
        }
        this.totalHeight += overlap
        if (this.adapter.config.seamless) {
            this.totalHeight -= 2 * this.event.size
        }

        // place row
        let y = top
        for (let row = 0; row < this.event.size; ++row) {
            let x = 0
            console.log(`row ${row} at y = ${y}`)
            for (let col = 0; col < this.adapter.colCount; ++col) {
                const cell = this.measure.children[0] as HTMLElement
                cell.style.left = `${x}px`
                cell.style.top = `${y}px`
                cell.style.width = `${colWidth[col] - this.table.WIDTH_ADJUST}px`
                cell.style.height = `${rowHeight[row] - this.table.HEIGHT_ADJUST}px`
                this.staging.appendChild(cell)
                x += colWidth[col] - overlap
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
        this.mask.style.transitionProperty = "transform"
        this.mask.style.transitionDuration = Table.transitionDuration
        this.mask.style.height = `${this.totalHeight}px`
        this.mask.style.backgroundColor = `rgba(0,0,128,0.3)`
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
        if (!this.done) {
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
}
