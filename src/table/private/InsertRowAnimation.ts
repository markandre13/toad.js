import { TableEvent } from '../TableEvent'
import { span } from '@toad/util/lsx'
import { Table, px2int } from '../Table'
import { TableAnimation } from "./TableAnimation"

export class InsertRowAnimation extends TableAnimation {
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

    stop() {
        this.joinHorizontal()
        this.clearAnimation()
    }

    splitHorizontal(splitRow: number, extra: number = 0) {
        this.table.splitHorizontal(splitRow, extra)
    }

    joinHorizontal() {
        if (!this.done) {
            this.done = true
            this.table.joinHorizontal(this.event.index + this.event.size, this.totalHeight, 0, this.colCount, this.rowCount)
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }

    run() {
        this.prepareCells()
        setTimeout(() => {
            // FIXME: if stop is called before this is executed (unlikely), stop will fail
            this.arrangeMeasuredRowsInGrid()
            this.splitHorizontal(this.event.index + this.event.size)
            this.splitBody.style.transitionProperty = "transform"
            this.splitBody.style.transitionDuration = Table.transitionDuration
            this.splitBody.ontransitionend = this.joinHorizontal
            this.splitBody.ontransitioncancel = this.joinHorizontal
            setTimeout(() => {
                this.splitBody.style.transform = `translateY(${this.totalHeight}px)` // TODO: make this an animation
            }, 50) // at around > 10ms we'll get an animated transition on google chrome
        })
    }

    prepareCells() {
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            for (let col = 0; col < this.colCount; ++col) {
                const cell = span(
                    this.adapter.getDisplayCell(col, row) as Node
                )
                this.measure.appendChild(cell)
            }
        }
    }

    arrangeMeasuredRowsInGrid() {
        let idx = this.event.index * this.colCount
        let beforeChild
        let y
        // console.log(`event.index=${this,event.index}, idx=${idx}, children.length=${this.body.children.length}`)
        if (idx < this.body.children.length) {
            beforeChild = this.body.children[idx] as HTMLSpanElement
            y = px2int(beforeChild.style.top)
        } else {
            beforeChild = null
            if (this.body.children.length === 0) {
                y = 0
            } else {
                const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
                y = px2int(cell.style.top)
            }
            if (this.event.index+1 >= this.rowCount) {
                const bounds = this.body.children[this.body.children.length - 1].getBoundingClientRect()
                y += bounds.height + 1
            }
        }

        let totalHeight = 0
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            let rowHeight = this.table.minCellHeight
            for (let col = 0; col < this.colCount; ++col) {
                const child = this.measure.children[col]
                const bounds = child.getBoundingClientRect()
                rowHeight = Math.max(rowHeight, bounds.height)
            }
            for (let col = 0; col < this.colCount; ++col) {
                const cell = this.measure.children[0] as HTMLSpanElement
                let neighbour
                if (row === 0 && this.event.index === 0) {
                    neighbour = this.body.children[col*2] as HTMLSpanElement
                } else {
                    neighbour = this.body.children[col] as HTMLSpanElement
                }
                cell.style.left = neighbour.style.left // FIXME: hack
                cell.style.top = `${y}px`
                cell.style.width = neighbour.style.width // FIXME: hack
                cell.style.height = `${rowHeight}px`
                this.body.insertBefore(cell, beforeChild)
            }
            y += rowHeight + 1
            totalHeight += Math.ceil(rowHeight)
        }
        this.totalHeight = totalHeight + 1

        // let txt = `InsertRowAnimation: table size ${this.colCount}, ${this.rowCount}\n`
        // idx = 0
        // for (let row = 0; row < this.rowCount; ++row) {
        // for (let col = 0; col < this.colCount; ++col) {
        //         let cell = this.body.children[idx++] as HTMLSpanElement
        //         txt = `${txt} ${cell.innerText}`
        //     }
        //     txt += "\n"
        // }
        // console.log(txt)
    }
}
