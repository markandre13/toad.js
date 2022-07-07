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
import { span } from '@toad/util/lsx'
import { Table, px2int, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"

export class InsertColumnAnimation extends TableAnimation {
    event: TableEvent
    totalWidth!: number
    done = false;
    colCount: number
    rowCount: number

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinVertical = this.joinVertical.bind(this)
        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
    }

    prepare(): void {}
    firstFrame(): void {}
    animationFrame(value: number): void {}
    lastFrame(): void {}

    override run() {
        this.prepareCells()
        setTimeout(() => {
            // FIXME: if stop is called before this is executed (unlikely), stop will fail
            this.arrangeMeasuredColumnsInGrid()
            // console.log(`split at column index=${this.event.index}, size=${this.event.size}`)
            this.splitVertical(this.event.index + this.event.size)
            this.splitBody.style.transitionProperty = "transform"
            this.splitBody.style.transitionDuration = Table.transitionDuration
            this.splitBody.ontransitionend = this.joinVertical
            this.splitBody.ontransitioncancel = this.joinVertical
            setTimeout(() => {
                this.splitBody.style.transform = `translateX(${this.totalWidth}px)` // TODO: make this an animation
            }, Table.renderDelay)
        })
    }

    override stop() {
        this.joinVertical()
        this.clearAnimation()
    }

    splitVertical(splitColumn: number, extra: number = 0) {
        this.table.splitVertical(splitColumn, extra)
    }

    joinVertical() {
        if (!this.done) {
            this.done = true
            this.table.joinVertical(this.event.index + this.event.size, this.totalWidth, 0, this.colCount, this.rowCount)
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }

    prepareCells() {
        for (let row = 0; row < this.rowCount; ++row) {
            for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
                const cell = span()
                this.adapter.showCell({col, row}, cell)
                this.measure.appendChild(cell)
            }
        }
    }

    arrangeMeasuredColumnsInGrid() {

        // x := x position of new column
        let idx = this.event.index
        let x
        // console.log(`idx=${idx}, colCount=${this.colCount}`)
        if (idx < this.colCount-1) {
            let cell  = this.body.children[idx] as HTMLSpanElement
            x = px2int(cell.style.left)
            // console.log(`COLUMN IS LEFT: place new column at x = ${x}`)
        } else {
            if (this.body.children.length === 0) {
                x = 0
                // console.log(`COLUMN IS FIRST: place new column at x = ${x}`)
            } else {
                const cell = this.body.children[this.colCount - 2] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                x = px2int(cell.style.left) + px2int(cell.style.width) + 6 - 1
                // console.log(`COLUMN IS RIGHT: place new column at x = ${x}`)
            }
        }

        // totalWidth := width of all columns to be inserted
        // place cells
        let totalWidth = 0
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            // columnWidth := width of this column
            let columnWidth = this.table.minCellHeight
            for (let row = 0; row < this.rowCount; ++row) {
                const child = this.measure.children[row]
                const bounds = child.getBoundingClientRect()
                columnWidth = Math.max(columnWidth, bounds.width)
            }
            columnWidth = Math.ceil(columnWidth - 2)

            if (this.colHeads) {
                const newColHead = span(this.adapter.getColumnHead(col)!)
                newColHead.className = "head"
                newColHead.style.left = `${x}px`
                newColHead.style.top = "0px"
                newColHead.style.width = `${columnWidth - 5}px`
                newColHead.style.height = `${px2int(this.colHeads.style.height)-2}px`
                this.colHeads.insertBefore(newColHead, this.colHeads.children[col])

                const newRowHandle = this.table.createHandle(col, x + columnWidth - 3, 0, 5, px2float(this.colHeads.style.height))
                this.colResizeHandles.insertBefore(newRowHandle, this.colResizeHandles.children[col])

                // adjust subsequent row heads and handles
                for(let subsequentCol=col+1; subsequentCol<this.colCount; ++subsequentCol) {
                    this.colHeads.children[subsequentCol].replaceChildren(
                        // span(
                            this.adapter.getColumnHead(subsequentCol)!
                        // )
                    );
                    (this.colResizeHandles.children[subsequentCol] as HTMLSpanElement).dataset["idx"] = `${subsequentCol}`
                }
            }

            // place all cells in column $col and move them from this.measure to this.body
            for (let row = 0; row < this.rowCount; ++row) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = (this.body.children[row * this.colCount] as HTMLSpanElement).style.top // FIXME: hack
                child.style.width = `${columnWidth - 5}px`
                child.style.height = (this.body.children[row * this.colCount] as HTMLSpanElement).style.height // FIXME: hack
                let beforeChild
                if (idx < this.body.children.length) {
                    beforeChild = this.body.children[idx] as HTMLSpanElement
                } else {
                    beforeChild = null
                }
                this.body.insertBefore(child, beforeChild)
                idx += this.colCount
            }
            x += columnWidth
            totalWidth += columnWidth
        }
        this.totalWidth = totalWidth
    }
}
