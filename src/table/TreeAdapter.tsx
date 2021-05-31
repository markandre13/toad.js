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

/** @jsx toadJSX.createElement */
import * as toadJSX from '../jsx'

import { TableModel } from "./TableModel"
import { TreeModel } from "./TreeModel"
import { TypedTableAdapter } from "./TypedTableAdapter"

const sx = 12     // horizontal step width
const dx = 3.5    // additional step before drawing the rectangle
const dy = 4.5    // step from top to rectangle
const rs = 8      // rectangle width and height
const rx = 3      // horizontal line from rectangle to data on the left
const item_h = 20 // height of row

export class TreeAdapter<T> extends TypedTableAdapter<T> {
    model?: TreeModel<T>

    override isViewCompact(): boolean { return true }

    // TODO: the adapter might want to override the number of columns and rows
    // ie. in case a column has different representations, ie. text field, slider, graphic, etc.

    // TODO: the adapter might want to tweak the table's style sheet

    // TODO: can we make this a strict runtime check for M and T???
    override setModel(model: TableModel): void {
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
        // FIXME: adjust svg width to content... would auto work?
        const svg = <svg style={{border: "none", display: "block"}} width={470} height={item_h} /> as SVGSVGElement
        const d = r.depth

        svg.appendChild(<text x={d*sx+dx+sx+5} y={dy+8} fill="#000">{label}</text>)

        if (this.model.getDown(r.node)) {
            // TODO: port Rectangle from workflow to toad.js
            const x0 = d*sx+dx

            // box
            const box = <rect x={d*sx+dx} y={dy} width={rs} height={rs} stroke="#000" fill="#fff" cursor="pointer"/>
            svg.appendChild(box)

            // minus
            svg.appendChild(<line x1={d*sx+dx+(rs>>2)} y1={dy+(rs>>1)} x2={d*sx+dx+rs-(rs>>2)} y2={dy+(rs>>1)} stroke="#000" cursor="pointer"/>)

            const plus = <line x1={d*sx+dx+(rs>>1)} y1={dy+(rs>>2)} x2={d*sx+dx+(rs>>1)} y2={dy+rs-(rs>>2)} stroke="#000" cursor="pointer"/>
            plus.style.display =  r.open ? "none" : ""
            svg.appendChild(plus)

            // horizontal line to data
            svg.appendChild(<line x1={d*sx+dx+rs} y1={dy+(rs>>1)} x2={d*sx+dx+rs+rx} y2={dy+(rs>>1)} stroke="#000" />)

            svg.onmousedown = (event: MouseEvent) => {
                event.preventDefault()
                if (this.model === undefined) {
                    console.log("  ==> no model")
                    return
                }

                const rowNumber = this.model.getRow(r.node)
                if (rowNumber === undefined) {
                    console.log("  ==> couldn't find row number for node")
                    return
                }
                                
                const bounds = svg.getBoundingClientRect()
                const x = event.clientX - bounds.left
                const y = event.clientY - bounds.top
                if (x0 <= x && x <= x0 + rs && dy <= y && y <= dy+rs) {
                    this.model?.toggleAt(rowNumber) // TODO: this row number varies!!!
                    // console.log(`toggled row ${row} to ${this.model!.isOpen(row)}`)
                    plus.style.display =  this.model.isOpen(rowNumber) ? "none" : ""
                    event.stopPropagation()
                }
            }
        } else {
            // upper vertical line instead of box
            svg.appendChild(<line x1={d*sx+dx+(rs>>1)} y1={dy} x2={d*sx+dx+(rs>>1)} y2={dy+(rs>>1)} stroke="#000" />)
            // horizontal line to data
            svg.appendChild(<line x1={d*sx+dx+(rs>>1)} y1={dy+(rs>>1)} x2={d*sx+dx+rs+rx} y2={dy+(rs>>1)} stroke="#000" />)
        }

        // small line above box
        svg.appendChild(<line x1={d*sx+dx+(rs>>1)} y1={0} x2={d*sx+dx+(rs>>1)} y2={dy} stroke="#000" />)

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
                        svg.appendChild(<line x1={i*sx+dx+(rs>>1)} y1={0} x2={i*sx+dx+(rs>>1)} y2={item_h} stroke="#000" />)
                    } else {
                        // small line below box
                        if (this.model.getDown(this.model.rows[row].node) !== undefined)    {
                            // has subtree => start below box
                            svg.appendChild(<line x1={i*sx+dx+(rs>>1)} y1={dy+rs} x2={i*sx+dx+(rs>>1)} y2={item_h} stroke="#000" />)
                        } else {
                            // has no subtree => has no box => don't start below box
                            svg.appendChild(<line x1={i*sx+dx+(rs>>1)} y1={dy+(rs>>1)} x2={i*sx+dx+(rs>>1)} y2={item_h} stroke="#000" />)
                        }
                    }
                    break
                }
            }
        }
        return svg
    }
}