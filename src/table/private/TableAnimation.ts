import { Table } from '../Table'
import { TableFriend } from "./TableFriend"
import { Animation } from "../../util/animation"
import { div } from '../../util/lsx'

export abstract class TableAnimation extends TableFriend implements Animation {
    constructor(table: Table) {
        super(table)
    }
    abstract prepare(): void
    abstract firstFrame(): void
    abstract animationFrame(value: number): void
    abstract lastFrame(): void
    prepareStaging() {
        this.staging = div()
        this.staging.className = "staging"
        // if (this.rowHeads !== undefined || this.colHeads !== undefined) {
            this.headStaging = div()
            this.headStaging.classList.add("staging")
            // this.root.insertBefore(this.headStaging, this.root.children[0])
        // }
        this.table.addStaging(this.staging, this.headStaging)
    }
    disposeStaging() {
        this.table.removeStaging(this.staging, this.headStaging)
    }
    onscroll(): void {
        this.staging.style.top = `${-this.body.scrollTop}px`
        this.staging.style.left = `${-this.body.scrollLeft}px`
    }
    public staging!: HTMLDivElement
    public headStaging!: HTMLDivElement
}
