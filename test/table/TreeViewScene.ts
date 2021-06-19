import { expect } from "chai"
import { TableView, TableAdapter, TreeAdapter, TreeNode, TreeNodeModel, bind, unbind } from "@toad"

// ├─ 0
// │  ├─ 1
// │  │  ├─ 2
// │  │  └─ 3
// │  └─ 4
// │     └─ 5
// └─ 6
export class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

export class MyTreeAdapter extends TreeAdapter<MyNode> {
    override displayCell(col: number, row: number): Node | Node[] | undefined {       
        if (!this.model)
            return undefined
        return this.treeCell(row, this.model.rows[row].node.label)!
    }
}

export class TreeViewScene {
    table: TableView
    tree: TreeNodeModel<MyNode>

    constructor() {

        // setAnimationFrameCount(0)
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""

        let tree = new TreeNodeModel(MyNode)
        tree.addSiblingAfter(0)
        tree.addChildAfter(0)
        tree.addChildAfter(1)
        tree.addSiblingAfter(2)
        tree.addSiblingAfter(1)
        tree.addChildAfter(4)
        tree.addSiblingAfter(0)
        bind("tree", tree)
        this.tree = tree

        TableAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)

        document.body.innerHTML = `<toad-tabletool></toad-tabletool><toad-table model="tree"></toad-table>`
        this.table = document.body.children[1] as TableView
        expect(this.table.tagName).to.equal("TOAD-TABLE")
    }

    sleep(milliseconds: number = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('success')
            }, milliseconds)
        })
    }

    mouseDownAtCell(col: number, row: number, dx = 10, dy = 10) {
        const cell = this.table.getCellAt(col, row)!
        const svg = cell.children[0] as SVGSVGElement
        let bounds = svg.getBoundingClientRect()
        const e = new MouseEvent("mousedown", {
            bubbles: true,
            clientX: bounds.left + dx,
            clientY: bounds.top + dy,
            relatedTarget: svg
        })
        // console.log("dispatch mousedown")
        svg.dispatchEvent(e)
    }
}
