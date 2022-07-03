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
import { AnimationBase } from "../../util/animation"
import { span } from '@toad/util/lsx'

export class RemoveRowAnimation extends TableAnimation {
    static halt = false
    static current?: RemoveRowAnimation
    event: TableEvent
    initialHeight: number
    totalHeight!: number
    done = false;
    colCount: number
    rowCount: number
    mask!: HTMLSpanElement

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinHorizontal = this.joinHorizontal.bind(this)

        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount

        if (this.body.children.length === 0) {
            this.initialHeight = 0
        } else {
            const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
            const top = px2float(cell.style.top)
            const bounds = cell.getBoundingClientRect()
            this.initialHeight = top + bounds.height
        }
    }

    run() {
        if (RemoveRowAnimation.halt) {
            console.log("NO ANIMATION")
            RemoveRowAnimation.current = this
            return
        }
        console.log("RUNNING REMOVE ROW ANIMATION")
    }

    override stop() {
        // this.joinHorizontal()
        // this.clearAnimation()
    }

    arrangeRowsInStaging() {
        const idx = this.event.index * this.adapter.colCount
        const cellCount = this.event.size * this.adapter.colCount
        const start = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        for (let i = 0; i < cellCount; ++i) {
            this.staging.appendChild(this.body.children[idx])
        }

        let bottomOfStaging
        if (idx < this.body.children.length) {
            bottomOfStaging = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        } else {
            const cell = this.staging.children[this.staging.children.length - 1] as HTMLSpanElement
            bottomOfStaging = px2float(cell.style.top) + px2float(cell.style.height) + this.table.HEIGHT_ADJUST
        }
        this.totalHeight = bottomOfStaging - start

        this.mask = span()
        // this.mask.className = "mask"
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `0`
        this.mask.style.right = `0`
        this.mask.style.top = `${bottomOfStaging + 1}px`
        this.mask.style.border = 'none'
        this.mask.style.transitionProperty = "transform"
        this.mask.style.transitionDuration = Table.transitionDuration
        this.mask.style.height = `${this.totalHeight + 1}px`
        this.mask.style.backgroundColor = `rgba(0,0,128,0.3)`
        this.staging.appendChild(this.mask)
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)

        const top = px2float(this.splitBody.style.top)
        this.splitBody.style.height = `${this.initialHeight - top}px`
    }

    animate() {
        // console.log(`ANIMATE: initialRowCount=${this.initialRowCount}`)
        let height: number
        height = this.totalHeight
        console.log(`================> this.adapter.rowCount = ${this.adapter.rowCount}`)
        if (this.event.index >= this.adapter.rowCount) {
            const overlap = this.adapter.config.seamless ? 0 : 1
            // console.log(`this is not the 1st row, reduce height by one overlap of ${overlap}`)
            height -= overlap
        }
        console.log(`animate: move by ${height}`)
        const topSplitBody = px2float(this.splitBody.style.top)
        const topMask = px2float(this.mask.style.top)
        // // console.log(`split body is at ${top}, height is ${height}`)
        if (RemoveRowAnimation.halt) {
            console.log(`this.splitBody.style.top = ${topSplitBody - height}px`)
            console.log(`this.mask.style.top = ${topMask - height}px`)
            this.splitBody.style.top = `${topSplitBody - height}px`
            this.mask.style.top = `${topMask - height}px`
            return
        }
        const self = this
        const a = new class extends AnimationBase {
            override animationFrame(n: number) {
                self.splitBody.style.top = `${topSplitBody - n * height}px`
                self.mask.style.top = `${topMask - n * height}px`
            }
        }
        a.start()
    }

    joinHorizontal() {
        if (!this.done) {
            this.done = true

            this.staging.removeChild(this.mask)
            this.body.removeChild(this.splitBody)
            while (this.staging.children.length > 0) {
                this.staging.removeChild(this.staging.children[0])
            }
            if (this.splitBody.children.length > 0) {
                let top = px2float(this.splitBody.style.top)
                // if (this.initialRowCount !== 0) {
                //     const overlap = this.adapter.config.seamless ? 0 : 1
                //     top -= overlap
                // }
                while (this.splitBody.children.length > 0) {
                    const cell = this.splitBody.children[0] as HTMLSpanElement
                    cell.style.top = `${px2float(cell.style.top) + top}px`
                    this.body.appendChild(cell)
                }
            }

            // this should work without any arguments
            // * append splitbody to body
            // * adjust cells y from split body by splitbody y
            // this.table.joinHorizontal(this.event.index + this.event.size, this.totalHeight, 0, this.initialColCount, this.initialRowCount)
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
        // if (!this.done) {
        //     this.done = true

        //     let idx = this.event.index * this.colCount
        //     for (let row = 0; row < this.event.size; ++row) {
        //         for (let col = 0; col < this.colCount; ++col) {
        //             this.body.removeChild(this.body.children[idx])
        //         }
        //     }
        //     this.table.joinHorizontal(this.event.index + this.event.size, -this.totalHeight, this.event.size, this.colCount, this.rowCount)

        //     if (this.rowHeads) {
        //         for (let row = 0; row < this.event.size; ++row) {
        //             this.rowHeads.removeChild(this.rowHeads.children[this.event.index])
        //             this.rowResizeHandles.removeChild(this.rowResizeHandles.children[this.event.index])
        //         }
        //         // adjust subsequent row heads and handles
        //         for (let subsequentRow = this.event.index; subsequentRow < this.rowCount; ++subsequentRow) {
        //             this.rowHeads.children[subsequentRow].replaceChildren(
        //                 this.adapter.getRowHead(subsequentRow)!
        //             );
        //             (this.rowResizeHandles.children[subsequentRow] as HTMLSpanElement).dataset["idx"] = `${subsequentRow}`
        //         }
        //     }

        //     if (this.table.animationDone) {
        //         this.table.animationDone()
        //     }
        // }
    }
}
