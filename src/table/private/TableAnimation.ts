import { Table } from '../Table'
import { TableFriend } from "./TableFriend"
import { Animation } from "../../util/animation"

export abstract class TableAnimation extends TableFriend implements Animation {
    constructor(table: Table) {
        super(table)
    }
    abstract prepare(): void
    abstract firstFrame(): void
    abstract animationFrame(value: number): void
    abstract lastFrame(): void
}
