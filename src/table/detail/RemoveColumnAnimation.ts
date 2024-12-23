/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2024 Mark-André Hopf <mhopf@mark13.org>
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

import { RemoveColEvent } from "../TableEvent"
import { Table, px2float } from "../Table"
import { TableAnimation } from "./TableAnimation"

export class RemoveColumnAnimation extends TableAnimation {
    event: RemoveColEvent
    initialWidth: number
    totalWidth!: number
    done = false
    colCount: number
    rowCount: number
    animationWidth!: number
    leftSplitBody!: number
    leftMask!: number
    mask!: HTMLSpanElement
    splitHead!: HTMLDivElement
    headMask!: HTMLSpanElement

    static current: RemoveColumnAnimation

    constructor(table: Table, event: RemoveColEvent) {
        super(table)

        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount

        this.event = event
        this.joinVertical = this.joinVertical.bind(this)

        if (this.body.children.length === 0) {
            this.initialWidth = 0
        } else {
            const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
            const left = px2float(cell.style.left)
            const bounds = cell.getBoundingClientRect()
            this.initialWidth = left + bounds.width
        }
        // this.overlap = this.adapter.config.seamless ? 0 : 1
        // this.removeAll = this.event.index >= this.adapter.rowCount
        RemoveColumnAnimation.current = this
    }

    prepare(): void {
        this.prepareStagingWithColumns()
        this.arrangeColumnsInStaging()
        this.splitVertical()
    }
    firstFrame(): void {}
    animationFrame(n: number): void {
        let a = 0
        if (this.adapter.config.seamless) {
            a = 1
        }
        this.splitBody.style.left = `${this.leftSplitBody - n * this.animationWidth + a}px`
        this.mask.style.left = `${this.leftMask - n * this.animationWidth}px`
        if (this.colHeads !== undefined) {
            this.splitHead.style.left = `${this.leftSplitBody - n * this.animationWidth + a}px`
            this.headMask.style.left = `${this.leftMask - n * this.animationWidth}px`
        }
    }
    lastFrame(): void {
        this.joinVertical()
        this.disposeStaging()
    }

    arrangeColumnsInStaging() {
        // body
        let idx = this.event.index
        for (let row = 0; row < this.adapter.rowCount; ++row) {
            for (let col = 0; col < this.event.size; ++col) {
                this.bodyStaging.appendChild(this.body.children[idx])
            }
            idx += this.colCount
        }

        const firstCellOfStaging = this.bodyStaging.children[0] as HTMLSpanElement
        const lastCellOfStaging = this.bodyStaging.children[this.bodyStaging.children.length - 1] as HTMLSpanElement

        let rightOfStaging =
            px2float(lastCellOfStaging.style.left) + px2float(lastCellOfStaging.style.width) + this.table.WIDTH_ADJUST
        rightOfStaging -= 1
        let w = rightOfStaging - px2float(firstCellOfStaging.style.left)

        this.animationWidth = w

        this.mask = this.makeColumnMask(rightOfStaging, w)
        this.bodyStaging.appendChild(this.mask)

        // FIXME: split here into two methods (at least)

        if (this.colHeads === undefined) {
            return
        }

        // column headers
        for (let i = 0; i < this.event.size; ++i) {
            this.headStaging.appendChild(this.colHeads.children[this.event.index])
        }

        this.headMask = this.makeColumnMask(rightOfStaging, w)
        this.headStaging.appendChild(this.headMask)
    }

    splitVertical() {
        this.table.splitVerticalNew(this.event.index)
        if (this.colHeads !== undefined) {
            // FIXME: Hack
            this.splitHead = this.colHeads.lastElementChild as HTMLDivElement
        }

        // set the things split vertical hadn't enough information to do
        const left = px2float(this.splitBody.style.left)
        this.splitBody.style.width = `${this.initialWidth - left - 1}px` // FIXME: this might be overlap
        this.leftSplitBody = left
        this.leftMask = px2float(this.mask.style.left)

        if (this.colHeads !== undefined) {
            this.splitHead.style.left = `${left}px`
            this.splitHead.style.width = `${this.initialWidth - left - 1}px`
        }
    }

    joinVertical() {
        this.bodyStaging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)
        this.bodyStaging.replaceChildren()
        this.moveSplitBodyToBody()

        if (this.colHeads) {
            this.headStaging.removeChild(this.headMask)
            this.colHeads.removeChild(this.splitHead)
            this.headStaging.replaceChildren()
            this.moveSplitHeadToHead()
        }

        if (this.table.animationDone) {
            this.table.animationDone()
        }
    }

    private moveSplitHeadToHead() {
        if (this.splitHead.children.length === 0) {
            return
        }
        let left = px2float(this.splitHead.style.left)
        while (this.splitHead.children.length > 0) {
            const cell = this.splitHead.children[0] as HTMLSpanElement
            cell.style.left = `${px2float(cell.style.left) + left}px`
            this.colHeads.appendChild(cell)
        }
    }

    private moveSplitBodyToBody() {
        if (this.splitBody.children.length === 0) {
            return
        }

        let left = px2float(this.splitBody.style.left)
        for (let row = 0; row < this.rowCount; ++row) {
            for (let col = 0; col < this.colCount - this.event.index; ++col) {
                const cell = this.splitBody.children[0] as HTMLSpanElement
                cell.style.left = `${px2float(cell.style.left) + left}px`
                const idx = row * this.adapter.colCount + this.event.index + col
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
