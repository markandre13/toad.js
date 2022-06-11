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

import { TableEvent } from "../TableEvent"
import { TableEventType } from "../TableEventType"
import { TypedTableModel } from "./TypedTableModel"
import { ColumnEditInterface, RowEditInterface } from "./TableModel"

/**
 * A two dimensional grid in which rows and columns can be added and removed.
 */
export class GridTableModel<T> extends TypedTableModel<T> implements RowEditInterface, ColumnEditInterface {
    protected _cols: number
    protected _rows: number
    protected _data: Array<T>
    constructor(nodeClass: new () => T, cols: number, rows: number, data?: Array<T>) {
        super(nodeClass)
        this._cols = cols
        this._rows = rows
        const size = cols * rows
        this._data = data === undefined ? new Array(size) : data
        for (let idx = 0; idx < size; ++idx) {
            this._data[idx] = new this.nodeClass()
        }
    }
    override get colCount(): number {
        return this._cols
    }
    override get rowCount(): number {
        return this._rows
    }
    getCell(col: number, row: number): T {
        return this._data[col + row * this._cols]
    }
    setCell(col: number, row: number, data: T) {
        this._data[col + row * this._cols] = data
    }

    insertRow(row: number, rowData?: Array<T>): number {
        if (rowData === undefined) {
            rowData = new Array<T>(this._cols)
            for (let col = 0; col < this._cols; ++col) {
                rowData[col] = new this.nodeClass()
            }
        }
        this._data.splice(row * this._cols, 0, ...rowData)
        ++this._rows
        this.modified.trigger(new TableEvent(
            TableEventType.INSERT_ROW, row, 1
        ))
        return row
    }
    removeRow(row: number, count: number = 1): number {
        this._data.splice(row * this._cols, this._cols * count)
        this._rows -= count
        this.modified.trigger(new TableEvent(
            TableEventType.REMOVE_ROW, row, count
        ))
        return row
    }
    insertColumn(col: number, colData?: Array<T>): number {
        if (colData === undefined) {
            colData = new Array<T>(this._rows)
            for (let row = 0; row < this._rows; ++row) {
                colData[row] = new this.nodeClass()
            }
        }
        ++this._cols
        for (let row = 0; row < this._rows; ++row) {
            this._data.splice(col + row * this._cols, 0, colData[row])
        }
        this.modified.trigger(new TableEvent(
            TableEventType.INSERT_COL, col, 1
        ))

        return col
    }
    removeColumn(col: number, count: number = 1): number {
        --this._cols
        for (let row = 0; row < this._rows; ++row) {
            this._data.splice(col + row * this._cols, count)
        }
        this.modified.trigger(new TableEvent(
            TableEventType.REMOVE_COL, col, count
        ))
        return col
    }
}
