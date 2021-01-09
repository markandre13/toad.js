/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { TreeNode, TreeNodeModel, TreeAdapter, bind } from '..'

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

class MyTreeAdapter extends TreeAdapter<MyNode> {
    displayCell(col: number, row: number): Node | undefined {       
        if (!this.model)
            return undefined
        return this.treeCell(row, this.model.rows[row].node.label)
    }
}

TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)

export function main() {
    let tree = new TreeNodeModel(MyNode)
    tree.addSiblingAfter(0)
    tree.addChildAfter(0)
    tree.addChildAfter(1)
    tree.addSiblingAfter(1)
    tree.addSiblingAfter(0)
    bind("tree", tree)
}
