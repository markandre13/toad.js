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
import { Table, px2float } from '../Table'
import { TableAnimation } from "./TableAnimation"

export class RemoveColumnAnimation extends TableAnimation {
    event: TableEvent
    initialWidth: number
    totalWidth!: number
    done = false;
    colCount: number
    rowCount: number
    animationWidth!: number
    leftSplitBody!: number
    leftMask!: number
    mask!: HTMLSpanElement

    static current: RemoveColumnAnimation

    constructor(table: Table, event: TableEvent) {
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
        this.arrangeColumnsInStaging()
        this.splitVertical()
    }
    firstFrame(): void { }
    animationFrame(n: number): void {
        this.splitBody.style.left = `${this.leftSplitBody - n * this.animationWidth}px`
        this.mask.style.left = `${this.leftMask - n * this.animationWidth}px`
    }
    lastFrame(): void {
        this.joinVertical()
    }

    // override run() {
    //     let totalWidth = 0
    //     for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
    //         const cell = this.body.children[col] as HTMLSpanElement
    //         totalWidth += Math.ceil(px2float(cell.style.width) + 5)
    //     }
    //     this.totalWidth = totalWidth

    //     let allSelected = this.body.querySelectorAll(".selected")
    //     for (let selected of allSelected) {
    //         selected.classList.remove("selected")
    //     }

    //     this.splitVertical(this.event.index + this.event.size, this.event.size)

    //     this.splitBody.style.transitionProperty = "transform"
    //     this.splitBody.style.transitionDuration = Table.transitionDuration
    //     this.splitBody.ontransitionend = this.joinVertical
    //     this.splitBody.ontransitioncancel = this.joinVertical
    //     setTimeout(() => {
    //         this.splitBody.style.transform = `translateX(${-this.totalWidth}px)` // TODO: make this an animation
    //     }, Table.renderDelay) // at around > 10ms we'll get an animated transition on google chrome
    // }

    override stop() {
        this.joinVertical()
        this.clearAnimation()
    }

    arrangeColumnsInStaging() {
        // console.log(`RemoveColumnAnimation.arrangeColumnsInStaging(): size = ${this.adapter.colCount} x ${this.adapter.rowCount}`)
        // move all the columns which are to be removed into staging
        let idx = this.event.index
        for (let row = 0; row < this.adapter.rowCount; ++row) {
            for (let col = 0; col < this.event.size; ++col) {
                this.staging.appendChild(this.body.children[idx])
            }
            idx += this.colCount
        }

        const firstCellOfStaging = this.staging.children[0] as HTMLSpanElement
        const lastCellOfStaging = this.staging.children[this.staging.children.length - 1] as HTMLSpanElement

        let rightOfStaging = px2float(lastCellOfStaging.style.left) + px2float(lastCellOfStaging.style.width) + this.table.WIDTH_ADJUST
        rightOfStaging -= 1
        let w = rightOfStaging - px2float(firstCellOfStaging.style.left)

        this.animationWidth = w

        this.mask = span()
        this.mask.style.boxSizing = `content-box`
        this.mask.style.top = `0`
        this.mask.style.bottom = `0`
        this.mask.style.left = `${rightOfStaging}px`
        this.mask.style.width = `${w}px`
        this.mask.style.border = 'none'
        this.mask.style.backgroundColor = Table.maskColor
        this.staging.appendChild(this.mask)
    }

    splitVertical() {
        this.table.splitVerticalNew(this.event.index)
        // set the things split vertical hadn't enough information to do
        const left = px2float(this.splitBody.style.left)
        this.splitBody.style.width = `${this.initialWidth - left -1}px` // FIXME: this might be overlap
        this.leftSplitBody = left
        this.leftMask = px2float(this.mask.style.left)
    }

    joinVertical() {
        if (this.done) {
            return
        }
        this.done = true

        this.staging.replaceChildren()
        this.body.removeChild(this.splitBody)

        // insert splitBody (whose cells are per row)
        const left = px2float(this.splitBody.style.left)

        // move split body into body
        for (let row = 0; row < this.rowCount; ++row) {
            for (let col = 0; col < this.colCount - this.event.index; ++col) {
                const cell = this.splitBody.children[0] as HTMLSpanElement
                cell.style.left = `${px2float(cell.style.left) + left}px`
                const idx = row * this.adapter.colCount + this.event.index + col
                this.bodyInsertAt(cell, idx)
            }
        }

        // let idx = this.event.index
        // for (let row = 0; row < this.rowCount; ++row) {
        //     for (let col = 0; col < this.event.size; ++col) {
        //         const cell = this.body.children[idx] as HTMLSpanElement
        //         this.body.removeChild(this.body.children[idx])
        //     }
        //     idx += this.event.index - this.event.size + 1
        // }

        // this.table.joinVertical(this.event.index + this.event.size, -this.totalWidth, this.event.size, this.colCount, this.rowCount)

        // if (this.colHeads) {
        //     for (let col = 0; col < this.event.size; ++col) {
        //         this.colHeads.removeChild(this.colHeads.children[this.event.index])
        //         this.colResizeHandles.removeChild(this.colResizeHandles.children[this.event.index])
        //     }
        //     // adjust subsequent row heads and handles
        //     for (let subsequentColumn = this.event.index; subsequentColumn < this.colCount; ++subsequentColumn) {
        //         this.colHeads.children[subsequentColumn].replaceChildren(
        //             this.adapter.getColumnHead(subsequentColumn)!
        //         );
        //         (this.colResizeHandles.children[subsequentColumn] as HTMLSpanElement).dataset["idx"] = `${subsequentColumn}`
        //     }
        // }

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
