import { TableAdapter } from '../adapter/TableAdapter'
import { Table } from '../Table'

// workaround for missing 'friend' declarator in typescript

export class TableFriend {
    table: Table
    constructor(table: Table) {
        this.table = table
    }
    protected get adapter() {
        return (this.table as any).adapter as TableAdapter<any>
    }
    protected get measure() {
        return (this.table as any).measure as HTMLDivElement
    }
    protected get body() {
        return (this.table as any).body as HTMLDivElement
    }
    protected get splitBody() {
        return (this.table as any).splitBody as HTMLDivElement
    }
    protected clearAnimation() {
        (this.table as any).animation = undefined
    }
}
