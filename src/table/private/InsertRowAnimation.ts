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
import { Table, px2int, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"
import { span } from '@toad/util/lsx'

export class InsertRowAnimation extends TableAnimation {
    event: TableEvent
    totalHeight!: number
    done = false;
    colCount: number
    rowCount: number

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinHorizontal = this.joinHorizontal.bind(this)
        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
    }

    run() {
        this.prepareCells()
        setTimeout(() => {
            // FIXME: if stop is called before this is executed (unlikely), stop will fail
            this.arrangeMeasuredRowsInGrid()
            this.splitHorizontal(this.event.index + this.event.size)
            this.splitBody.style.transitionProperty = "transform"
            this.splitBody.style.transitionDuration = Table.transitionDuration
            this.splitBody.ontransitionend = this.joinHorizontal
            this.splitBody.ontransitioncancel = this.joinHorizontal
            setTimeout(() => {
                this.splitBody.style.transform = `translateY(${this.totalHeight}px)` // TODO: make this an animation
            }, Table.renderDelay)
        })
    }

    stop() {
        this.joinHorizontal()
        this.clearAnimation()
    }

    splitHorizontal(splitRow: number, extra: number = 0) {
        this.table.splitHorizontal(splitRow, extra)
    }

    joinHorizontal() {
        if (!this.done) {
            this.done = true
            this.table.joinHorizontal(this.event.index + this.event.size, this.totalHeight, 0, this.colCount, this.rowCount)
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }

    prepareCells() {
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            for (let col = 0; col < this.colCount; ++col) {
                const cell = span()
                this.adapter.showCell({col, row}, cell)
                this.measure.appendChild(cell)
            }
        }
    }

    arrangeMeasuredRowsInGrid() {

        const overlap = this.adapter.config.seamless ? 1 : 0
        
        // y := position of new row
        let idx = this.event.index * this.colCount
        let beforeChild
        let y
        // console.log(`event.index=${this,event.index}, idx=${idx}, children.length=${this.body.children.length}`)
        if (idx < this.body.children.length) {
            beforeChild = this.body.children[idx] as HTMLSpanElement
            y = px2int(beforeChild.style.top)
        } else {
            beforeChild = null
            if (this.body.children.length === 0) {
                y = 0
            } else {
                const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
                y = px2int(cell.style.top) + px2int(cell.style.height) + 1 - overlap
            }
        }

        // totalHeight := height of all columns to be inserted
        let totalHeight = 0
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            let rowHeight = this.table.minCellHeight
            for (let col = 0; col < this.colCount; ++col) {
                const child = this.measure.children[col]
                const bounds = child.getBoundingClientRect()
                rowHeight = Math.max(rowHeight, bounds.height)
            }
            rowHeight = Math.ceil(rowHeight - 2)

            if (this.rowHeads) {
                const newRowHead = span(this.adapter.getRowHead(row)!)
                newRowHead.className = "head"
                newRowHead.style.left = "0px"
                newRowHead.style.top = `${y}px`
                newRowHead.style.width = `${px2int(this.rowHeads.style.width)-6}px`
                newRowHead.style.height = `${rowHeight}px`
                this.rowHeads.insertBefore(newRowHead, this.rowHeads.children[row])

                const newRowHandle = this.table.createHandle(row, 0, y + rowHeight - 2, px2float(this.rowHeads.style.width), 5)
                this.rowResizeHandles.insertBefore(newRowHandle, this.rowResizeHandles.children[row])

                // adjust subsequent row heads and handles
                for(let subsequentRow=row+1; subsequentRow<this.rowCount; ++subsequentRow) {
                    this.rowHeads.children[subsequentRow].replaceChildren(
                        // span(
                            this.adapter.getRowHead(subsequentRow)!
                        // )
                    );
                    (this.rowResizeHandles.children[subsequentRow] as HTMLSpanElement).dataset["idx"] = `${subsequentRow}`
                }
            }

            // place all cell in row $row and move them from this.measure to this.body
            for (let col = 0; col < this.colCount; ++col) {
                const cell = this.measure.children[0] as HTMLSpanElement
                let neighbour
                if (row === 0 && this.event.index === 0) {
                    neighbour = this.body.children[col*2] as HTMLSpanElement
                } else {
                    neighbour = this.body.children[col] as HTMLSpanElement
                }
                cell.style.left = neighbour.style.left
                cell.style.top = `${y}px`
                cell.style.width = neighbour.style.width
                cell.style.height = `${rowHeight}px`
                this.body.insertBefore(cell, beforeChild)
            }
            y += rowHeight + 1 - overlap
            totalHeight += rowHeight
        }
        this.totalHeight = totalHeight + 1 - overlap

        // let txt = `InsertRowAnimation: table size ${this.colCount}, ${this.rowCount}\n`
        // idx = 0
        // for (let row = 0; row < this.rowCount; ++row) {
        // for (let col = 0; col < this.colCount; ++col) {
        //         let cell = this.body.children[idx++] as HTMLSpanElement
        //         txt = `${txt} ${cell.innerText}`
        //     }
        //     txt += "\n"
        // }
        // console.log(txt)
    }
}
