/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import bind from 'bind-decorator'

import { TreeModel } from "./TreeModel"
import { TypedTableAdapter } from "./TypedTableAdapter"
import { View } from '../view/View'
import { Model } from '../model/Model'
import { RowInfo } from './TreeModel'

export class TreeNodeCell<T> extends View {
    model: TreeModel<T>
    rowinfo: RowInfo<T>
    label: string
    constructor(model: TreeModel<T>, rowinfo: RowInfo<T>, label: string) {
        super()
        this.model = model
        this.rowinfo = rowinfo
        this.label = label

        this.attachShadow({ mode: 'open' })
    }

    setModel(model: Model) { }

    override connectedCallback() {
        super.connectedCallback()
        this.paint()
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
    }

    paint() {
        if (!this.shadowRoot)
            return
        if (!this.parentElement)
            return

        const row = this.model.getRow(this.rowinfo.node)
        if (row === undefined)
            return

        const rs = 8      // rectangle width and height
        const sx = rs + 4 // horizontal step width, minimal vertical step width
        const height = sx
        const dx = 3.5    // additional step before and after drawing the rectangle
        const dy = Math.round(height / 2 - rs / 2) - 0.5       // step from top to rectangle
        const rx = 3      // horizontal line from rectangle to data on the left
        const width = this.rowinfo.depth * sx + sx + dx

        const content = <>
            <svg width={width} height={sx} style={{
                verticalAlign: "middle",
                background: "none",
            }} />
            <span style={{
                verticalAlign: "middle",
                padding: "2px",
            }}>{this.label}</span>
        </>

        const svg = content[0] as SVGElement

        if (true) {
            const rowinfo = this.rowinfo
            const d = rowinfo.depth

            // when we have children, draw a box
            if (this.model.getDown(rowinfo.node)) {
                // TODO: port Rectangle from workflow to toad.js
                const x0 = d * sx + dx

                // box
                const box = <rect x={x0} y={dy} width={rs} height={rs} stroke="#000" fill="#fff" cursor="pointer" />
                svg.appendChild(box)

                // minus
                svg.appendChild(<line x1={x0 + (rs >> 2)} y1={dy + (rs >> 1)} x2={x0 + rs - (rs >> 2)} y2={dy + (rs >> 1)} stroke="#000" cursor="pointer" />)

                // plus
                const plus = <line x1={x0 + (rs >> 1)} y1={dy + (rs >> 2)} x2={x0 + (rs >> 1)} y2={dy + rs - (rs >> 2)} stroke="#000" cursor="pointer" />
                plus.style.display = rowinfo.open ? "none" : ""
                svg.appendChild(plus)

                // horizontal line to data
                svg.appendChild(<line x1={x0 + rs} y1={dy + (rs >> 1)} x2={x0 + rs + rx} y2={dy + (rs >> 1)} stroke="#000" />)

                svg.onmousedown = (event: MouseEvent) => {
                    event.preventDefault()
                    event.stopPropagation()

                    const rowNumber = this.model.getRow(rowinfo.node)
                    if (rowNumber === undefined) {
                        console.log("  ==> couldn't find row number for node")
                        return
                    }

                    const bounds = svg.getBoundingClientRect()
                    const x = event.clientX - bounds.left
                    const y = event.clientY - bounds.top

                    // console.log(`TreeNodeCell.mouseDown(): ${event.clientX}, ${event.clientY} -> ${x}, ${y} (rect at ${x0}, ${dy}, ${rs}, ${rs})`)

                    if (x0 <= x && x <= x0 + rs && dy <= y && y <= dy + rs) {
                        this.model?.toggleAt(rowNumber)
                        plus.style.display = this.model.isOpen(rowNumber) ? "none" : ""
                    }
                }
            } else {
                // upper vertical line instead of box
                svg.appendChild(<line x1={d * sx + dx + (rs >> 1)} y1="0" x2={d * sx + dx + (rs >> 1)} y2={dy + (rs >> 1)} stroke="#000" />)
                // horizontal line to data
                svg.appendChild(<line x1={d * sx + dx + (rs >> 1)} y1={dy + (rs >> 1)} x2={d * sx + dx + rs + rx} y2={dy + (rs >> 1)} stroke="#000" />)
            }

            // the vertical lines connecting with the surrounding rows are done as background images in the <td> parent.
            // this frees us to set a vertical size to meet the boundaries of the <td>
            // as well as removing the vertical size while the table layout is recalculated
            let lines = ""
            for (let i = 0; i <= d; ++i) {
                const x = i * sx + dx + (rs >> 1)
                for (let j = row + 1; j < this.model.rowCount; ++j) {
                    if (this.model.rows[j].depth < i)
                        break
                    if (i === this.model.rows[j].depth) {
                        if (i !== d) {
                            // long line without box
                            lines += `<line x1='${x}' y1='0' x2='${x}' y2='100%' stroke='%23000' />`
                        } else {
                            if (this.model.getNext(rowinfo.node) !== undefined) {
                                // there's more below (either subtree or next sibling), draw a full line
                                lines += `<line x1='${x}' y1='0' x2='${x}' y2='100%' stroke='%23000' />`
                              }
                        }
                        break
                    }
                }
            }
            // there isn't more below, draw a line from the top to the middle
            if (this.model.getDown(rowinfo.node) === undefined || this.model.getNext(rowinfo.node) === undefined) {
                const x = d * sx + dx + (rs >> 1)
                lines += `<line x1='${x}' y1='0' x2='${x}' y2='50%' stroke='%23000' />`
            }
            
            this.parentElement.style.background = `url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'>${lines}</svg>\")`
            this.parentElement.style.backgroundRepeat = "repeat-y"
        }
        content.replaceIn(this.shadowRoot!)
    }

}

window.customElements.define("toad-treenodecell", TreeNodeCell)

export class TreeAdapter<T> extends TypedTableAdapter<TreeModel<T>> {

    override isViewCompact(): boolean { return true }

    treeCell(row: number, label: string): Element | Element[] | undefined {
        if (!this.model)
            return undefined
        return new TreeNodeCell(this.model, this.model.rows[row], label)
        // return <>
        //     <svg width="40" height="40" viewBox="0 0 40 40" style={{background: "#88f", verticalAlign: "middle"}}>
        //         <line x1="20.5" y1="0" x2="20.5" y2="40" stroke="#000" />
        //         <line x1="0" y1="20.5" x2="40" y2="20.5" stroke="#000" />
        //     </svg>
        //     <span style={{background: "#f88", verticalAlign: "middle"}}>Achtung</span>
        // </>
    }
}