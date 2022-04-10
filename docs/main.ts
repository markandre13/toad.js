/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2022 Mark-André Hopf <mhopf@mark13.org>
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

import {
    TableModel, TableAdapter, View
} from '@toad'

import { span, div, text } from '@toad/util/lsx'

export let tableStyle = document.createElement("style")
tableStyle.textContent = `
:host {
    width: 200px;
    height: 200px;

  position: relative;
  display: inline-block;
  border: 1px solid var(--tx-gray-300);
  border-radius: 3px;
  outline-offset: -2px;
  font-family: var(--tx-font-family);
  font-size: var(--tx-font-size);
  background: var(--tx-gray-50);
}

.body > span, .measure > span {
    position: absolute;
    border: solid #fff 1px;
    border-bottom: none;
    border-right: none;
    padding: 0 2px 0 2px;
    margin: 0;
}

.measure {
    position: absolute;
    opacity: 0;
}
`

// https://www.bbcelite.com/deep_dives/printing_text_tokens.html
const token = ["AL", "LE", "XE", "GE", "ZA", "CE", "BI", "SO", "US", "ES", "AR", "MA", "IN", "DI", "RE", "AÖ", "ER", "AT", "EN", "BE", "RA", "LA", "VE", "TI", "ED", "OR", "QU", "AN", "TE", "IS", "RI", "ON"]
// [0 to max[]
function random(max: number) {
    return Math.floor(Math.random() * max)
}

class MyModel extends TableModel {
    starname: string[]
    constructor() {
        super()
        this.starname = new Array(this.colCount * this.rowCount)
        for (let i = 0; i < this.starname.length; ++i) {
            let name = ""
            const l = random(5) + 1
            for (let j = 0; j < l; ++j) {
                name += token[random(token.length)]
            }
            this.starname[i] = name
        }
    }
    get colCount() {
        return 4
    }
    get rowCount() {
        return 16
    }
    get(col: number, row: number) {
        return this.starname[col + row * this.colCount]
    }
}

class MyAdapter extends TableAdapter<MyModel> {
    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.get(col, row)
        )
    }
    // getEditorCell(col: number, row: number): Node | undefined { return undefined }
}

export class Table extends View {

    model: TableModel
    adapter: TableAdapter<any>

    root: HTMLDivElement
    body: HTMLDivElement
    measure: HTMLDivElement

    cells: HTMLSpanElement[][] = []

    constructor() {
        super()
        this.arrangeAllMeasuredInGrid = this.arrangeAllMeasuredInGrid.bind(this)

        this.root = div(
            this.body = div()
        )
        this.body.classList.add("body")
        this.measure = div()
        this.measure.classList.add("measure")

        const model = new MyModel()
        this.model = model
        this.adapter = new MyAdapter(model)

        for (let row = 0; row < this.model.rowCount; ++row) {
            for (let col = 0; col < this.model.colCount; ++col) {
                const cell = this.adapter.getDisplayCell(col, row) // what about undefined & Node[] ???
                this.measure.appendChild(span(cell as Node))
            }
        }

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
        this.shadowRoot!.appendChild(this.root)
        this.shadowRoot!.appendChild(this.measure)

        setTimeout(this.arrangeAllMeasuredInGrid, 0)
    }

    arrangeAllMeasuredInGrid() {
        const colInfo = Array<number>(this.model.colCount)
        const rowInfo = Array<number>(this.model.rowCount)
        colInfo.fill(0)
        rowInfo.fill(0)

        for (let row = 0; row < this.model.rowCount; ++row) {
            let rowHeight = 0
            for (let col = 0; col < this.model.colCount; ++col) {
                const child = this.measure.children[col + row + this.model.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                rowHeight = Math.max(rowHeight, bounds.height)
            }
            rowInfo[row] = Math.ceil(rowHeight)
        }

        for (let col = 0; col < this.model.colCount; ++col) {
            let colWidth = 0
            for (let row = 0; row < this.model.rowCount; ++row) {
                const child = this.measure.children[col + row + this.model.colCount] as HTMLSpanElement
                const bounds = child.getBoundingClientRect()
                colWidth = Math.max(colWidth, bounds.width)
            }
            colInfo[col] = Math.ceil(colWidth)
        }

        let y = 0
        for (let row = 0; row < this.model.rowCount; ++row) {
            let x = 0
            for (let col = 0; col < this.model.colCount; ++col) {
                const child = this.measure.children[0] as HTMLSpanElement
                child.style.left = `${x}px`
                child.style.top = `${y}px`
                child.style.width = `${colInfo[col]}px`
                child.style.height = `${rowInfo[row]}px`
                this.body.appendChild(child)
                x += colInfo[col]
            }
            y += rowInfo[row]
        }
    }

}
Table.define("tx-table2", Table)
