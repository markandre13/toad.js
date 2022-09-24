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
import { TablePos } from '../TablePos'
import { span } from '@toad/util/lsx'
import { Table, px2int, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"

export class InsertColumnAnimation extends TableAnimation {
    static current?: InsertColumnAnimation
    event: TableEvent
    totalWidth!: number
    animationLeft!: number
    done = false;
    colCount: number
    rowCount: number
    mask!: HTMLSpanElement

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinVertical = this.joinVertical.bind(this)
        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
        InsertColumnAnimation.current = this
    }

    prepare(): void {
        this.prepareStaging()
        this.prepareCellsToBeMeasured()
    }
    firstFrame(): void {
        this.arrangeNewColumnsInStaging()
        this.splitVertical()
    }
    animationFrame(n: number): void {
        const x = this.animationLeft + n * this.totalWidth
        this.mask.style.left = `${x}px`
        this.splitBody.style.left = `${x}px`
    }
    lastFrame(): void {
        const x = this.animationLeft + this.totalWidth
        this.mask.style.left = `${x}px`
        this.splitBody.style.left = `${x}px`
        this.joinVertical()
        this.disposeStaging()
    }

    prepareCellsToBeMeasured() {
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = span()
                this.adapter.showCell(new TablePos(col, row), cell)
                this.measure.appendChild(cell)
            }
        }
    }

    public arrangeNewColumnsInStaging() {      
        // console.log(`arrangeNewColumnsInStaging <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`)
        const overlap = this.adapter.config.seamless ? 0 : 1
        const previousColCount = this.colCount - this.event.size
        // left := x position of new column
        let idx = this.event.index
        let left
        // console.log(`idx=${idx}, colCount=${this.colCount}`)
        if (idx < previousColCount) {
            let cell = this.body.children[idx] as HTMLSpanElement
            left = px2int(cell.style.left)
            // console.log(`COLUMN IS LEFT: place new column at left = ${left}`)
        } else {
            if (this.body.children.length === 0) {
                left = 0
                // console.log(`COLUMN IS FIRST: place new column at left = ${left}`)
            } else {
                const cell = this.body.children[previousColCount - 1] as HTMLSpanElement
                left = px2int(cell.style.left) + px2int(cell.style.width) + this.table.WIDTH_ADJUST - overlap
                // console.log(`COLUMN ${idx} IS RIGHT: place new column at left = ${left}`)
            }
        }
        // console.log(`LEFT = ${left}`)
        this.animationLeft = left

        // we need the height of all columns
        // rowHeight[] := width of existing columns || minCellWidth
        let rowHeight = new Array<number>(this.adapter.rowCount)
        if (this.body.children.length !== 0) {
            for (let row = 0; row < this.adapter.rowCount; ++row) {
                const cell = this.body.children[row * previousColCount] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                rowHeight[row] = bounds.height
                if (this.adapter.config.seamless) {
                    rowHeight[row] += 2
                }
            }
        } else {
            rowHeight.fill(this.table.minCellHeight)
        }

        // for (let i = 0; i < this.measure.children.length; ++i) {
        //     const child = this.measure.children[i]
        //     const bounds = child.getBoundingClientRect()
        //     console.log(`            measure[${i}] ${child.innerHTML} -> ${bounds.width}`)
        // }

        // console.log(`arrangeNewColumnsInStaging: index=${this.event.index}, size=${this.event.size}, adapter=${this.adapter.colCount} x ${this.adapter.rowCount}, model=${this.adapter.model.colCount} x ${this.adapter.model.rowCount}`)

        // totalWidth := width of all columns to be inserted
        // place cells
        let totalWidth = 0
        let x = left
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            // columnWidth := width of this column
            let columnWidth = this.table.minCellWidth
            for (let row = 0; row < this.rowCount; ++row) {
                const child = this.measure.children[row]
                const bounds = child.getBoundingClientRect()
                // console.log(`    ${child.innerHTML} -> width = ${bounds.width}`)
                columnWidth = Math.max(columnWidth, bounds.width)
            }
            columnWidth = Math.ceil(columnWidth - 2)
            // console.log(`  measure column ${col} -> width = ${columnWidth}`)

            // if (this.colHeads) {
            //     const newColHead = span(this.adapter.getColumnHead(col)!)
            //     newColHead.className = "head"
            //     newColHead.style.left = `${x}px`
            //     newColHead.style.top = "0px"
            //     newColHead.style.width = `${columnWidth - 5}px`
            //     newColHead.style.height = `${px2int(this.colHeads.style.height)-2}px`
            //     this.colHeads.insertBefore(newColHead, this.colHeads.children[col])

            //     const newRowHandle = this.table.createHandle(col, x + columnWidth - 3, 0, 5, px2float(this.colHeads.style.height))
            //     this.colResizeHandles.insertBefore(newRowHandle, this.colResizeHandles.children[col])

            //     // adjust subsequent row heads and handles
            //     for(let subsequentCol=col+1; subsequentCol<this.colCount; ++subsequentCol) {
            //         this.colHeads.children[subsequentCol].replaceChildren(
            //             // span(
            //                 this.adapter.getColumnHead(subsequentCol)!
            //             // )
            //         );
            //         (this.colResizeHandles.children[subsequentCol] as HTMLSpanElement).dataset["idx"] = `${subsequentCol}`
            //     }
            // }

            // place all cells in column $col and move them from this.measure to this.staging

            let y = 0
            for (let row = 0; row < this.rowCount; ++row) {
                // console.log(`    pos=${col} x ${row}, measure.length=${this.measure.children.length}, body.length=${this.body.children.length}, staging.length=${this.staging.children.length}`)
                // console.log(`    cell=${col}, ${row}; pos=${x}, ${y}`)
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `${y}px`
                child.style.width = `${columnWidth - 4}px` // TODO this.table.WIDTH_ADJUST
                child.style.height = `${rowHeight[row] - this.table.HEIGHT_ADJUST}px`
                this.staging.appendChild(child)
                y += rowHeight[row] - overlap
                if (this.adapter.config.seamless) {
                    y -= 2
                }
            }
            x += columnWidth - overlap
            if (!this.adapter.config.seamless) {
                x += 2
            }
            totalWidth += columnWidth
        }
        this.totalWidth = totalWidth

        this.mask = span()
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `${left}px`
        this.mask.style.width = `${this.totalWidth}px`
        this.mask.style.top = `0`
        this.mask.style.bottom = `0`
        this.mask.style.border = 'none'
        this.mask.style.backgroundColor = Table.maskColor
        this.staging.appendChild(this.mask)
    }

    splitVertical() {
        this.table.splitVerticalNew(this.event.index)
    }

    joinVertical() {
        if (this.done) {
            return
        }
        this.done = true

        this.staging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)

        const totalWidth = this.adapter.model.colCount
        const bodyWidth = this.event.index
        const stagingWidth = this.event.size
        const splitWidth = totalWidth - stagingWidth - this.event.index

        // insert staging (cells are per column)
        for (let col = 0; col < stagingWidth; ++col) {
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = this.staging.children[0]
                const idx = row * (bodyWidth + stagingWidth) + bodyWidth + col
                this.bodyInsertAt(cell, idx)
            }
        }

        let left = this.totalWidth + this.animationLeft
        if (!this.adapter.config.seamless) {
            left += 2
        }

        // insert splitBody (whose cells are per row)
        for (let row = 0; row < this.rowCount; ++row) {
            for (let col = 0; col < splitWidth; ++col) {
                const cell = this.splitBody.children[0] as HTMLSpanElement
                cell.style.left = `${px2float(cell.style.left) + left}px`
                const idx = row * totalWidth + bodyWidth + stagingWidth + col
                this.bodyInsertAt(cell, idx)
            }
        }

        if (this.table.animationDone) {
            this.table.animationDone()
        }
    }

    bodyInsertAt(node: Element, idx: number) {
        let beforeChild
        if (idx < this.body.children.length) {
            beforeChild = this.body.children[idx] as HTMLSpanElement
        } else {
            beforeChild = null
        }
        this.body.insertBefore(node, beforeChild)
    }
}
