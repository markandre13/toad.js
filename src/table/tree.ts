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

// import { TextModel, View, Model, bind } from '../toad'
// import { text, line, rectangle } from "../svg"
// import { TreeModel } from './TreeModel'
// import { TreeNodeModel } from './TreeNodeModel'

// class Node {
//     label: string
//     next?: Node
//     down?: Node

//     static counter = 0

//     constructor(label?: string, next?: Node, down?: Node) {
//         if (label === undefined)
//             this.label = `#${Node.counter++}`
//         else
//             this.label = label
//         this.next = next
//         this.down = down
//     }
//     print(indent = 0) {
//         console.log(`${"  ".repeat(indent)} ${this.label}`)
//         if (this.down)
//             this.down.print(indent+1)
//         if (this.next)
//             this.next.print(indent)
//     }
// }

// const sx = 12     // horizontal step width
// const dx = 3.5    // additional step before drawing the rectangle
// const dy = 4.5    // step from top to rectangle
// const rs = 8      // rectangle width and height
// const rx = 3      // horizontal line from rectangle to data on the left
// const item_h = 20 // height of row

// class TreeNodeView extends View {
//     model: TreeModel<Node>
//     row: TreeModel.Row<Node>

//     constructor(model: TreeModel<Node>, row: TreeModel.Row<Node>) {
//         super()
//         this.model = model
//         this.row = row
//         this.attachShadow({mode: 'open'})
//         // this.shadowRoot!.appendChild(document.importNode(this.getStyle(), true))
//         this.shadowRoot!.appendChild(this.create())
//         // this.input = document.createElement("input") 
//         // this.input.oninput = () => { this.updateModel() }
//         // this.attachShadow({mode: 'open'})
//         // this.shadowRoot!.appendChild(document.importNode(textStyle, true))
//         // this.shadowRoot!.appendChild(this.input)
//     }

//     create(): Element {

//         // console.log("-------------------- TreeNodeView.create() -------------------------")

//         let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
//         svg.style.border = "none"
//         svg.style.display = "block"
//         svg.setAttributeNS("", "width", "70")
//         svg.setAttributeNS("", "height", `${item_h}`)

//         const d = this.row.depth

//         svg.appendChild(text(d*sx+dx+sx+5, dy+8, this.row.node.label))

//         if (this.row.node.down) {
//             // box
//             svg.appendChild(rectangle(d*sx+dx, dy, rs, rs))
//             // minus
//             svg.appendChild(line(d*sx+dx+(rs>>2), dy+(rs>>1), d*sx+dx+rs-(rs>>2), dy+(rs>>1)))
//             if (!this.row.open) {
//                 // plus
//                 svg.appendChild(line(d*sx+dx+(rs>>1), dy+(rs>>2), d*sx+dx+(rs>>1), dy+rs-(rs>>2)))
//             }
//             // horizontal line to data
//             svg.appendChild(line(d*sx+dx+rs, dy+(rs>>1), d*sx+dx+rs+rx, dy+(rs>>1)))
//         } else {
//             // upper vertical line instead of box
//             svg.appendChild(line(d*sx+dx+(rs>>1), dy, d*sx+dx+(rs>>1), dy+(rs>>1)))
//             // horizontal line to data
//             svg.appendChild(line(d*sx+dx+(rs>>1), dy+(rs>>1), d*sx+dx+rs+rx, dy+(rs>>1)))
//         }

//         // small line above box
//         svg.appendChild(line(d*sx+dx+(rs>>1),0, d*sx+dx+(rs>>1), dy))

//         // lines connecting nodes
//         let row
//         for(row = 0; this.model.rows[row] !== this.row; ++row) {}

//         // console.log(`render tree graphic for row ${row} at depth ${d}`)

//         for(let i=0; i<=d; ++i) {
//             // console.log(`check row ${row}, depth ${i}`)
//             for(let j=row+1; j<this.model.rowCount; ++j) {
//                 if (this.model.rows[j].depth < i)
//                     break
//                 if ( i === this.model.rows[j].depth) {
//                     if ( i!== d) {
//                         // long line without box
//                         svg.appendChild(line(i*sx+dx+(rs>>1),0,i*sx+dx+(rs>>1), item_h))
//                     } else {
//                         // small line below box
//                         if (row+1 < this.model.rows.length && this.model.rows[row+1].depth > this.row.depth) {
//                             // has subtree => start below box
//                             svg.appendChild(line(i*sx+dx+(rs>>1),dy+rs,i*sx+dx+(rs>>1),item_h))
//                         } else {
//                             // has no subtree => has no box => don't start below box
//                             svg.appendChild(line(i*sx+dx+(rs>>1),dy+(rs>>1),i*sx+dx+(rs>>1),item_h))
//                         }
//                     }
//                     break
//                 }
//             }
//         }
//         return svg
//     }

//     setModel(model?: Model): void {
//     }
// }
// window.customElements.define("toad-treenode", TreeNodeView)

// class NoModel extends Model {
// }

// class MyTreeModel extends TreeNodeModel<Node> {
//     getFieldModel(col: number, row: number): TextModel {
//         if (col < 0 || col >= this.colCount || row < 0 || row >= this.rowCount)
//             throw Error(`MyTreeModel.getFieldModel(${col}, ${row}) is out of range`)
//         return new NoModel() as TextModel
//     }

//     getFieldView(col: number, row: number): View {
//         // console.log(`MyTreeModel.getFieldView(${col}, ${row})`)
//         return new TreeNodeView(this, this.rows[row])
//     }
// }

export function myTreeTest() {
    // let tree = new MyTreeModel(Node)
    // tree.addSiblingAfter(0)
    // tree.addChildAfter(0)
    // tree.addChildAfter(1)
    // tree.addSiblingAfter(1)
    // tree.addSiblingAfter(0)
    // bind("books", tree)
}