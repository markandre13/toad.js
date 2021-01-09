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

import { TextModel } from "../model"
import { View } from "../view"
import { TextView } from "../view/text"
import { TableModel } from "./TableModel"

export class ArrayTableModel extends TableModel {

  data: any

  constructor(data: any) {
    super()
    this.data = data
  }

  get colCount(): number { return this.data ? this.data[0].length : 0 }
  get rowCount(): number { return this.data ? this.data.length : 0 }

  // getColumnHead(column: number): TextModel {
  //   switch (column) {
  //     case 0: return new TextModel("Title")
  //     case 1: return new TextModel("Author")
  //     case 2: return new TextModel("Year")
  //   }
  //   throw Error("fuck")
  // }

  // getFieldModel(col: number, row: number): TextModel {
  //   let model = new TextModel(this.data[row][col])
  //   model.modified.add(() => {
  //     this.data[row][col] = model.value
  //   })
  //   return model
  // }

  // getFieldView(col: number, row: number): View {
  //   return new TextView()
  // }
}
