import { Table } from '../Table'
import { TableFriend } from "./TableFriend"
import { Animation } from "../../util/animation"
import { div, span } from '../../util/lsx'

export abstract class TableAnimation extends TableFriend implements Animation {
    constructor(table: Table) {
        super(table)
    }

    public bodyStaging!: HTMLDivElement
    public headStaging!: HTMLDivElement

    abstract prepare(): void
    abstract firstFrame(): void
    abstract animationFrame(value: number): void
    abstract lastFrame(): void
    
    // TODO: obsolete
    prepareStagingWithRows() {
        this.prepareBodyStaging()
        this.prepareRowHeadStaging()
        this.table.addStaging(this.bodyStaging, this.headStaging)
        this.scrollStaging()
    }
    prepareStagingWithColumns() {
        this.prepareBodyStaging()
        this.prepareColHeadStaging()
        this.table.addStaging(this.bodyStaging, this.headStaging)
        this.scrollStaging()
    }
    private prepareBodyStaging() {
        this.bodyStaging = div()
        this.bodyStaging.className = "staging"
        this.bodyStaging.style.left = this.body.style.left
        this.bodyStaging.style.top = this.body.style.top
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
        this.headStaging.classList.add("colHack") // FIXME: clean up CSS
        this.headStaging.style.left = this.colHeads.style.left
        this.headStaging.style.height = this.colHeads.style.height
    }
    disposeStaging() {
        this.table.removeStaging(this.bodyStaging, this.headStaging)
    }
    scrollStaging(): void {
        // FIXME: assign to scrollTop,scrollLeft? or at least include the body position in the calculation
        // this.staging.style.top = `${-this.body.scrollTop}px`
        // this.staging.style.left = `${-this.body.scrollLeft}px`
    }

    makeRowMask(start: number, size: number): HTMLSpanElement {
        const mask = span()
        mask.style.boxSizing = `content-box`
        mask.style.top = `${start}px`
        mask.style.height = `${size}px`
        mask.style.left = `0`
        mask.style.right = `0`
        mask.style.border = 'none'
        mask.style.backgroundColor = Table.maskColor
        return mask
    }
    makeColumnMask(start: number, size: number): HTMLSpanElement {
        const mask = span()
        mask.style.boxSizing = `content-box`
        mask.style.left = `${start}px`
        mask.style.width = `${size}px`
        mask.style.top = `0`
        mask.style.bottom = `0`
        mask.style.border = 'none'
        mask.style.backgroundColor = Table.maskColor
        return mask
    }
}
