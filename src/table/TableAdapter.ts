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

import { TableModel } from "./TableModel"
import { TypedTableModel } from "./TypedTableModel"
import { TypedTableAdapter } from "./TypedTableAdapter"

const nameToModel = new Map<string, TableModel>()
const modelToAdapter = new Map<any, Map<any,any>>()

export class TableAdapter {
    static register<T, A extends TypedTableAdapter<T>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
    static register(adapter: new() => TableAdapter, model: new()=>TableModel): void
    static register(adapter: new() => TableAdapter, model: new()=>TableModel, data?: any): void
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

    static lookup(model: TableModel): TableAdapter | undefined {
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
}
