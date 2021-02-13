/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018, 2021 Mark-André Hopf <mhopf@mark13.org>
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

import { TableModel } from "./TableModel"
import { ArrayTableModel } from "./ArrayTableModel"

function dump(element: HTMLElement, depth?: number): void {
  if (depth===undefined)
    depth = 0
  let out=""
  for(let i=0; i<depth; ++i)
    out += "  "
  out += element.tagName
  if (element.tagName==="TD" || element.tagName==="TH")
    out+="  '" + element.innerText + "'"
  console.log(out)
  for(let child of element.children)
    dump(child as HTMLElement, depth+1)
}

export enum TableEditMode {
  EDIT_CELL, // FIXME: replace with SELECT_CELL and TableModel.getFieldView will return undefined when not editable
  SELECT_CELL,
//  SELECT_COLUMN,
  SELECT_ROW
}

export class TablePos {
  col: number
  row: number
  constructor(col: number, row: number) {
    this.col = col
    this.row = row
  }
}

/*
 * the following is most likely to become obsolete
 */

// let tableModelLocators = new Array<(data: any) => TableModel|undefined>()

// export function registerTableModelLocator( locator: (data: any) => TableModel|undefined ): void {
//   tableModelLocators.push(locator)
// }

// export function createTableModel(data: any): TableModel {
//   for(let locator of tableModelLocators) {
//     let model = locator(data)
//     if (model)
//       return model
//   }
//   throw new Error("findTableModel() failed to locate a table model")
// }

// registerTableModelLocator( function(data: any): TableModel | undefined {
//   if (!(data instanceof Array)) {
//     return undefined
//   }
//   if (data.length===0) {
//     return undefined
//   }
//   if (!(data[0] instanceof Array)) {
//     return undefined
//   }
//   for(let field of data[0]) {
//     if ( typeof field !== "string" &&
//          typeof field !== "number" )
//     {
//       return undefined
//     }
//   }
//   return new ArrayTableModel(data)
// })
