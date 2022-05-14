import { TablePos } from "@toad"
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { EditMode } from '@toad/table/adapter/TableAdapter'
import { GridAdapter } from "./GridAdapter"


export class SpreadsheetAdapter<T extends SpreadsheetModel> extends GridAdapter<T> {

    override get editMode(): EditMode {
        return EditMode.EDIT_ON_ENTER
    }

    override editCell(pos: TablePos, cell: HTMLSpanElement) {
        // console.log("MyAdapter.editCell()")
        cell.tabIndex = -1
        cell.contentEditable = "true"
        cell.focus()
        const a = this.model!.getCell(pos.col, pos.row)
        // console.log(a)
        if (a !== undefined) {
            cell.innerText = a._str!
        }
        return undefined
    }

    override saveCell(pos: TablePos, cell: HTMLSpanElement): void {
        // console.log("MyAdapter.saveCell()")
        // this.model!.getCell(pos.col, pos.row)
        this.model!.setField(pos.col, pos.row, cell.innerText)
        cell.innerText = this.model!.getField(pos.col, pos.row) // HACK! The model should generate events to update the fields!!!
        cell.tabIndex = 0
        cell.contentEditable = "inherit"
        // cell.blur()
    }
}
