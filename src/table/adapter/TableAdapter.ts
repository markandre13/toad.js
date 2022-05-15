/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
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

import { TableModel } from "../model/TableModel"
import { TypedTableModel } from "../model/TypedTableModel"
import { TablePos } from "../TablePos"
import { TypedTableAdapter } from "./TypedTableAdapter"

export enum EditMode {
    // begin to edit the cell when it has the focus. this is the default
    EDIT_ON_FOCUS,
    // begin to edit the cell when the enter key was pressed.
    // cell editing follows google sheets shortcuts:
    // not editing
    //   type    : replace cell content
    //   [enter] : edit cell content/formula (ms excel & apple pages use these: ctrl+u, f2, ctrl+=)
    // editing
    //   [enter] : move down
    //   [esc]   : revert changes
    EDIT_ON_ENTER
}

type ModelConstructor = new (...args: any[]) => TableModel
type AdapterConstructor = new (model: TableModel) => TableAdapter<any>
type TypeConstructor = (new (...args: any[]) => any)
type TypeToAdapter = Map<TypeConstructor | null, AdapterConstructor>

export class TableAdapter<T extends TableModel> {
    model?: T
    constructor(model: T) {
        this.model = model
    }
    get editMode(): EditMode {
        return EditMode.EDIT_ON_FOCUS
    }
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

    // old style: remove
    // getDisplayCell(col: number, row: number): Node | Node[] | undefined { return undefined }
    // getEditorCell(col: number, row: number): Node | undefined { return undefined }

    // new style
    showCell(pos: TablePos, cell: HTMLSpanElement) { }
    editCell(pos: TablePos, cell: HTMLSpanElement) { }
    saveCell(pos: TablePos, cell: HTMLSpanElement) { }

    isViewCompact(): boolean { return false }

    // FIXME: convert the comments below into clean code
    // data is used for TypeTableModel
    // Map<model, Map<data, adapter>>

    private static modelToAdapter = new Map<ModelConstructor, TypeToAdapter>();

    static register<M extends TableModel>(
        adapter: new (model: M) => TableAdapter<M>,
        model: new (...args: any[]) => M): void
    static register<
        A extends TypedTableAdapter<M>,
        M extends TypedTableModel<D>,
        D
    >(
        adapter: new (model: M) => A,
        model: new (...args: any[]) => M,
        data: new (...args: any[]) => D): void
    static register(
        adapter: AdapterConstructor,
        model: ModelConstructor,
        data?: TypeConstructor) {

        // console.log(`TableAdapter.register(${adapter.name}, ${model.name}, ${data?.name})`)

        let typeToModel: TypeToAdapter | undefined = TableAdapter.modelToAdapter.get(model)
        if (typeToModel === undefined) {
            typeToModel = new Map()
            TableAdapter.modelToAdapter.set(model, typeToModel)
        }

        if (data !== undefined) {
            if (typeToModel.has(data)) {
                throw Error(`attempt to redefine existing table adapter`)
            }
            typeToModel.set(data, adapter)
        } else {
            if (typeToModel.has(null)) {
                throw Error(`attempt to redefine existing table adapter`)
            }
            typeToModel.set(null, adapter)
        }
    }

    static unbind() {
        TableAdapter.modelToAdapter.clear()
    }

    static lookup(model: TableModel): (new (model: TableModel) => TableAdapter<any>) {
        // console.log(`TableAdapter.lookup(${(model as any).constructor.name}) ============`)

        let dataType: any
        if (model instanceof TypedTableModel) {
            dataType = model.nodeClass
        } else {
            dataType = null
        }

        const typeToAdapter = TableAdapter.modelToAdapter.get(Object.getPrototypeOf(model).constructor)
        let adapter = typeToAdapter?.get(dataType)

        if (adapter === undefined) {
            for (let baseClass of TableAdapter.modelToAdapter.keys()) {
                if (model instanceof baseClass) {
                    adapter = TableAdapter.modelToAdapter.get(baseClass)?.get(dataType)
                    break
                }
            }
        }

        if (adapter === undefined) {
            let msg = `TableAdapter.lookup(): Did not find an adapter for model of type ${model.constructor.name}`
            msg += `\n    Requested adapter: model=${model.constructor.name}, type=${dataType?.name}\n    Available adapters:`
            if (TableAdapter.modelToAdapter.size === 0) {
                msg += " none."
            } else {
                for (const [modelX, typeToAdapterX] of TableAdapter.modelToAdapter) {
                    for (const [typeX, adapterX] of typeToAdapterX) {
                        msg += `\n        model=${modelX.name}`
                        if (typeX !== undefined && typeX !== null) {
                            msg += `, type=${typeX.name}`
                        }
                    }
                }
            }
            throw Error(msg)
        }
        // console.log("TableAdapter.lookup() found adapter")
        // console.log(adapter)
        return adapter
    }
}
