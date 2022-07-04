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
    heightToRemove!: number
    removeAll: boolean
    overlap: number
    done = false;
    mask!: HTMLSpanElement

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
    }

    prepare(): void {}
    firstFrame(): void {}
    animationFrame(value: number): void {}
    lastFrame(): void {}

    run() {
        if (RemoveRowAnimation.halt) {
            RemoveRowAnimation.current = this
            return
        }
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
        this.heightToRemove = bottomOfStaging - start

        this.mask = span()
        this.mask.style.boxSizing = `content-box`
        this.mask.style.left = `0`
        this.mask.style.right = `0`
        this.mask.style.top = `${bottomOfStaging}px`
        this.mask.style.border = 'none'
        this.mask.style.transitionProperty = "transform"
        this.mask.style.transitionDuration = Table.transitionDuration
        this.mask.style.height = `${this.heightToRemove}px`
        this.mask.style.backgroundColor = `rgba(0,0,128,0.3)`
        this.staging.appendChild(this.mask)
    }

    splitHorizontal() {
        this.table.splitHorizontalNew(this.event.index)

        const top = px2float(this.splitBody.style.top)
        this.splitBody.style.height = `${this.initialHeight - top}px`
    }

    animate() {
        let height: number
        height = this.heightToRemove
        const topSplitBody = px2float(this.splitBody.style.top)
        const topMask = px2float(this.mask.style.top)
        if (RemoveRowAnimation.halt) { // TODO: instead call stop() after animate() in the test
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
        if (this.done) {
            return
        }
        this.done = true

        this.staging.removeChild(this.mask)
        this.body.removeChild(this.splitBody)
        this.staging.replaceChildren()
        this.moveSplitBodyToBody()
        if (this.table.animationDone) {
            this.table.animationDone()
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
