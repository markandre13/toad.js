import { TableEvent } from './TableEvent'
import { span } from '@toad/util/lsx'
import { Table, px2int } from './Table'
import { TableAnimation } from "./TableAnimation"

export class InsertColumnAnimation extends TableAnimation {
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

    stop() {
        this.joinVertical()
        this.clearAnimation()
    }

    splitVertical(splitColumn: number, extra: number = 0) {
        this.table.splitVertical(splitColumn, extra)
    }

    joinVertical() {
        if (!this.done) {
            this.done = true
            this.table.joinVertical(this.event.index + this.event.size, this.totalWidth, 0, this.colCount, this.rowCount)
        }
    }

    run() {
        this.prepareCells()
        setTimeout(() => {
            // FIXME: if stop is called before this is executed (unlikely), stop will fail
            this.arrangeMeasuredColumnsInGrid()
            this.splitVertical(this.event.index + this.event.size)
            this.splitBody.style.transitionProperty = "transform"
            this.splitBody.style.transitionDuration = "500ms"
            this.splitBody.ontransitionend = this.joinVertical
            this.splitBody.ontransitioncancel = this.joinVertical
            setTimeout(() => {
                this.splitBody.style.transform = `translateX(${this.totalWidth}px)` // TODO: make this an animation
            }, 50) // at around > 10ms we'll get an animated transition on google chrome
        })
    }

    prepareCells() {
        for (let row = 0; row < this.rowCount; ++row) {
            for (let col = this.event.index; col < this.event.index + this.event.size; ++col) {
                const cell = span(
                    this.adapter.getDisplayCell(col, row) as Node
                )
                this.measure.appendChild(cell)
            }
        }
    }

    arrangeMeasuredColumnsInGrid() {
        let idx = this.event.index * this.colCount
        let beforeChild
        let x
        // console.log(`event.index=${event.index}, idx=${idx}, children.length=${this.body.children.length}`)
        if (idx < this.body.children.length) {
            beforeChild = this.body.children[idx] as HTMLSpanElement
            x = px2int(beforeChild.style.left)
        } else {
            beforeChild = null
            if (this.body.children.length === 0) {
                x = 0
            } else {
                const cell = this.body.children[this.body.children.length - 1] as HTMLSpanElement
                x = px2int(cell.style.left)
            }
        }
        let totalWidth = 0
        for (let row = this.event.index; row < this.event.index + this.event.size; ++row) {
            let columnWidth = 0
            for (let row = 0; row < this.rowCount; ++row) {
                const child = this.measure.children[0]
                const bounds = child.getBoundingClientRect()
                columnWidth = Math.max(columnWidth, bounds.width)
            }
            for (let row = 0; row < this.rowCount; ++row) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = (this.body.children[row] as HTMLSpanElement).style.top // FIXME: hack
                child.style.width = `${columnWidth}px`
                child.style.height = (this.body.children[row] as HTMLSpanElement).style.height // FIXME: hack
                this.body.insertBefore(child, beforeChild)
            }
            x += columnWidth
            totalWidth += Math.ceil(columnWidth)
        }
        this.totalWidth = totalWidth
    }
}
