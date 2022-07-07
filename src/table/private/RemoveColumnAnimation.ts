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

export class RemoveColumnAnimation extends TableAnimation {
    event: TableEvent
    totalWidth!: number
    done = false;
    colCount: number
    rowCount: number

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinVertical = this.joinVertical.bind(this)

        this.colCount = this.adapter.colCount
        this.rowCount = this.adapter.rowCount
    }

    prepare(): void {}
    firstFrame(): void {}
    animationFrame(value: number): void {}
    lastFrame(): void {}

    override run() {
        let totalWidth = 0
        for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
            const cell = this.body.children[col] as HTMLSpanElement
            totalWidth += Math.ceil(px2float(cell.style.width) + 5)
        }
        this.totalWidth = totalWidth

        let allSelected = this.body.querySelectorAll(".selected")
        for (let selected of allSelected) {
            selected.classList.remove("selected")
        }

        this.splitVertical(this.event.index + this.event.size, this.event.size)

        this.splitBody.style.transitionProperty = "transform"
        this.splitBody.style.transitionDuration = Table.transitionDuration
        this.splitBody.ontransitionend = this.joinVertical
        this.splitBody.ontransitioncancel = this.joinVertical
        setTimeout(() => {
            this.splitBody.style.transform = `translateX(${-this.totalWidth}px)` // TODO: make this an animation
        }, Table.renderDelay) // at around > 10ms we'll get an animated transition on google chrome
    }

    override stop() {
        this.joinVertical()
        this.clearAnimation()
    }

    splitVertical(splitColumn: number, extra: number = 0) {
        this.table.splitVertical(splitColumn, extra)
    }

    joinVertical() {
        if (!this.done) {
            this.done = true

            let idx = this.event.index
            for (let row = 0; row < this.rowCount; ++row) {
                for (let col = 0; col < this.event.size; ++col) {
                    const cell = this.body.children[idx] as HTMLSpanElement
                    this.body.removeChild(this.body.children[idx])
                }
                idx += this.event.index - this.event.size + 1
            }

            this.table.joinVertical(this.event.index + this.event.size, -this.totalWidth, this.event.size, this.colCount, this.rowCount)

            if (this.colHeads) {
                for (let col = 0; col < this.event.size; ++col) {
                    this.colHeads.removeChild(this.colHeads.children[this.event.index])
                    this.colResizeHandles.removeChild(this.colResizeHandles.children[this.event.index])
                }
                // adjust subsequent row heads and handles
                for (let subsequentColumn = this.event.index; subsequentColumn < this.colCount; ++subsequentColumn) {
                    this.colHeads.children[subsequentColumn].replaceChildren(
                        this.adapter.getColumnHead(subsequentColumn)!
                    );
                    (this.colResizeHandles.children[subsequentColumn] as HTMLSpanElement).dataset["idx"] = `${subsequentColumn}`
                }
            }

            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }
}
