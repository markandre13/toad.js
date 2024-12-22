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

import { INSERT_ROW, REMOVE_ROW } from "../TableEvent"
import { RowEditInterface } from "./TableModel"
import { TypedTableModel } from "./TypedTableModel"

/**
 *  A one dimensional array of rows of type T.
 *
 * @category Application Model
 */
export abstract class ArrayTableModel<T> extends TypedTableModel<T> implements RowEditInterface {
    data: Array<T>

    constructor(data: Array<T>, rowClass: new () => T) {
        super(rowClass)
        this.data = data
    }

    // get colCount(): number { return this.data ? this.data[0].length : 0 }
    get rowCount(): number {
        return this.data ? this.data.length : 0
    }

    createRow(): T {
        return new this.nodeClass()
    }

    insertRow(row: number, rowData?: T | Array<T>): number {
        // console.log(`add row above ${row}`)
        if (row > this.rowCount) {
            throw Error(
                `ArrayTableModel.insert(${row}) is out of range, model size is ${this.colCount}, ${this.rowCount}`
            )
        }

        if (rowData === undefined) rowData = this.createRow()
        let rowArray
        if (rowData instanceof Array)
            // FIXME: what if T is also an array?
            rowArray = rowData
        else rowArray = [rowData]
        this.data.splice(row, 0, ...rowArray)
        this.signal.emit({ type: INSERT_ROW, index: row, size: rowArray.length })
        return row
    }

    removeRow(row: number, count: number = 1): number {
        if (row >= this.rowCount || row + count > this.rowCount) {
            throw Error(
                `ArrayTableModel.remove(${row}, ${count}) is out of range, model size is ${this.colCount}, ${this.rowCount}`
            )
        }
        // console.log(`delete row ${row}`)
        this.data.splice(row, count)
        this.signal.emit({ type: REMOVE_ROW, index: row, size: count })
        return row
    }
}
