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
import { span, div } from '@toad/util/lsx'
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
    splitHead!: HTMLDivElement
    headMask!: HTMLSpanElement

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinVertical = this.joinVertical.bind(this)
        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
        InsertColumnAnimation.current = this
    }

    prepare(): void {
        this.prepareStagingWithColumns()
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
        if (this.colHeads !== undefined) {
            this.splitHead.style.left = `${x}px`
            this.headMask.style.left = `${x}px`
        }
    }
    lastFrame(): void {
        const x = this.animationLeft + this.totalWidth
        this.mask.style.left = `${x}px`
        this.splitBody.style.left = `${x}px`
        if (this.colHeads !== undefined) {
            this.splitHead.style.left = `${x}px`
            this.headMask.style.left = `${x}px`
        }
        this.joinVertical()
        this.disposeStaging()
    }

    // TODO: share code with InsertRowAnimation
    prepareCellsToBeMeasured() {

        let colHeaders = new Array(this.event.size)
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            const content = this.adapter!.getColumnHead(col)
            if (this.rowHeads === undefined && content !== undefined) {
                this.rowHeads = div()
                this.rowHeads.className = "cols"
                this.root.appendChild(this.rowHeads)
                this.rowResizeHandles = div()
                this.rowResizeHandles.className = "cols"
                this.root.appendChild(this.rowResizeHandles)
            }
            colHeaders[col - this.event.index] = content
        }
        if (this.rowHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = span(colHeaders[row])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = span()
                this.adapter.showCell(new TablePos(col, row), cell)
                this.measure.appendChild(cell)
            }
        }
    }

    // TODO: REVERT ALL CHANGES AND THEN REFACTOR INTO THE INSERTROWANIMATION APPROACH
    // WHILE USING THE TESTS AS GUIDANCE!!!

    public arrangeNewColumnsInStaging() {      
        const previousColCount = this.colCount - this.event.size
        const overlap = this.adapter.config.seamless ? 0 : 1
        
        // left := x position of new column
        let left
        let idx = this.event.index
        if (idx < previousColCount) {
            let cell = this.body.children[idx] as HTMLSpanElement
            left = px2int(cell.style.left)
        } else {
            if (this.body.children.length === 0) {
                left = 0
            } else {
                const cell = this.body.children[previousColCount - 1] as HTMLSpanElement
                left = px2int(cell.style.left) + px2int(cell.style.width) + this.table.WIDTH_ADJUST - overlap
            }
        }
        this.animationLeft = left

        // rowHeight[] := height of existing rows || minCellHeight
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

        //----------------------------------------------

        // colHeadHeight := height of the column head row
        let colHeadHeight = this.table.minCellHeight
        if (this.colHeads && this.colHeads.children.length > 0) {
            const cell = this.colHeads.children[0] as HTMLSpanElement
            const bounds = cell.getBoundingClientRect()
            colHeadHeight = bounds.height
            if (this.adapter.config.seamless) {
                colHeadHeight += 2
            }
        }

        // rowHeight[] := height of each row to be inserted
        // totalHeight := height of all rows to be inserted
        // colWidth[]  : adjust if needed to new rows
        let colWidth = new Array<number>(this.event.size)
        colWidth.fill(this.table.minCellWidth)
        this.totalWidth = 0
        idx = 0
        if (this.colHeads !== undefined) {
            for (let col = 0; col < this.event.size; ++col) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                colWidth[col] = Math.max(colWidth[col], bounds.width)
                // console.log(`calculate new width of column ${col}`)
                // console.log(`  colWidth[${col}]: ${colWidth[col]}: '${cell.innerHTML}' with width ${bounds.width}`)
            }
        }
        for (let col = 0; col < this.event.size; ++col) {
            for (let row = 0; row < this.adapter.rowCount; ++row) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()

                colWidth[col] = Math.ceil(Math.max(colWidth[col], bounds.width) - 2)
                // console.log(`  colWidth[${col}]: ${colWidth[col]}: '${cell.innerHTML}' with width ${bounds.width}`)

                if (this.adapter.config.expandRow) {
                    rowHeight[col] = Math.ceil(Math.max(rowHeight[row], bounds.height))
                } else {
                    // if there were no columns yet, use the new rows column width
                    if (col === 0 && this.body.children.length === 0) {
                        rowHeight[row] = Math.ceil(bounds.height)
                    }
                }
            }
            this.totalWidth += colWidth[col] - overlap
        }
        colWidth.forEach((v,i) => colWidth[i] = v + 4)

        // when expandColumn => adust left & width of all cells
        // TBD

        this.totalWidth += overlap
        if (this.adapter.config.seamless) {
            this.totalWidth -= 2 * this.event.size
        }

        // place row headers
        let x = left
        if (this.colHeads !== undefined) {
            for (let col = 0; col < this.event.size; ++col) {
                const cell = this.measure.children[0] as HTMLSpanElement
                this.setCellSize(cell, x, 0, colWidth[col], colHeadHeight) // FIXME: fixed row head width
                this.headStaging.appendChild(cell)

                x += colWidth[col] - overlap
                if (this.adapter.config.seamless) {
                    x -= 2
                }
            }
        }

        // place body cells
        let totalWidth = 0
        x = left
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            let columnWidth = colWidth[col-this.event.index]
            let y = 0
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = this.measure.children[0] as HTMLSpanElement
                this.setCellSize(cell, x, y, columnWidth, rowHeight[row])
                this.staging.appendChild(cell)
                y += rowHeight[row] - overlap
                if (this.adapter.config.seamless) {
                    y -= 2
                }
            }
            x += columnWidth - overlap - 2
            if (!this.adapter.config.seamless) {
                x += 2
            }
            totalWidth += columnWidth - 2
        }
        this.totalWidth = totalWidth + 2

        this.mask = span()
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `${left}px`
        this.mask.style.width = `${this.totalWidth}px`
        this.mask.style.top = `0`
        this.mask.style.bottom = `0`
        this.mask.style.border = 'none'
        this.mask.style.backgroundColor = Table.maskColor
        this.staging.appendChild(this.mask)

        if (this.colHeads !== undefined) {
            this.headMask = span()
            this.headMask.style.boxSizing = `content-box`
            this.headMask.style.left = `${left}px`
            this.headMask.style.width = `${this.totalWidth}px`
            this.headMask.style.top = `0`
            this.headMask.style.bottom = `0`
            this.headMask.style.border = 'none'
            this.headMask.style.backgroundColor = Table.maskColor
            this.headStaging.appendChild(this.headMask)
        }
    }

    splitVertical() {
        this.table.splitVerticalNew(this.event.index)

        if (this.colHeads !== undefined) { // FIXME: Hack
            this.splitHead = this.colHeads.lastElementChild as HTMLDivElement
        }
    }

    joinVertical() {
        if (this.done) {
            return
        }
        this.done = true

        if (this.colHeads) {
            this.headStaging.removeChild(this.headMask)
            this.colHeads.removeChild(this.splitHead)
            while (this.headStaging.children.length > 0) {
                this.colHeads.appendChild(this.headStaging.children[0])
            }
            if (this.splitHead.children.length > 0) {
                let left = px2float(this.splitHead.style.left)
                while (this.splitHead.children.length > 0) {
                    const cell = this.splitHead.children[0] as HTMLSpanElement
                    cell.style.left = `${px2float(cell.style.left) + left}px`
                    this.colHeads.appendChild(cell)
                }
            }
        }

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
        // if (!this.adapter.config.seamless) {
        //     left += 2
        // }

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
