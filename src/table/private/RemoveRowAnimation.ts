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
import { span } from '@toad/util/lsx'

export class RemoveRowAnimation extends TableAnimation {
    static current?: RemoveRowAnimation
    event: TableEvent
    initialHeight: number
    animationHeight!: number
    removeAll: boolean
    overlap: number
    mask!: HTMLSpanElement
    splitHead!: HTMLDivElement
    headMask!: HTMLSpanElement
    topSplitBody!: number
    topMask!: number

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
        this.joinHorizontal = this.joinHorizontal.bind(this)

        if (this.body.children.length === 0) {
            this.initialHeight = 0
        } else {
            const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
            const top = px2float(cell.style.top)
            const bounds = cell.getBoundingClientRect()
            this.initialHeight = top + bounds.height
        }
        this.overlap = this.adapter.config.seamless ? 0 : 1
        this.removeAll = this.event.index >= this.adapter.rowCount
        RemoveRowAnimation.current = this
    }

    prepare(): void {
        this.prepareStagingWithRows()
        this.arrangeRowsInStaging()
        this.splitHorizontal()
    }
    firstFrame(): void {}
    animationFrame(n: number): void {
        this.splitBody.style.top = `${this.topSplitBody - n * this.animationHeight}px`
        this.mask.style.top = `${this.topMask - n * this.animationHeight}px`
        if (this.rowHeads !== undefined) {
            this.splitHead.style.top = `${this.topSplitBody - n * this.animationHeight}px`
            this.headMask.style.top = `${this.topMask - n * this.animationHeight}px`
        }
    }
    lastFrame(): void {
        this.joinHorizontal()
        this.disposeStaging()
    }

    arrangeRowsInStaging() {
        // body
        const idx = this.event.index * this.adapter.colCount
        const cellCount = this.event.size * this.adapter.colCount
        const start = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        for (let i = 0; i < cellCount; ++i) {
            this.bodyStaging.appendChild(this.body.children[idx])
        }

        let bottomOfStaging
        if (idx < this.body.children.length) {
            bottomOfStaging = px2float((this.body.children[idx] as HTMLSpanElement).style.top)
        } else {
            const cell = this.bodyStaging.children[this.bodyStaging.children.length - 1] as HTMLSpanElement
            bottomOfStaging = px2float(cell.style.top) + px2float(cell.style.height) + this.table.HEIGHT_ADJUST
        }
        this.animationHeight = bottomOfStaging - start

        this.mask = this.makeRowMask(bottomOfStaging, this.animationHeight)
        this.bodyStaging.appendChild(this.mask)

        // FIXME: split here into two methods (at least)
        if (this.rowHeads === undefined) {
            return
        }

        // row headers
        for (let i = 0; i < this.event.size; ++i) {
            this.headStaging.appendChild(this.rowHeads.children[this.event.index])
        }

        this.headMask = this.makeRowMask(bottomOfStaging, this.animationHeight)
        this.headStaging.appendChild(this.headMask)
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)

        if (this.rowHeads !== undefined) { // FIXME: Hack
            this.splitHead = this.rowHeads.lastElementChild as HTMLDivElement
        }

        // fix the stuff split horizontal row hadn't enough information to do
        const top = px2float(this.splitBody.style.top)
        this.splitBody.style.height = `${this.initialHeight - top}px`
        this.topSplitBody = top
        this.topMask = px2float(this.mask.style.top)

        if (this.rowHeads !== undefined) {
            this.splitHead.style.top = `${top}px`
            this.splitHead.style.height = `${this.initialHeight - top}px`
        }
    }

    joinHorizontal() {
        this.bodyStaging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)
        this.bodyStaging.replaceChildren()
        this.moveSplitBodyToBody()

        if (this.rowHeads) {
            this.headStaging.removeChild(this.headMask)
            this.rowHeads.removeChild(this.splitHead)
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
        let top = px2float(this.splitHead.style.top)
        while (this.splitHead.children.length > 0) {
            const cell = this.splitHead.children[0] as HTMLSpanElement
            cell.style.top = `${px2float(cell.style.top) + top}px`
            this.rowHeads.appendChild(cell)
        }
    }

    private moveSplitBodyToBody() {
        if (this.splitBody.children.length === 0) {
            return
        }
        let top = px2float(this.splitBody.style.top)
        while (this.splitBody.children.length > 0) {
            const cell = this.splitBody.children[0] as HTMLSpanElement
            cell.style.top = `${px2float(cell.style.top) + top}px`
            this.body.appendChild(cell)
        }
    }
}
