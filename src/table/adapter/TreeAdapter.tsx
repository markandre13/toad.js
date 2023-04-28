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

import { TreeModel } from "../model/TreeModel"
import { TypedTableAdapter } from "./TypedTableAdapter"
import { TablePos } from "../TablePos"
import { svg, rect, line, span, text } from "@toad/util/lsx"

/**
 * @category Table Adapter
 */
export class TreeAdapter<T> extends TypedTableAdapter<TreeModel<T>> {
    constructor(model: TreeModel<T>) {
        super(model)
        this.config.seamless = true
    }

    treeCell(pos: TablePos, cell: HTMLSpanElement, label: string): void {
        this._showCell(pos, cell)
        const labelNode = span(text(label))
        labelNode.style.verticalAlign = "middle"
        labelNode.style.padding = "2px"
        cell.appendChild(labelNode)
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement): void {
        this._showCell(pos, cell)
    }
    _showCell(pos: TablePos, cell: HTMLSpanElement): void {
        if (this.model === undefined) {
            console.log("no model")
            return
        }

        const rowinfo = this.model.rows[pos.row]

        // console.log(`render tree cell ${pos.col}, ${pos.row} (${this.model.getDown(rowinfo.node) === undefined ? "leaf" : "branch"}), '${(rowinfo.node as any).label}', depth=${rowinfo.depth}`)

        const rs = 8      // rectangle width and height
        const sx = rs + 4 // horizontal step width, minimal vertical step width
        const height = sx
        const dx = 3.5    // additional step before and after drawing the rectangle
        const dy = Math.round(height / 2 - rs / 2) - 0.5       // step from top to rectangle
        const rx = 3      // horizontal line from rectangle to data on the left
        const width = rowinfo.depth * sx + sx + dx

        const svgNode = svg()
        svgNode.setAttributeNS(null, `width`, `${width}`)
        svgNode.setAttributeNS(null, `height`, `${sx}`)
        svgNode.style.verticalAlign = "middle"
        svgNode.style.background = "none"

        const d = rowinfo.depth

        // when we have children, draw a box
        if (this.model.getDown(rowinfo.node) !== undefined) {
            // TODO: port Rectangle from workflow to toad.js
            const x0 = d * sx + dx

            // box
            const box = rect(x0, dy, rs, rs, "#000", "#fff")
            box.style.cursor = "pointer"
            svgNode.appendChild(box)

            // minus
            const minus = line(x0 + (rs >> 2), dy + (rs >> 1), x0 + rs - (rs >> 2), dy + (rs >> 1), "#000")
            minus.style.cursor = "pointer"
            svgNode.appendChild(minus)

            // plus
            const plus = line(x0 + (rs >> 1), dy + (rs >> 2), x0 + (rs >> 1), dy + rs - (rs >> 2), "#000")
            plus.style.cursor = "pointer"
            plus.style.display = rowinfo.open ? "none" : ""
            svgNode.appendChild(plus)

            // horizontal line to data
            svgNode.appendChild(line(x0 + rs, dy + (rs >> 1), x0 + rs + rx, dy + (rs >> 1), "#f80"))

            svgNode.onpointerdown = (event: MouseEvent) => {
                // console.log(`TreeAdapter.pointerdown()`)
                event.preventDefault()
                event.stopPropagation()

                const rowNumber = this.model!.getRow(rowinfo.node)
                if (rowNumber === undefined) {
                    console.log("  ==> couldn't find row number for node")
                    return
                }

                const bounds = svgNode.getBoundingClientRect()
                const x = event.clientX - bounds.left
                const y = event.clientY - bounds.top

                if (x0 <= x && x <= x0 + rs && dy <= y && y <= dy + rs) {
                    // console.log(`toggle row ${rowNumber}`)
                    this.model?.toggleAt(rowNumber)
                    plus.style.display = this.model!.isOpen(rowNumber) ? "none" : ""
                }
            }
        } else {
            // upper vertical line instead of box
            svgNode.appendChild(line(d * sx + dx + (rs >> 1) - 0.5, 0, d * sx + dx + (rs >> 1), dy + (rs >> 1), "#f80"))
            // horizontal line to data
            svgNode.appendChild(line(d * sx + dx + (rs >> 1), dy + (rs >> 1), d * sx + dx + rs + rx, dy + (rs >> 1), "#f80"))
        }

        // the vertical lines connecting with the surrounding rows are done as background images in the <td> parent.
        // this frees us to set a vertical size to meet the boundaries of the <td>
        // as well as removing the vertical size while the table layout is recalculated
        let lines = ""
        for (let i = 0; i <= d; ++i) {
            const x = i * sx + dx + (rs >> 1) + 2
            for (let j = pos.row + 1; j < this.model.rowCount; ++j) {
                if (this.model.rows[j].depth < i)
                    break
                if (i === this.model.rows[j].depth) {
                    if (i !== d) {
                        // long line without box
                        lines += `<line x1='${x}' y1='0' x2='${x}' y2='100%' stroke='%23f80' />`
                    } else {
                        if (this.model.getNext(rowinfo.node) !== undefined) {
                            // there's more below (either subtree or next sibling), draw a full line
                            lines += `<line x1='${x}' y1='0' x2='${x}' y2='100%' stroke='%23f80' />`
                        }
                    }
                    break
                }
            }
        }
        // there isn't more below, draw a line from the top to the middle
        if (this.model.getDown(rowinfo.node) === undefined || this.model.getNext(rowinfo.node) === undefined) {
            const x = d * sx + dx + (rs >> 1) + 2
            lines += `<line x1='${x}' y1='0' x2='${x}' y2='${rs >> 1}' stroke='%23f80' />`
        }

        cell.style.background = `url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' style='background: %23000;'>${lines}</svg>\")`
        cell.style.backgroundRepeat = "repeat-y"

        cell.replaceChildren(svgNode)
    }
}
