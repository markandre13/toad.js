/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2024 Mark-André Hopf <mhopf@mark13.org>
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

import { ArrayModel } from "../model/ArrayModel"
import { TypedTableAdapter, InferTypedTableModelParameter } from "./TypedTableAdapter"
import { CELL_CHANGED } from "../TableEvent"

import { Reference } from "toad.jsx"
import { TablePos } from "../TablePos"

/**
 * @category Table Adapter
 */
export abstract class ArrayAdapter<
    M extends ArrayModel<any>,
    T = InferTypedTableModelParameter<M>
> extends TypedTableAdapter<M> {
    abstract getColumnHeads(): Array<string> | undefined
    abstract getRow(row: T): Array<Reference<T>>

    override getColumnHead(col: number): Node | undefined {
        const headers = this.getColumnHeads()
        if (headers === undefined) {
            return undefined
        }
        return document.createTextNode(headers[col])
    }

    override getRowHead(row: number): Node | undefined {
        return undefined
    }

    override get colCount(): number {
        return this.getRow(this.model?.data[0]).length
    }

    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        const text = this.getField(pos.col, pos.row)
        if (text === undefined) return undefined
        cell.replaceChildren(document.createTextNode(text))
    }

    override editCell(pos: TablePos, cell: HTMLSpanElement) {
        // const text = this.getField(col, row)
        // if (text === undefined)
        //     return undefined
        // const model = new TextModel(text)
        // model.modified.add(() => {
        //     this.setField(col, row, model.value)
        // })
        // const view = new Text()
        // view.setModel(model)
        // return view
    }

    protected getField(col: number, row: number): string | undefined {
        if (!this.model) return undefined
        const struct = this.model.data[row]
        const array = this.getRow(struct)
        return array[col].toString()
    }

    protected setField(col: number, row: number, text: string): void {
        if (!this.model) return
        this.getRow(this.model.data[row])[col].fromString(text)
        this.model.modified.trigger({ type: CELL_CHANGED, col, row })
    }
}
