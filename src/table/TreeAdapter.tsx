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
    resizeObserver!: ResizeObserver
    model: TreeModel<T>
    rowinfo: RowInfo<T>
    constructor(model: TreeModel<T>, rowinfo: RowInfo<T>) {
        super()
        this.attachShadow({ mode: 'open' })
        this.model = model
        this.rowinfo = rowinfo

        // // for chromium, the recommendation is to go with a single resize observer
        this.resizeObserver = new ResizeObserver(entries => {
            // console.log(`TreeNodeCell<T>.parent.resize(): ${this.parentElement!.clientHeight}`)
            this.paint()
        })
        // this.onclick = this.handleClick
        // this.onresize = this.handleResize
    }

    setModel(model: Model) { }

    override connectedCallback() {
        // console.log(`TreeNodeCell<T>.connected(): parent=${this.parentElement}`)
        this.paint()
        this.resizeObserver.observe(this.parentElement!, { box: 'content-box' })
        super.connectedCallback()
    }

    override disconnectedCallback() {
        this.resizeObserver.disconnect()
        super.disconnectedCallback()
    }

    // attributeChangedCallback(name: string, oldValue?: string, newValue?: string) {
    //     console.log(`attribute ${name} changed`)
    // }
    // @bind handleClick(event: MouseEvent) {
    //     console.log(event)
    // }
    // @bind handleResize(event: UIEvent) {
    //     console.log(event)
    // }
    paint() {
        if (!this.shadowRoot)
            return

        const row = this.model.getRow(this.rowinfo.node)
        if (row === undefined)
            return

        if (!this.parentElement)
            return

        // const item_h = Math.max(this.parentElement.clientHeight, 10) - 3 // height of row
        const height = this.parentElement.clientHeight
        
        const rs = 8      // rectangle width and height
        const sx = 12     // horizontal step width
        const dx = 3.5    // additional step before and after drawing the rectangle
        const dy = Math.round(height / 2) + 0.5 - rs / 2      // step from top to rectangle
        const rx = 3      // horizontal line from rectangle to data on the left

        const width = this.rowinfo.depth * sx + sx + dx
        const height2 = height + 2

        // if (item_h === 0)
        //     return

        // if (this.shadowRoot.childElementCount !== 0)
        //     return

        // console.log(`TreeNodeCell<T> of height ${item_h}`)

        this.style.display = "inline-block"
        this.style.border = "none"
        // this.style.background = "#f80"
        this.style.height = `${height}px`
        this.style.width = `${width}px`

        const svg = <svg
            style={{ 
                display: "inline-block",
                // background: "#f00",
                border: "none",
                padding: "0",
                margin: "0"
            }}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`} /> as SVGElement

        const rowinfo = this.rowinfo
        const d = rowinfo.depth

        // svg.appendChild(<text x={d * sx + dx + sx + 5} y={dy + 8} fill="#000">{label}</text>)

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

        if (this.shadowRoot.children.length === 0) {
            this.shadowRoot.appendChild(svg)
        } else {
            this.shadowRoot.removeChild(this.shadowRoot.children[0])
            this.shadowRoot.appendChild(svg)
            // this.replaceChild(svg, this.shadowRoot.children[0])
        }
    }
}

window.customElements.define("toad-treenodecell", TreeNodeCell)

export class TreeAdapter<T> extends TypedTableAdapter<TreeModel<T>> {

    override isViewCompact(): boolean { return true }

    treeCell(row: number, label: string): Element | undefined {
        if (!this.model)
            return undefined
        return new TreeNodeCell(this.model, this.model.rows[row])
    }
}