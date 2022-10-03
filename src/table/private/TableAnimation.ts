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
    
    // TODO: obsolete
    prepareStagingWithRows() {
        this.prepareBodyStaging()
        this.prepareRowHeadStaging()
        this.table.addStaging(this.staging, this.headStaging)
        this.scrollStaging()
    }
    prepareStagingWithColumns() {
        this.prepareBodyStaging()
        this.prepareColHeadStaging()
        this.table.addStaging(this.staging, this.headStaging)
        this.scrollStaging()
    }
    private prepareBodyStaging() {
        this.staging = div()
        this.staging.className = "staging"
        this.staging.style.left = this.body.style.left
        this.staging.style.top = this.body.style.top
    }
    private prepareRowHeadStaging() {
        if (this.rowHeads === undefined) {
            return
        }
        this.headStaging = div()
        this.headStaging.classList.add("staging")
        this.headStaging.style.top = this.rowHeads.style.top
        this.headStaging.style.width = this.rowHeads.style.width
    }
    private prepareColHeadStaging() {
        if (this.colHeads === undefined) {
            return
        }
        this.headStaging = div()
        this.headStaging.classList.add("staging")
        this.headStaging.style.left = this.colHeads.style.left
        this.headStaging.style.height = this.colHeads.style.height
    }
    disposeStaging() {
        this.table.removeStaging(this.staging, this.headStaging)
    }
    scrollStaging(): void {
        // FIXME: assign to scrollTop,scrollLeft? or at least include the body position in the calculation
        // this.staging.style.top = `${-this.body.scrollTop}px`
        // this.staging.style.left = `${-this.body.scrollLeft}px`
    }
    public staging!: HTMLDivElement // TODO: rename into bodyStaging
    public headStaging!: HTMLDivElement
}
