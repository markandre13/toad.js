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

import { text } from "@toad"
import { GridTableModel } from "@toad/table/model/GridTableModel"
import { TypedTableAdapter } from '@toad/table/adapter/TypedTableAdapter'
import { TablePos } from "../TablePos"

/**
 * @category Table Adapter
 */
export abstract class GridAdapter<M extends GridTableModel<any>> extends TypedTableAdapter<M> {
    override showCell(pos: TablePos, cell: HTMLSpanElement){
        if (!this.model) {
            return undefined
        }
        const data = this.model.getCell(pos.col, pos.row)
        if (data !== undefined)
            cell.replaceChildren(text(data.value))
        else
            cell.replaceChildren()
    }

    override getRowHead(row: number): Node | undefined {
        // console.log(`row ${row} -> ${row}`)
        return text(`${row + 1}`)
    }

    override getColumnHead(col: number): Node | undefined {
        let str = ""
        let code = col
        while (true) {
            str = `${String.fromCharCode((code % 26) + 0x41)}${str}`
            code = Math.floor(code / 26)
            if (code === 0) {
                break
            }
            code -= 1
        }
        return text(str)
    }
}
