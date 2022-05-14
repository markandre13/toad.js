import { text } from "@toad"
import { GridTableModel } from "@toad/table/model/GridTableModel"
import { InferTypedTableModelParameter, TypedTableAdapter } from '@toad/table/adapter/TypedTableAdapter'


export abstract class GridAdapter<M extends GridTableModel<any>, T = InferTypedTableModelParameter<M>> extends TypedTableAdapter<M> {
    override getDisplayCell(col: number, row: number): Node | Node[] | undefined {
        if (!this.model) {
            return undefined
        }
        const cell = this.model.getCell(col, row)
        if (cell === undefined)
            return undefined
        return text(cell.value)
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
