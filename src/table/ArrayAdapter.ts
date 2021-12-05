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

import { ArrayModel } from "./ArrayModel"
import { TypedTableAdapter, InferTypedTableModelParameter } from "./TypedTableAdapter"
import { TableEvent } from "./TableEvent"
import { TableEventType } from "./TableEventType"

import { Reference } from "src"
import { TextModel } from "../model/TextModel"
import { Text } from "../view/Text"

export abstract class ArrayAdapter<M extends ArrayModel<any>, T = InferTypedTableModelParameter<M>> extends TypedTableAdapter<M> {

    abstract getColumnHeads(): Array<string>
    abstract getRow(row: T): Array<Reference<T>>

    override getColumnHead(col: number): Node | undefined {
        const headers = this.getColumnHeads()
        return document.createTextNode(headers[col])
    }
    
    override get colCount(): number {
        return this.getRow(this.model?.data[0]).length
    }

    override getRowHead(row: number) {
        return undefined
    }

    override getDisplayCell(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        return document.createTextNode(text)
    }

    override getEditorCell(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        const model = new TextModel(text)
        model.modified.add(() => {
            this.setField(col, row, model.value)
        })
        const view = new Text()
        view.setModel(model)
        return view
    }

    private getField(col: number, row: number): string | undefined {
        if (!this.model)
            return undefined
        return this.getRow(this.model.data[row])[col].toString()
    }

    private setField(col: number, row: number, text: string): void {
        if (!this.model)
            return
        this.getRow(this.model.data[row])[col].fromString(text)
        this.model.modified.trigger(new TableEvent(TableEventType.CELL_CHANGED, col, row))
    }
}
