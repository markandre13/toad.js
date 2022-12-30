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
import { InsertAnimation } from "./InsertAnimation"

export class InsertColumnAnimation extends InsertAnimation {
    static current?: InsertColumnAnimation
    colCount: number
    rowCount: number

    constructor(table: Table, event: TableEvent) {
        super(table, event)
        this.event = event
        this.join = this.join.bind(this)
        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
        InsertColumnAnimation.current = this
    }

    prepareStaging() {
        this.prepareStagingWithColumns()
    }
    animate(pos: number) {
        this.mask.style.left = `${pos}px`
        this.splitBody.style.left = `${pos}px`
        if (this.colHeads !== undefined) {
            this.splitHead.style.left = `${pos}px`
            this.headMask.style.left = `${pos}px`
        }
    }

    // TODO: share code with InsertRowAnimation
    prepareCellsToBeMeasured() {
        this.table.prepareMinCellSize()
        // append column headers
        let colHeaders = new Array(this.event.size)
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            const content = this.adapter!.getColumnHead(col)
            if (this.colHeads === undefined && content !== undefined) {
                this.colHeads = div()
                this.colHeads.className = "cols"
                this.root.appendChild(this.colHeads)
                this.colResizeHandles = div()
                this.colResizeHandles.className = "cols"
                this.root.appendChild(this.colResizeHandles)
            }
            colHeaders[col - this.event.index] = content
        }
        if (this.colHeads !== undefined) {
            for (let row = 0; row < this.event.size; ++row) {
                const cell = span(colHeaders[row])
                cell.className = "head"
                this.measure.appendChild(cell)
            }
        }

        // FIXME: this is likely mostly duplicated code
        if (this.rowHeads === undefined && this.adapter.rowCount === this.event.size) {
            let rowHeaders = new Array(this.adapter.rowCount)
            for (let row = 0; row < this.adapter.rowCount; ++row) {
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
            if (this.rowHeads !== undefined) {
                for (let row = 0; row < this.adapter.rowCount; ++row) {
                    const cell = span(rowHeaders[row])
                    cell.className = "head"
                    this.measure.appendChild(cell)
                }
            }
        }

        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = span()
                this.table.showCell(new TablePos(col, row), cell)
                this.measure.appendChild(cell)
            }
        }
    }

    public arrangeInStaging() {
        this.table.calculateMinCellSize()
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
        this.animationStart = left

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
        // colHeadHeight = 19 + overlap // FIXME: hack
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
        this.totalSize = 0
        idx = 0
        if (this.colHeads !== undefined) {
            for (let col = 0; col < this.event.size; ++col) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                colWidth[col] = Math.max(colWidth[col], bounds.width)
                colHeadHeight = Math.max(colHeadHeight, bounds.height)
            }
        }
        colHeadHeight = Math.ceil(colHeadHeight)

        let rowHeadWidth = 0
        if (this.rowHeads !== undefined && this.rowHeads.children.length === 0 && this.adapter.colCount == this.event.size) {
            rowHeadWidth = this.table.minCellWidth
            for (let row = 0; row < this.adapter.rowCount; ++row) {
                const cell = this.measure.children[idx++] as HTMLSpanElement
                const bounds = cell.getBoundingClientRect()
                rowHeight[row] = Math.max(rowHeight[row], bounds.height - this.table.HEIGHT_ADJUST)
                rowHeadWidth = Math.max(rowHeadWidth, bounds.width - this.table.WIDTH_ADJUST)
            }
        } else {
            if (this.rowHeads !== undefined) {
                const b = this.rowHeads.children[0].getBoundingClientRect()
                rowHeadWidth = b.width - this.table.WIDTH_ADJUST
            }
        }
        rowHeadWidth = Math.ceil(rowHeadWidth)
        if (this.colHeads) {
            if (rowHeadWidth === 0) {
                this.colHeads.style.left = `0px`
            } else {
                this.colHeads.style.left = `${rowHeadWidth + this.table.WIDTH_ADJUST + 2 - overlap}px` // FIXME: why do i cal
            }
            this.colHeads.style.right = `0px`
            this.colHeads.style.height = `${colHeadHeight}px`
            this.body.style.top = `${colHeadHeight - 1}px`
            this.bodyStaging.style.top = `${colHeadHeight - 1}px`
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
            this.totalSize += colWidth[col] - overlap
        }
        colWidth.forEach((v, i) => colWidth[i] = v + 4)

        // when expandColumn => adust left & width of all cells
        // TBD

        this.totalSize += overlap
        if (this.adapter.config.seamless) {
            this.totalSize -= 2 * this.event.size
        }

        // place column headers
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

        // place row headers
        if (this.rowHeads !== undefined && this.rowHeads.children.length === 0 && this.adapter.colCount == this.event.size) {
            let y = 0
            for (let row = 0; row < this.adapter.rowCount; ++row) {
                const cell = this.measure.children[0] as HTMLSpanElement
                cell.style.top = `${y}px`
                cell.style.height = `${rowHeight[row] - this.table.HEIGHT_ADJUST}px`
                cell.style.width = `${rowHeadWidth}px`
                this.rowHeads.appendChild(cell)
                y += rowHeight[row] - overlap
            }
            rowHeadWidth += this.table.WIDTH_ADJUST
            this.body.style.left = `${rowHeadWidth - overlap}px`
            this.bodyStaging.style.left = `${rowHeadWidth - overlap}px`
            this.headStaging.style.left = `${rowHeadWidth - overlap}px`
            this.colHeads.style.left = `${rowHeadWidth - overlap}px`
            this.rowHeads.style.top = `${colHeadHeight - overlap}px`
            this.rowHeads.style.bottom = `0px`
            this.rowHeads.style.width = `${rowHeadWidth}px`
        }

        // place body cells
        let totalWidth = 0
        x = left
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            let columnWidth = colWidth[col - this.event.index]
            let y = 0
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = this.measure.children[0] as HTMLSpanElement
                this.setCellSize(cell, x, y, columnWidth, rowHeight[row])
                this.bodyStaging.appendChild(cell)
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
        this.totalSize = totalWidth + 2

        this.mask = this.makeColumnMask(left, this.totalSize)
        this.bodyStaging.appendChild(this.mask)

        if (this.colHeads !== undefined) {
            this.headMask = this.makeColumnMask(left, this.totalSize)
            this.headStaging.appendChild(this.headMask)
        }
    }

    split() {
        this.table.splitVerticalNew(this.event.index)

        if (this.colHeads !== undefined) { // FIXME: Hack
            this.splitHead = this.colHeads.lastElementChild as HTMLDivElement
        }
    }

    joinHeader() {
        if (this.colHeads === undefined) {
            return
        }
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

    joinBody() {
        this.bodyStaging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)

        const totalWidth = this.adapter.model.colCount
        const bodyWidth = this.event.index
        const stagingWidth = this.event.size
        const splitWidth = totalWidth - stagingWidth - this.event.index

        // insert staging (cells are per column)
        for (let col = 0; col < stagingWidth; ++col) {
            for (let row = 0; row < this.rowCount; ++row) {
                const cell = this.bodyStaging.children[0]
                const idx = row * (bodyWidth + stagingWidth) + bodyWidth + col
                this.bodyInsertAt(cell, idx)
            }
        }

        let left = this.totalSize + this.animationStart
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
