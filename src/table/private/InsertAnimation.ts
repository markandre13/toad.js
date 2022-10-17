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

export abstract class InsertAnimation extends TableAnimation {
    event: TableEvent
    done = false
    totalSize!: number
    animationStart!: number
    mask!: HTMLSpanElement
    splitHead!: HTMLDivElement
    headMask!: HTMLSpanElement

    constructor(table: Table, event: TableEvent) {
        super(table)
        this.event = event
    }

    abstract prepareCellsToBeMeasured(): void
    abstract prepareStaging(): void
    abstract arrangeInStaging(): void
    abstract split(): void
    abstract animate(pos: number): void
    abstract joinHeader(): void
    abstract joinBody(): void

    prepare(): void {
        this.prepareCellsToBeMeasured()
        this.prepareStaging()
    }
    firstFrame(): void {
        this.arrangeInStaging()
        this.split()
    }
    animationFrame(n: number): void {
        this.animate(this.animationStart + n * this.totalSize)
    }
    lastFrame(): void {
        this.animate(this.animationStart + this.totalSize)
        this.join()
        this.disposeStaging()
    }
    join() {
        if (this.done) {
            return
        }
        this.done = true

        this.joinHeader()
        this.joinBody()

        if (this.table.animationDone) {
            this.table.animationDone()
        }
    }
}
