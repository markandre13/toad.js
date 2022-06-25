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
import { span, div } from '@toad/util/lsx'

export class InsertRowAnimation extends TableAnimation {
    static halt = false
    static current?: InsertRowAnimation
    event: TableEvent
    totalHeight!: number
    done = false;
    initialColCount: number
    initialRowCount: number
    mask!: HTMLSpanElement

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinHorizontal = this.joinHorizontal.bind(this)
        this.initialColCount = this.adapter.colCount
        this.initialRowCount = this.adapter.rowCount
    }

    run() {
        if (InsertRowAnimation.halt) {
            console.log("NO ANIMATION")
            InsertRowAnimation.current = this
            return
        }
        console.log("RUNNING INSERT ROW ANIMATION") 
        this.prepareCellsToBeMeasured()
        setTimeout(() => {
            // FIXME: if stop is called before this is executed (unlikely), stop will fail
            this.arrangeNewRowsInStaging()
            this.splitHorizontal()
            // this.splitBody.style.transitionProperty = "transform"
            // this.splitBody.style.transitionDuration = Table.transitionDuration
            // this.splitBody.ontransitionend = this.joinHorizontal
            // this.splitBody.ontransitioncancel = this.joinHorizontal
            setTimeout(() => {
                this.animate()
            }, Table.renderDelay)
        }, 0)
    }

    stop() {
        this.joinHorizontal()
        this.clearAnimation()
    }

    prepareCellsToBeMeasured() {
        console.log(`InsertRowAnimation.prepareCellsToBeMeasured(): ${this.initialColCount} x ${this.event.size}`)
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            for (let col = 0; col < this.initialColCount; ++col) {
                const cell = span()
                this.adapter.showCell({ col, row }, cell)
                this.measure.appendChild(cell)
            }
        }
    }

    arrangeNewRowsInStaging() {
        const overlap = this.adapter.config.seamless ? 0 : 1

        // measure row
        let rowHeight = this.table.minCellHeight
        let colWidth = new Array<number>(this.adapter.colCount)
        for (let col = 0; col < this.adapter.colCount; ++col) {
            const cell = this.measure.children[col]
            const bounds = cell.getBoundingClientRect()
            colWidth[col] = Math.ceil(bounds.width)
            rowHeight = Math.max(rowHeight, bounds.height)
            console.log(`measured ${col} bounds to be ${bounds.width} x ${bounds.height}`)
        }
        this.totalHeight = rowHeight + 2

        // place row
        let y = 0
        let x = 0
        for (let col = 0; col < this.adapter.colCount; ++col) {
            const cell = this.measure.children[0] as HTMLElement
            cell.style.left = `${x}px`
            cell.style.top = `${y}px`
            cell.style.width = `${colWidth[col]}px`
            cell.style.height = `${rowHeight}px`
            console.log(`move cell ${col} to staging`)
            this.staging.appendChild(cell)
            x += colWidth[col] + 6 - overlap
        }

        this.mask = span()
        // this.mask.className = "mask"
        this.mask.style.left = `0`
        this.mask.style.right = `0`
        this.mask.style.top = `0px`
        this.mask.style.border = 'none'
        this.mask.style.transitionProperty = "transform"
        this.mask.style.transitionDuration = Table.transitionDuration
        this.mask.style.height = `${this.totalHeight}px`
        this.mask.style.backgroundColor = `rgba(0,0,128,0.3)`
        this.staging.appendChild(this.mask)
    }

    splitHorizontal() {
        // this should take: row to split at
        this.table.splitHorizontalNew(this.event.index)
    }

    animate() {
        this.mask.style.transform = `translateY(${this.totalHeight}px)`
        this.splitBody.style.transform = `translateY(${this.totalHeight}px)`
    }

    joinHorizontal() {
        if (!this.done) {
            this.done = true

            this.staging.removeChild(this.mask)
            while(this.staging.children.length > 0) {
                this.body.appendChild(this.staging.children[0])
            }

            // this should work without any arguments
            // * append splitbody to body
            // * adjust cells y from split body by splitbody y
            // this.table.joinHorizontal(this.event.index + this.event.size, this.totalHeight, 0, this.initialColCount, this.initialRowCount)
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }

    arrangeMeasuredRowsBodyOld() {
        // when there are seams, we overlap them
        const overlap = this.adapter.config.seamless ? 0 : 1
        const overlapX = this.adapter.config.seamless ? 1 : 0 // REMOVE

        // y := position of new row
        let idx = this.event.index * this.initialColCount
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
                y = px2int(cell.style.top) + px2int(cell.style.height) + 1 - overlapX
            }
        }

        // totalHeight := height of all columns to be inserted
        let totalHeight = 0
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            // rowHeight := ...
            let rowHeight = this.table.minCellHeight
            for (let col = 0; col < this.initialColCount; ++col) {
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
                if (!this.adapter.config.expandColumn) {
                    newRowHead.style.width = `${px2int(this.rowHeads.style.width) - 6}px`
                }
                newRowHead.style.height = `${rowHeight}px`
                this.rowHeads.insertBefore(newRowHead, this.rowHeads.children[row])

                const newRowHandle = this.table.createHandle(row, 0, y + rowHeight - 2, px2float(this.rowHeads.style.width), 5)
                this.rowResizeHandles.insertBefore(newRowHandle, this.rowResizeHandles.children[row])

                // adjust subsequent row heads and handles
                for (let subsequentRow = row + 1; subsequentRow < this.initialRowCount; ++subsequentRow) {
                    this.rowHeads.children[subsequentRow].replaceChildren(
                        // span(
                        this.adapter.getRowHead(subsequentRow)!
                        // )
                    );
                    (this.rowResizeHandles.children[subsequentRow] as HTMLSpanElement).dataset["idx"] = `${subsequentRow}`
                }
            }

            // place all cells in row $row and move them from this.measure to this.body
            if (this.body.children.length === 0) {
                let x = 0
                for (let col = 0; col < this.initialColCount; ++col) {
                    const cell = this.measure.children[0] as HTMLSpanElement
                    const b = cell.getBoundingClientRect()
                    cell.style.left = `${x}px`
                    cell.style.top = `${y}px`
                    if (!this.adapter.config.expandColumn) {
                        cell.style.width = `${b.width}px`
                        x += b.width + 6 - overlap
                    }
                    cell.style.height = `${rowHeight}px`
                    this.body.insertBefore(cell, beforeChild)
                }
            } else {
                for (let col = 0; col < this.initialColCount; ++col) {
                    const cell = this.measure.children[0] as HTMLSpanElement
                    let neighbour
                    if (row === 0 && this.event.index === 0) {
                        neighbour = this.body.children[col * 2] as HTMLSpanElement
                    } else {
                        neighbour = this.body.children[col] as HTMLSpanElement
                    }
                    cell.style.left = neighbour.style.left
                    cell.style.top = `${y}px`
                    if (!this.adapter.config.expandColumn) {
                        cell.style.width = neighbour.style.width
                    }
                    cell.style.height = `${rowHeight}px`
                    this.body.insertBefore(cell, beforeChild)
                }
            }
            y += rowHeight + 1 - overlapX
            totalHeight += rowHeight
        }
        this.totalHeight = totalHeight + 1 - overlapX

        if (this.adapter.config.expandColumn) {
            const colWidth = this.calculateColumnWidths(true)
            this.setColumnWidths(true, colWidth) // FIXME: THIS ALSO NEEDS TO ADJUST COLUMN HEADERS AND THE HANDLES!!!
        }

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
