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

import { TableModel, TreeModel, TypedTableAdapter } from '../toad'
import { text, line, rectangle } from "../svg"

const sx = 12     // horizontal step width
const dx = 3.5    // additional step before drawing the rectangle
const dy = 4.5    // step from top to rectangle
const rs = 8      // rectangle width and height
const rx = 3      // horizontal line from rectangle to data on the left
const item_h = 20 // height of row

export class TreeAdapter<T> extends TypedTableAdapter<T> {
    model?: TreeModel<T>

    // TODO: the adapter might want to override the number of columns and rows
    // ie. in case a column has different representations, ie. text field, slider, graphic, etc.

    // TODO: the adapter might want to tweak the table's style sheet

    // TODO: can we make this a strict runtime check for M and T???
    setModel(model: TableModel): void {
        if (!(model instanceof TreeModel))
            throw Error(`model is not of type TreeModel<T>`)
        // if (model.nodeClass instanceof T)
        //     throw Error(`model is not of TreeModel<MyNode>`)
        this.model = model
    }

    treeCell(row: number, label: string): Element | undefined {
        if (!this.model)
            return undefined

        const r = this.model.rows[row]

        // console.log("-------------------- TreeNodeView.create() -------------------------")

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.style.border = "none"
        svg.style.display = "block"
        svg.setAttributeNS("", "width", "70")
        svg.setAttributeNS("", "height", `${item_h}`)

        const d = r.depth

        svg.appendChild(text(d*sx+dx+sx+5, dy+8, label))

        if (this.model.getDown(r.node)) {
            // box
            svg.appendChild(rectangle(d*sx+dx, dy, rs, rs))
            // minus
            svg.appendChild(line(d*sx+dx+(rs>>2), dy+(rs>>1), d*sx+dx+rs-(rs>>2), dy+(rs>>1)))
            if (!r.open) {
                // plus
                svg.appendChild(line(d*sx+dx+(rs>>1), dy+(rs>>2), d*sx+dx+(rs>>1), dy+rs-(rs>>2)))
            }
            // horizontal line to data
            svg.appendChild(line(d*sx+dx+rs, dy+(rs>>1), d*sx+dx+rs+rx, dy+(rs>>1)))
        } else {
            // upper vertical line instead of box
            svg.appendChild(line(d*sx+dx+(rs>>1), dy, d*sx+dx+(rs>>1), dy+(rs>>1)))
            // horizontal line to data
            svg.appendChild(line(d*sx+dx+(rs>>1), dy+(rs>>1), d*sx+dx+rs+rx, dy+(rs>>1)))
        }

        // small line above box
        svg.appendChild(line(d*sx+dx+(rs>>1),0, d*sx+dx+(rs>>1), dy))

        // lines connecting nodes
        // console.log(`render tree graphic for row ${row} at depth ${d}`)
        for(let i=0; i<=d; ++i) {
            // console.log(`check row ${row}, depth ${i}`)
            for(let j=row+1; j<this.model.rowCount; ++j) {
                if (this.model.rows[j].depth < i)
                    break
                if ( i === this.model.rows[j].depth) {
                    if ( i!== d) {
                        // long line without box
                        svg.appendChild(line(i*sx+dx+(rs>>1),0,i*sx+dx+(rs>>1), item_h))
                    } else {
                        // small line below box
                        if (row+1 < this.model.rows.length && this.model.rows[row+1].depth > r.depth) {
                            // has subtree => start below box
                            svg.appendChild(line(i*sx+dx+(rs>>1),dy+rs,i*sx+dx+(rs>>1),item_h))
                        } else {
                            // has no subtree => has no box => don't start below box
                            svg.appendChild(line(i*sx+dx+(rs>>1),dy+(rs>>1),i*sx+dx+(rs>>1),item_h))
                        }
                    }
                    break
                }
            }
        }
        return svg
    }
}