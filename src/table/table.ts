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
import { TypedTableModel } from "./TypedTableModel"
import { TableAdapter } from "./TableAdapter"
import { TypedTableAdapter } from "./TypedTableAdapter"
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

declare global {
  interface Element {
    scrollIntoViewIfNeeded(center?: boolean): void
  }
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

const nameToModel = new Map<string, TableModel>()
const modelToAdapter = new Map<any, Map<any,any>>()

export function registerTableAdapter<T, A extends TypedTableAdapter<T>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
export function registerTableAdapter(adapter: new() => TableAdapter, model: new()=>TableModel): void
export function registerTableAdapter(adapter: new() => TableAdapter, model: new()=>TableModel, data?: any): void
{
//  console.log("register ============")
//  console.log(adapter)
//  console.log(model)
//  console.log(data)
  let typeToModel = modelToAdapter.get(model)
  if (typeToModel === undefined) {
    typeToModel = new Map<any, any>()
    modelToAdapter.set(model, typeToModel)
  }
  if (typeToModel.get(data) !== undefined) {
    throw Error(`attempt to redefine existing table adapter`)
  }
  typeToModel.set(data, adapter)
}

function lookupTableAdapter(model: TableModel): TableAdapter | undefined {
  let nodeClass: any
  if(model instanceof TypedTableModel) {
    nodeClass = model.nodeClass
  } else {
    nodeClass = undefined
  }
  
  let adapter: TableAdapter | undefined
  adapter = modelToAdapter.get(Object.getPrototypeOf(model).constructor)?.get(nodeClass)

  if (adapter === undefined) {
    for(let baseClass of modelToAdapter.keys()) {
      if (model instanceof baseClass) {
        adapter = modelToAdapter.get(baseClass)?.get(nodeClass)
        break
      }
    }
  }

  return adapter
}

/*
 * the following is most likely to become obsolete
 */

let tableModelLocators = new Array<(data: any) => TableModel|undefined>()

export function registerTableModelLocator( locator: (data: any) => TableModel|undefined ): void {
  tableModelLocators.push(locator)
}

export function createTableModel(data: any): TableModel {
  for(let locator of tableModelLocators) {
    let model = locator(data)
    if (model)
      return model
  }
  throw new Error("findTableModel() failed to locate a table model")
}

registerTableModelLocator( function(data: any): TableModel | undefined {
  if (!(data instanceof Array)) {
    return undefined
  }
  if (data.length===0) {
    return undefined
  }
  if (!(data[0] instanceof Array)) {
    return undefined
  }
  for(let field of data[0]) {
    if ( typeof field !== "string" &&
         typeof field !== "number" )
    {
      return undefined
    }
  }
  return new ArrayTableModel(data)
})
