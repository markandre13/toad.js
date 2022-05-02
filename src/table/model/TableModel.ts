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

import { Model } from "../../model/Model"
import { TableEvent } from "../TableEvent"

// TODO: API for insert, delete and move rows and columns
export abstract class TableModel extends Model<TableEvent> {
  abstract get colCount(): number
  abstract get rowCount(): number
  isEmpty() { return this.colCount === 0 && this.rowCount === 0 }
}

export interface RowEditInterface {
    insertRow(row: number, rowData?: Array<any>): number
    removeRow(row: number, count: number): number 
}

export interface ColumnEditInterface {
    insertColumn(row: number, rowData?: Array<any>): number
    removeColumn(row: number, count: number): number 
}
