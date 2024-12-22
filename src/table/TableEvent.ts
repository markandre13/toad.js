/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2024 Mark-André Hopf <mhopf@mark13.org>
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

import { ModelEvent } from "../model/Model"

export const INSERT_ROW = Symbol("INSERT_ROW")
export const REMOVE_ROW = Symbol("REMOVE_ROW")
export const INSERT_COL = Symbol("INSERT_COL")
export const REMOVE_COL = Symbol("REMOVE_COL")
export const CELL_CHANGED = Symbol("CELL_CHANGED")

export type InsertRowEvent = { type: typeof INSERT_ROW; index: number; size: number }
export type RemoveRowEvent = { type: typeof REMOVE_ROW; index: number; size: number }
export type InsertColEvent = { type: typeof INSERT_COL; index: number; size: number }
export type RemoveColEvent = { type: typeof REMOVE_COL; index: number; size: number }
export type CellChangedEvent = { type: typeof CELL_CHANGED; col: number; row: number }

export type TableEvent =
    | ModelEvent
    | InsertRowEvent
    | RemoveRowEvent
    | InsertColEvent
    | RemoveColEvent
    | CellChangedEvent

function f(e: TableEvent) {
    switch (e.type) {
        case INSERT_COL:
            e.size
            e.index
            break
        case CELL_CHANGED:
            e.col
            e.row
    }
}
