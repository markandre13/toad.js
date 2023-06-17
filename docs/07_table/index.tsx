import { Table, TableAdapter, TablePos, TableTool, TreeAdapter, TreeNode, TreeNodeModel } from "@toad"
import { SpreadsheetAdapter } from "@toad/table/adapter/SpreadsheetAdapter"
import { SpreadsheetCell } from "@toad/table/model/SpreadsheetCell"
import { SpreadsheetModel } from "@toad/table/model/SpreadsheetModel"
import { fixedSystem, dynamicSystem } from "./starsystem"

import { code } from "./index.source"

//
// Application Layer
//

// Spreadsheet

const sheet = [
    ["Name", "Pieces", "Price/Piece", "Price"],
    ["Apple", "=4", "=0.98", "=B2*C2"],
    ["Banana", "=2", "=1.98", "=B3*C3"],
    ["Citrus", "=1", "=1.48", "=B4*C4"],
    ["SUM", "", "", "=D2+D3+D4"],
]

const spreadsheet = new SpreadsheetModel(25, 25)
for (let row = 0; row < spreadsheet.rowCount; ++row) {
    for (let col = 0; col < spreadsheet.colCount; ++col) {
        if (row < sheet.length && col < sheet[row].length) {
            spreadsheet.setField(col, row, sheet[row][col])
        }
    }
}
TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)

// Tree

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

// class MyTreeAdapter extends TreeAdapter<MyNode> {
//     override showCell(pos: TablePos, cell: HTMLSpanElement) {
//         // return this.model && this.treeCell(row, this.model.rows[row].node.label)
//     }
// }

class MyTreeAdapter extends TreeAdapter<MyNode> {
    constructor(model: TreeNodeModel<MyNode>) {
        super(model)
        this.config.seamless = true
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label
        super.treeCell(pos, cell, label)
    }
}

TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)
let tree = new TreeNodeModel(MyNode)
tree.addSiblingAfter(0)
tree.addChildAfter(0)
tree.addChildAfter(1)
tree.addSiblingAfter(2)
tree.addSiblingAfter(1)
tree.addChildAfter(4)
tree.addSiblingAfter(0)

//
// View Layer
//

export default () => (
    <>
        <h1>Table</h1>

        <div class="section">
            <p>While tables are a work in progress, the following should illustrate the intended versatility:</p>
        </div>

        <h2>Editable Array of Records</h2>
        <TableTool />
        <Table style={{ width: "100%", height: "200px" }} model={dynamicSystem} />

        <h2>Spreadsheet</h2>

        <p>Field values beginning with '=' define formulas. Valid operators are +, -, *, / and (, ).</p>

        <TableTool />
        <Table style={{ width: "100%", height: "200px" }} model={spreadsheet} />

        <h2>Tree</h2>

        <TableTool />
        <Table style={{ width: "320px", height: "200px" }} model={tree} />
        {code}
    </>
)
