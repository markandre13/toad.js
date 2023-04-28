import { expect } from '@esm-bundle/chai'

import { SelectionModel } from '@toad/table/model/SelectionModel'
import { Table } from '@toad/table/Table'
import { TableModel } from "@toad/table/model/TableModel"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { TablePos } from '@toad/table/TablePos'
import { text } from '@toad/util/lsx'
import { TableEditMode } from '@toad/table/TableEditMode'

describe("table (more)", () => {
    before(() => {
        document.head.innerHTML = `<link rel="stylesheet" type="text/css" href="../style/tx-static.css" />
        <link rel="stylesheet" type="text/css" href="../style/tx-dark.css" />
        <link rel="stylesheet" type="text/css" href="../style/tx.css" />`
        TableAdapter.register(StringArrayAdapter, StringArrayModel)
    })

    const data = ["alpha", "bravo", "charly"]

    describe("StringArrayModel(data: string[])", () => {
        it("will offer the data as rows", () => {
            const model = new StringArrayModel(data)
            expect(model.colCount).to.equal(1)
            expect(model.rowCount).to.equal(3)

            expect(model.get(0)).to.equal(data[0])
            expect(model.get(1)).to.equal(data[1])
            expect(model.get(2)).to.equal(data[2])
        })
        // fields can not be edited
        // cursor moves up and down
        it.only("render", () => {
            const model = new StringArrayModel(data)
            const selection = new SelectionModel(TableEditMode.SELECT_CELL)
            document.body.replaceChildren(<Table model={model} style={{ width: "320px", height: "200px" }} />)
        })
    })
})

class StringArrayModel extends TableModel {
    protected data: string[]
    constructor(data: string[]) {
        super()
        this.data = data
    }
    override get colCount() { return 1 }
    override get rowCount() { return this.data.length }
    get(row: number) {
        return this.data[row]
    }
}

class StringArrayAdapter extends TableAdapter<StringArrayModel> {
    override showCell(pos: TablePos, cell: HTMLSpanElement): void {
        cell.replaceChildren(
            text(this.model!.get(pos.row))
        )
    }
}
