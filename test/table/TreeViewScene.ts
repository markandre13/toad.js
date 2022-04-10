import { expect } from "@esm-bundle/chai"
import { TableView, TableAdapter, TreeAdapter, TreeNode, TreeNodeModel, bindModel, unbind } from "@toad"

// ├─ 0
// │  ├─ 1
// │  │  ├─ 2
// │  │  └─ 3
// │  └─ 4
// │     └─ 5
// └─ 6
//    └─ 7
//    └─ 8
//    └─ 9
export class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

interface Options {
    rowHeads?: boolean
}

class MyTreeModel extends TreeNodeModel<MyNode> {
    options: Options

    constructor(options: Options = {}) {
        super(MyNode)
        this.options = options
    }
}

export class MyTreeAdapter extends TreeAdapter<MyNode> {
    
    override getRowHead(row: number) {
        // FIXME: we don't want this cast, let TreeAdapter have an option 2nd type argument instead
        if ((this.model as MyTreeModel).options.rowHeads !== true) {
            return undefined
        }
        return document.createTextNode(`ROW#${row}`)
    }

    override getDisplayCell(col: number, row: number): Node | Node[] | undefined {       
        if (!this.model)
            return undefined
        return this.treeCell(row, this.model.rows[row].node.label)!
    }
}


export class TreeViewScene {
    table: TableView
    tree: TreeNodeModel<MyNode>

    constructor(options: Options = {}) {

        // setAnimationFrameCount(0)
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""

        let tree = new MyTreeModel(options)
        tree.addSiblingAfter(0)
        tree.addChildAfter(0)
        tree.addChildAfter(1)
        tree.addSiblingAfter(2)
        tree.addSiblingAfter(1)
        tree.addChildAfter(4)
        tree.addSiblingAfter(0)
        tree.addChildAfter(6)
        tree.addSiblingAfter(7)
        tree.addSiblingAfter(8)
        bindModel("tree", tree)
        this.tree = tree

        TableAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)

        document.body.innerHTML = `<tx-tabletool></tx-tabletool><tx-table model="tree"></tx-table>`
        this.table = document.body.children[1] as TableView
        expect(this.table.tagName).to.equal("TX-TABLE")
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
        const svg = cell.children[0].shadowRoot!.children[0]
        let bounds = svg.getBoundingClientRect()
        const e = new MouseEvent("mousedown", {
            bubbles: true,
            clientX: bounds.left + dx,
            clientY: bounds.top + dy,
            relatedTarget: svg
        })
        svg.dispatchEvent(e)
    }
}
