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
    }

    run() {
        if (RemoveRowAnimation.halt) {
            console.log("NO ANIMATION")
            RemoveRowAnimation.current = this
            return
        }
        console.log("RUNNING INSERT ROW ANIMATION")
        // const overlap = this.adapter.config.seamless ? 1 : 0

        // let totalHeight = 0
        // let idx = this.event.index * this.colCount
        // for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
        //     const cell = this.body.children[idx] as HTMLSpanElement
        //     totalHeight += Math.ceil(px2float(cell.style.height) + 1) - overlap
        // }
        // this.totalHeight = totalHeight

        // let allSelected = this.body.querySelectorAll(".selected")
        // for (let selected of allSelected) {
        //     selected.classList.remove("selected")
        // }

        // this.splitHorizontal(this.event.index + this.event.size, this.event.size)

        // this.splitBody.style.transitionProperty = "transform"
        // this.splitBody.style.transitionDuration = Table.transitionDuration
        // this.splitBody.ontransitionend = this.joinHorizontal
        // this.splitBody.ontransitioncancel = this.joinHorizontal
        // setTimeout(() => {
        //     this.splitBody.style.transform = `translateY(${-this.totalHeight}px)` // TODO: make this an animation
        // }, Table.renderDelay)
    }

    override stop() {
        // this.joinHorizontal()
        // this.clearAnimation()
    }

    arrangeRowsInStaging() {
        const idx = this.event.index * this.adapter.colCount
        const cellCount = this.event.size * this.adapter.colCount
        const start = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        for(let i=0; i<cellCount; ++i) {
            this.staging.appendChild(this.body.children[idx])
        }

        const bottom = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        this.totalHeight = bottom - start

        this.mask = span()
        // this.mask.className = "mask"
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `0`
        this.mask.style.right = `0`
        this.mask.style.top = `${bottom}px`
        this.mask.style.border = 'none'
        this.mask.style.transitionProperty = "transform"
        this.mask.style.transitionDuration = Table.transitionDuration
        this.mask.style.height = `${this.totalHeight}px`
        this.mask.style.backgroundColor = `rgba(0,0,128,0.3)`
        this.staging.appendChild(this.mask)
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)
    }

    animate() {
        // // console.log(`ANIMATE: initialRowCount=${this.initialRowCount}`)
        let height: number
        height = this.totalHeight
        // if (this.initialRowCount !== 0) {
        //     const overlap = this.adapter.config.seamless ? 0 : 1
        //     // console.log(`this is not the 1st row, reduce height by one overlap of ${overlap}`)
        //     height -= overlap
        // }
        const top = px2float(this.splitBody.style.top)
        // // console.log(`split body is at ${top}, height is ${height}`)
        if (RemoveRowAnimation.halt) {
            const y = top - height
            this.splitBody.style.top = `${y}px`
            this.mask.style.top = `${y}px`
            return
        }
        const self = this
        const a = new class extends AnimationBase {
            override animationFrame(n: number) {
                const y = top - n * height
                self.splitBody.style.top = `${y}px`
                self.mask.style.top = `${y}px`
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
