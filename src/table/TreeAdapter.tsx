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

import * as toadJSX from '../util/jsx'
import bind from 'bind-decorator'

import { TreeModel } from "./TreeModel"
import { TypedTableAdapter } from "./TypedTableAdapter"
import { View } from '../view/View'
import { Model } from '../model/Model'
import { RowInfo } from './TreeModel'

export class TreeNodeCell<T> extends View {
    // for chromium, the recommendation is to go with a single resize observer
    // static resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
    //     for(const e of entries) {
    //         const c = e.target as TreeNodeCell<any>
    //         c.paint()
    //         TreeNodeCell.resizeObserver.unobserve(c.parentElement!)
    //     }
    // })
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
        // console.log(`TreeNodeCell<T>.connected(): parent=${this.parentElement}`)
        // TreeNodeCell.resizeObserver.observe(this.parentElement!, { box: 'content-box' })
        super.connectedCallback()
        this.paint()

        // paint again to accomodate for the label size
        // FIXME: this doesn't work when any other element in the row changes it's size
        setTimeout( () => {
            this.paint()
        }, 0)
    }

    override disconnectedCallback() {
        // TreeNodeCell.resizeObserver.unobserve(this.parentElement!)
        super.disconnectedCallback()
    }

    paint() {
        if (!this.shadowRoot)
            return
        if (!this.parentElement)
            return

        const row = this.model.getRow(this.rowinfo.node)!
        if (row === undefined)
            return

        // FIXME: this is a hack relying on paint being called twice
        //        reason is that this.parentElement.clientHeight some can be a pixel smaller than the span,
        //        causing a pixel missing where the tree node cells should connect to each other
        //        can be seen when span has no padding and contains a text node
        let spanHeight = 0
        if (this.shadowRoot.childElementCount > 0) {
            const s = this.shadowRoot.children[1] as HTMLElement
            spanHeight = s.offsetHeight
        }

        const rs = 8      // rectangle width and height
        const sx = rs + 4     // horizontal step width, minimal vertical step width
        const height = Math.max(
            this.parentElement.clientHeight,
            spanHeight,
            sx)
        const dx = 3.5    // additional step before and after drawing the rectangle
        const dy = Math.round(height / 2 - rs / 2) - 0.5       // step from top to rectangle
        const rx = 3      // horizontal line from rectangle to data on the left
        const width = this.rowinfo.depth * sx + sx + dx
        const height2 = height

        // console.log(`label: ${this.label}: height=${height}`)

        const content: toadJSX.Fragment = <>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{
                verticalAlign: "middle",
                // background: "#88f",
            }} />
            <span style={{
                verticalAlign: "middle",
                padding: "2px",
                // background: "#f88",
            }}>{this.label}</span>
        </>
        const svg = content[0] as SVGElement

        const rowinfo = this.rowinfo
        const d = rowinfo.depth

        if (this.model.getDown(rowinfo.node)) {
            // TODO: port Rectangle from workflow to toad.js
            const x0 = d * sx + dx

            // box
            const box = <rect x={d * sx + dx} y={dy} width={rs} height={rs} stroke="#000" fill="#fff" cursor="pointer" />
            svg.appendChild(box)

            // minus
            svg.appendChild(<line x1={d * sx + dx + (rs >> 2)} y1={dy + (rs >> 1)} x2={d * sx + dx + rs - (rs >> 2)} y2={dy + (rs >> 1)} stroke="#000" cursor="pointer" />)

            const plus = <line x1={d * sx + dx + (rs >> 1)} y1={dy + (rs >> 2)} x2={d * sx + dx + (rs >> 1)} y2={dy + rs - (rs >> 2)} stroke="#000" cursor="pointer" />
            plus.style.display = rowinfo.open ? "none" : ""
            svg.appendChild(plus)

            // horizontal line to data
            svg.appendChild(<line x1={d * sx + dx + rs} y1={dy + (rs >> 1)} x2={d * sx + dx + rs + rx} y2={dy + (rs >> 1)} stroke="#000" />)

            svg.onmousedown = (event: MouseEvent) => {
                event.preventDefault()
                if (this.model === undefined) {
                    console.log("  ==> no model")
                    return
                }

                const rowNumber = row // this.model.getRow(rowinfo.node)
                if (rowNumber === undefined) {
                    console.log("  ==> couldn't find row number for node")
                    return
                }

                const bounds = svg.getBoundingClientRect()
                const x = event.clientX - bounds.left
                const y = event.clientY - bounds.top
                if (x0 <= x && x <= x0 + rs && dy <= y && y <= dy + rs) {
                    this.model?.toggleAt(rowNumber) // TODO: this row number varies!!!
                    // console.log(`toggled row ${row} to ${this.model!.isOpen(row)}`)
                    plus.style.display = this.model.isOpen(rowNumber) ? "none" : ""
                    event.stopPropagation()
                }
            }
        } else {
            // upper vertical line instead of box
            svg.appendChild(<line x1={d * sx + dx + (rs >> 1)} y1={dy} x2={d * sx + dx + (rs >> 1)} y2={dy + (rs >> 1)} stroke="#000" />)
            // horizontal line to data
            svg.appendChild(<line x1={d * sx + dx + (rs >> 1)} y1={dy + (rs >> 1)} x2={d * sx + dx + rs + rx} y2={dy + (rs >> 1)} stroke="#000" />)
        }

        // small line above box
        svg.appendChild(<line x1={d * sx + dx + (rs >> 1)} y1={0} x2={d * sx + dx + (rs >> 1)} y2={dy} stroke="#000" />)

        // lines connecting nodes
        // console.log(`render tree graphic for row ${row} at depth ${d}`)
        for (let i = 0; i <= d; ++i) {
            // console.log(`check row ${row}, depth ${i}`)
            for (let j = row + 1; j < this.model.rowCount; ++j) {
                if (this.model.rows[j].depth < i)
                    break
                if (i === this.model.rows[j].depth) {
                    if (i !== d) {
                        // long line without box
                        svg.appendChild(<line x1={i * sx + dx + (rs >> 1)} y1={0} x2={i * sx + dx + (rs >> 1)} y2={height2} stroke="#000" />)
                    } else {
                        // small line below box
                        if (this.model.getDown(rowinfo.node) !== undefined) {
                            // has subtree => start below box
                            svg.appendChild(<line x1={i * sx + dx + (rs >> 1)} y1={dy + rs} x2={i * sx + dx + (rs >> 1)} y2={height2} stroke="#000" />)
                        } else {
                            // has no subtree => has no box => don't start below box
                            svg.appendChild(<line x1={i * sx + dx + (rs >> 1)} y1={dy + (rs >> 1)} x2={i * sx + dx + (rs >> 1)} y2={height2} stroke="#000" />)
                        }
                    }
                    break
                }
            }
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