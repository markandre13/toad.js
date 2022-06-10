import { TableAdapter } from '../adapter/TableAdapter'
import { Table } from '../Table'

// workaround for missing 'friend' declarator in typescript

export class TableFriend {
    table: Table
    constructor(table: Table) {
        this.table = table
    }
    get adapter() {
        return (this.table as any).adapter as TableAdapter<any>
    }
    get measure() {
        return (this.table as any).measure as HTMLDivElement
    }
    get body() {
        return (this.table as any).body as HTMLDivElement
    }
    get splitBody() {
        return (this.table as any).splitBody as HTMLDivElement
    }
    get colHeads() {
        return (this.table as any).colHeads as HTMLDivElement
    }
    get rowHeads() {
        return (this.table as any).rowHeads as HTMLDivElement
    }
    get colResizeHandles() {
        return (this.table as any).colResizeHandles as HTMLDivElement
    }
    get rowResizeHandles() {
        return (this.table as any).rowResizeHandles as HTMLDivElement
    }
    set animationDone(animationDone: () => void) {
        (this.table as any).animationDone = animationDone
    }
    get selection() {
        return this.table.selection
    }
    get style() {
        return this.table.style
    }
    clearAnimation() {
        (this.table as any).animation = undefined
    }
}
