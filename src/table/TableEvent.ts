/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TableEventType } from './TableEventType'

// const INSERT_ROW = Symbol("INSERT_ROW")
// const REMOVE_ROW = Symbol("REMOVE_ROW")
// type InsertRowEvent = {
//     type: typeof INSERT_ROW
//     row: number
//     size: number
// }
// type RemoveRowEvent = {
//     type: typeof REMOVE_ROW
//     row: number
//     size: number
// }
// type TableEvent = ValueModelEvent | InsertRowEvent | RemoveRowEvent

// TODO: rename into TableModelEvent ???

export class TableEvent {
    type: TableEventType
    index: number
    size: number
    constructor(type: TableEventType, index: number, size: number) {
        this.type = type
        this.index = index
        this.size = size
    }

    get col() {
        return this.index
    }

    get row() {
        return this.size
    }

    toString() {
        return `TableEvent {type: ${this.type.description}, index: ${this.index}, size: ${this.size}}`
    }
}
