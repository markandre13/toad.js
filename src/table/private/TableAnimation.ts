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
        this.staging.style.left = this.body.style.left
        this.staging.style.top = this.body.style.top

        if (this.rowHeads !== undefined) {
            // console.log(`setup headStaging`)
            this.headStaging = div()
            this.headStaging.classList.add("staging")
            this.headStaging.style.top = this.rowHeads.style.top
            this.headStaging.style.width = this.rowHeads.style.width
        }

        // if (this.colHeads !== undefined) {
        //     this.headStaging = div()
        //     this.headStaging.classList.add("staging")
        //     this.headStaging.style.left = this.colHeads.style.left
        //     this.headStaging.style.height = this.colHeads.style.height
        // }

        this.table.addStaging(this.staging, this.headStaging)

        this.scrollStaging()
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
