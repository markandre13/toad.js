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

export class TableAdapter<T extends TableModel> {
    model?: T
    get colCount(): number {
        return this.model === undefined ? 0 : this.model.colCount
    }
    get rowCount(): number {
        return this.model === undefined ? 0 : this.model.rowCount
    }
    setModel(model: T): void {
        this.model = model
    }
    getColumnHead(col: number): Node | undefined { return undefined }
    getRowHead(row: number): Node | undefined { return undefined }
    displayCell(col: number, row: number): Node | undefined { return undefined }
    createEditor(col: number, row: number): Node | undefined { return undefined }

    isViewCompact(): boolean { return false }

    // FIXME: convert the comments below into clean code
    // data is used for TypeTableModel
    // Map<model, Map<data, adapter>>
    private static modelToAdapter = new Map<new(...args: any[]) => TableModel, Map<new(...args: any[])=> any, new()=> TableAdapter<any>>>()
    static register<T, A extends TypedTableAdapter<TypedTableModel<T>>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
    static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel): void
    static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel, data?: any): void
    {
        // console.log("TableAdapter.register() ============")
        // console.log(adapter)
        // console.log(model)
        // console.log(data)
        let typeToModel = TableAdapter.modelToAdapter.get(model)
        if (typeToModel === undefined) {
            typeToModel = new Map<any, any>()
            TableAdapter.modelToAdapter.set(model, typeToModel)
        }
        if (typeToModel.get(data) !== undefined) {
            throw Error(`attempt to redefine existing table adapter`)
        }
        typeToModel.set(data, adapter)
    }

    static unbind() {
        TableAdapter.modelToAdapter.clear()
    }

    static lookup(model: TableModel): (new() => TableAdapter<any>) {
        // console.log("TableAdapter.lookup() ============")

        let dataType: any
        if(model instanceof TypedTableModel) {
            dataType = model.nodeClass
        } else {
            dataType = undefined
        }
        
        let adapter = TableAdapter.modelToAdapter.get(Object.getPrototypeOf(model).constructor)?.get(dataType)
        if (adapter === undefined) {
            for(let baseClass of TableAdapter.modelToAdapter.keys()) {
                if (model instanceof baseClass) {
                    adapter = TableAdapter.modelToAdapter.get(baseClass)?.get(dataType)
                    break
                }
            }
        }

        if (adapter === undefined) {
            let msg = `TableAdapter.lookup(): Did not find an adapter for model of type ${model.constructor.name}`
            msg += `\n    Requested adapter: model=${model.constructor.name}, type=${dataType.name}\n    Available adapters:`
            for (const [modelX, typeToAdapterX] of TableAdapter.modelToAdapter) {
                for(const [typeX, adapterX] of typeToAdapterX) {
                    // msg += `\n model=${model?.constructor.name}, type=${type.name}`
                    msg += `\n        model=${modelX.name}, type=${typeX}`
                }
            }
            throw Error(msg)
        }
        // console.log("TableAdapter.lookup() found adapter")
        // console.log(adapter)
        return adapter
    }
}
