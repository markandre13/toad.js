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

import { Model, TextModel } from "../model"
import { View } from "../view"

// FIXME: API for insert, delete and move row(s)

export abstract class TableModel extends Model {
  abstract get colCount(): number
  abstract get rowCount(): number
  isEmpty() { return this.colCount === 0 && this.rowCount === 0 }

  // TODO: not sure about these
  getColumnHead(column: number): TextModel | undefined { return undefined }
  abstract getFieldModel(col: number, row: number): TextModel
  getFieldView(col: number, row: number): View | undefined { return undefined }
}


