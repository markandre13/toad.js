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

export class RemoveRowAnimation extends TableAnimation {
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
        const overlap = this.adapter.config.seamless ? 1 : 0

        let totalHeight = 0
        let idx = this.event.index * this.colCount
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            const cell = this.body.children[idx] as HTMLSpanElement
            totalHeight += Math.ceil(px2float(cell.style.height) + 1) - overlap
        }
        this.totalHeight = totalHeight

        let allSelected = this.body.querySelectorAll(".selected")
        for (let selected of allSelected) {
            selected.classList.remove("selected")
        }

        this.splitHorizontal(this.event.index + this.event.size, this.event.size)

        this.splitBody.style.transitionProperty = "transform"
        this.splitBody.style.transitionDuration = Table.transitionDuration
        this.splitBody.ontransitionend = this.joinHorizontal
        this.splitBody.ontransitioncancel = this.joinHorizontal
        setTimeout(() => {
            this.splitBody.style.transform = `translateY(${-this.totalHeight}px)` // TODO: make this an animation
        }, Table.renderDelay)
    }

    override stop() {
        this.joinHorizontal()
        this.clearAnimation()
    }

    splitHorizontal(splitRow: number, extra: number = 0) {
        this.table.splitHorizontal(splitRow, extra)
    }

    joinHorizontal() {
        if (!this.done) {
            this.done = true

            let idx = this.event.index * this.colCount
            for (let row = 0; row < this.event.size; ++row) {
                for (let col = 0; col < this.colCount; ++col) {
                    this.body.removeChild(this.body.children[idx])
                }
            }
            this.table.joinHorizontal(this.event.index + this.event.size, -this.totalHeight, this.event.size, this.colCount, this.rowCount)

            if (this.rowHeads) {
                for (let row = 0; row < this.event.size; ++row) {
                    this.rowHeads.removeChild(this.rowHeads.children[this.event.index])
                    this.rowResizeHandles.removeChild(this.rowResizeHandles.children[this.event.index])
                }
                // adjust subsequent row heads and handles
                for (let subsequentRow = this.event.index; subsequentRow < this.rowCount; ++subsequentRow) {
                    this.rowHeads.children[subsequentRow].replaceChildren(
                        this.adapter.getRowHead(subsequentRow)!
                    );
                    (this.rowResizeHandles.children[subsequentRow] as HTMLSpanElement).dataset["idx"] = `${subsequentRow}`
                }
            }

            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }
}
