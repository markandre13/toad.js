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
 * 
 * @category Application Model
 */
export class GridTableModel<T> extends TypedTableModel<T> implements RowEditInterface, ColumnEditInterface {
    protected _cols: number
    protected _rows: number
    protected _data: Array<T>
    constructor(nodeClass: new () => T, cols: number = 0, rows: number = 0, data?: Array<T>) {
        super(nodeClass)
        this._cols = cols
        this._rows = rows
        const size = cols * rows
        if (data) {
            this._data = data
        } else {
            this._data = data === undefined ? new Array(size) : data
            for (let idx = 0; idx < size; ++idx) {
                this._data[idx] = new this.nodeClass()
            }
        }
    }
    asArray(): Array<T> {
        return this._data
    }
    override get colCount(): number {
        return this._cols
    }
    override get rowCount(): number {
        return this._rows
    }
    getCell(col: number, row: number): T {
        const idx = col + row * this._cols
        if (idx >= this._data.length) {
            throw Error(`GridTableModel.getCell(${col}, ${row}) is out of range in grid of size ${this.colCount} x ${this.rowCount}`)
        }
        return this._data[idx]
    }
    setCell(col: number, row: number, data: T) {
        this._data[col + row * this._cols] = data
    }
    insertRow(row: number, rowData?: Array<T>, rowLength: number = this._cols): number {
        if (this._data.length === 0) {
            this._cols = rowLength
        }

        if (rowData === undefined) {
            rowData = new Array<T>(this._cols)
            for (let col = 0; col < this._cols; ++col) {
                rowData[col] = new this.nodeClass()
            }
        }
        const count = rowData.length / this._cols
        this._data.splice(row * this._cols, 0, ...rowData)
        this._rows += count
        this.modified.trigger(new TableEvent(
            TableEventType.INSERT_ROW, row, count
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
    insertColumn(col: number, colData?: Array<T>, columnLength: number = this._rows): number {
        if (this._data.length === 0) {
            this._rows = columnLength
        }
        if (colData === undefined) {
            colData = new Array<T>(this._rows)
            for (let row = 0; row < this._rows; ++row) {
                colData[row] = new this.nodeClass()
            }
        }

        const newColumnCount = colData.length / this._rows

        let idx = col + this._cols * (this._rows - 1)
        let idxIn = colData.length
        for (let row = 0; row < this._rows; ++row) {
            for (let i = 0; i < newColumnCount; ++i) {
                this._data.splice(idx, 0, colData[--idxIn])
            }
            idx -= this._cols
        }

        this._cols += newColumnCount
        this.modified.trigger(new TableEvent(
            TableEventType.INSERT_COL, col, newColumnCount
        ))

        return col
    }
    removeColumn(col: number, count: number = 1): number {
        let idx = col + this._cols * (this._rows - 1)
        for (let row = 0; row < this._rows; ++row) {
            this._data.splice(idx, count)
            idx -= this._cols
        }
        this._cols -= count
        this.modified.trigger(new TableEvent(
            TableEventType.REMOVE_COL, col, count
        ))
        return col
    }
}
