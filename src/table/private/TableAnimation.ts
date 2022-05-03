import { Table } from '../Table'
import { TableFriend } from "./TableFriend"


export abstract class TableAnimation extends TableFriend {
    constructor(table: Table) {
        super(table)
    }
    abstract run(): void
    abstract stop(): void
}
