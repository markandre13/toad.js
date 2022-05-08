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

    run() {
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
        }, 50) // at around > 10ms we'll get an animated transition on google chrome
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
            if (this.table.animationDone) {
                this.table.animationDone()
            }
        }
    }
}
