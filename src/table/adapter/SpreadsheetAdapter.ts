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

import { SpreadsheetModel } from '../model/SpreadsheetModel'
import { EditMode } from './TableAdapter'
import { GridAdapter } from "./GridAdapter"
import { TablePos } from '../TablePos'

/**
 * @category Table Adapter
 */
export class SpreadsheetAdapter<T extends SpreadsheetModel> extends GridAdapter<T> {

    constructor(model: T) {
        super(model)
        this.config.editMode = EditMode.EDIT_ON_ENTER
    }

    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (!this.model) {
            return undefined
        }
        if (cell === undefined) {
            throw Error(`showCell(undefined)`)
        }

        const data = this.model!.getCell(pos.col, pos.row)
        
        if (data._error) {
            // console.log(`showCell [${pos.col}, ${pos.row}] -> show error`)
            cell.classList.add("error")
            cell.title = data._error
        } else {
            // console.log(`showCell [${pos.col}, ${pos.row}] -> remove error`)
            cell.classList.remove("error")
            cell.title = ""
        }
        super.showCell(pos, cell)
    }

    override editCell(pos: TablePos, cell: HTMLSpanElement) {
        // console.log("SpreadsheetAdapter.editCell()")
        // cell.tabIndex = -1
        // cell.contentEditable = "true"
        // cell.focus()
        const data = this.model!.getCell(pos.col, pos.row)
        // switch display to value entered by the user
        if (data !== undefined && data._inputValue !== undefined) {
            cell.innerText = data._inputValue!
        }
    }

    override saveCell(pos: TablePos, cell: HTMLSpanElement): void {
        // console.log("MyASpreadsheetAdapterdapter.saveCell()")

        // cell.classList.remove("edit")

        // this.model!.getCell(pos.col, pos.row)
        // cell.tabIndex = 0
        // cell.contentEditable = "inherit"

        try {
            this.model!.setField(pos.col, pos.row, cell.innerText)
            // switch display back to the calculated value
            const data = this.model!.getCell(pos.col, pos.row)
            cell.innerText = data.value
        }
        catch (e) {
            console.log(`saveCell caught error`)
            console.log(e)
        }
        // cell.blur()
    }
}
