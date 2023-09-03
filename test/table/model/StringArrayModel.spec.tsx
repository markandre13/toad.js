import { expect } from "@esm-bundle/chai"

import { SelectionModel } from "@toad/table/model/SelectionModel"
import { Table } from "@toad/table/Table"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { TableEditMode } from "@toad/table/TableEditMode"
import { StringArrayModel } from "@toad/table/model/StringArrayModel"
import { StringArrayAdapter } from "@toad/table/adapter/StringArrayAdapter"

describe("StringArrayModel", () => {
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
        it("render", () => {
            const model = new StringArrayModel(data)
            const selection = new SelectionModel(TableEditMode.SELECT_CELL)
            document.body.replaceChildren(<Table model={model} style={{ width: "320px", height: "200px" }} />)
        })
    })
})
