/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { TableEvent } from "./TableEvent"
import { TableEventType } from "./TableEventType"
import { TypedTableModel } from "./TypedTableModel"

export abstract class ArrayTableModel<T> extends TypedTableModel<T> {

  data: Array<T>

  constructor(data: Array<T>, rowClass: new () => T) {
    super(rowClass)
    this.data = data
  }

  // get colCount(): number { return this.data ? this.data[0].length : 0 }
  get rowCount(): number { return this.data ? this.data.length : 0 }

  createRow(): T { return new this.nodeClass() }

  addRowAbove(row: number, rowData?: T | Array<T>): number {
    // console.log(`add row above ${row}`)
    if (rowData === undefined)
      rowData = this.createRow()
    let rowArray
    if (rowData instanceof Array)
      rowArray = rowData
    else
      rowArray = [rowData]
    this.data.splice(row, 0, ...rowArray)
    this.modified.trigger(new TableEvent(TableEventType.INSERT_ROW, row, rowArray.length))
    return row
  }

  deleteRow(row: number, count: number = 1): number {
    // console.log(`delete row ${row}`)
    this.data.splice(row, count)
    this.modified.trigger(new TableEvent(TableEventType.REMOVED_ROW, row, count))
    return row
  }
}
