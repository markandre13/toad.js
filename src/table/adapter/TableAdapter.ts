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
    // begin to edit the cell when the enter key was pressed
    // this is used in spreadsheets, where output and input may be different
    // input: a formula, output: the result of the formula
    EDIT_ON_ENTER
}

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

    // old style
    getDisplayCell(col: number, row: number): Node | Node[] | undefined { return undefined }
    getEditorCell(col: number, row: number): Node | undefined { return undefined }

    // new style
    showCell(pos: TablePos): string | Node | undefined { return undefined }
    editCell(pos: TablePos, cell: HTMLSpanElement) { }
    saveCell(pos: TablePos, cell: HTMLSpanElement) { }

    isViewCompact(): boolean { return false }

    // FIXME: convert the comments below into clean code
    // data is used for TypeTableModel
    // Map<model, Map<data, adapter>>
    private static modelToAdapter = new Map<new (...args: any[]) => TableModel, Map<new (...args: any[]) => any, new (model: TableModel) => TableAdapter<any>>>();

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
        adapter: new (model: TableModel) => TableAdapter<any>,
        model: (new (...args: any[]) => TableModel),
        data?: new (...args: any[]) => any): void {
        // console.log("TableAdapter.register() ============")
        // console.log(adapter)
        // console.log(model)
        // console.log(data)

        let typeToModel = TableAdapter.modelToAdapter.get(model)
        if (typeToModel === undefined) {
            typeToModel = new Map<any, any>()
            if (data === undefined && typeToModel.has(model)) {
                throw Error(`attempt to redefine existing table adapter`)
            }
            TableAdapter.modelToAdapter.set(model, typeToModel)
        }
        if (data !== undefined) {
            if (typeToModel.has(data)) {
                throw Error(`attempt to redefine existing table adapter`)
            }
            typeToModel.set(data, adapter)
        }
    }

    static unbind() {
        TableAdapter.modelToAdapter.clear()
    }

    static lookup(model: TableModel): (new (model: TableModel) => TableAdapter<any>) {
        // console.log("TableAdapter.lookup() ============")

        let dataType: any
        if (model instanceof TypedTableModel) {
            dataType = model.nodeClass
        } else {
            dataType = undefined
        }

        let adapter = TableAdapter.modelToAdapter.get(Object.getPrototypeOf(model).constructor)?.get(dataType)
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
                        if (typeX !== undefined) {
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
