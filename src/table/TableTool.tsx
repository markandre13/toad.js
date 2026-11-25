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

import { Model } from "../appkit/Model"
import { View } from "../viewkit/View"
import { GenericTool } from "../viewkit/GenericTool"
import { textAreaStyle } from "../viewkit/textAreaStyle"
import sprite from "./TableTool.svg?raw"

import { Table } from "./Table"
import { type RowEditInterface, type ColumnEditInterface } from "./model/TableModel"

// TODO: we should be able to reduce the amount of code by adding some helper functions

/**
 * @category View
 */
export class TableTool extends GenericTool<Model> {
    toolbar: HTMLDivElement
    buttonAddRowAbove: HTMLElement
    buttonAddRowBelow: HTMLElement
    buttonDeleteRow: HTMLElement

    buttonAddColumnLeft: HTMLElement
    buttonAddColumnRight: HTMLElement
    buttonDeleteColumn: HTMLElement

    buttonAddNodeAbove: HTMLElement
    buttonAddNodeBelow: HTMLElement
    buttonAddNodeParent: HTMLElement
    buttonAddNodeChild: HTMLElement
    buttonDeleteNode: HTMLElement

    lastActiveTable: Table | undefined

    constructor() {
        super()

        this.toolbar = <div class="toolbar"/> as HTMLDivElement
        this.toolbar.insertAdjacentHTML("afterbegin", sprite)

        this.buttonAddRowAbove = <button class="left" title="add row above">
            <svg style={{ display: "block" }} width="13" height="13"><use href="#add-row-above" /></svg>
        </button>as HTMLElement
        this.buttonAddRowAbove.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isRowEditInterface(model)) {
                model.insertRow(selection.row)
            }
        }
        this.toolbar.appendChild(this.buttonAddRowAbove)

        this.buttonAddRowBelow = <button title="add row below">
            <svg width="13" height="13"><use href="#add-row-below" /></svg>
        </button>as HTMLElement
        this.buttonAddRowBelow.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isRowEditInterface(model)) {
                model.insertRow(selection.row+1)
            }
        }
        this.toolbar.appendChild(this.buttonAddRowBelow)

        this.buttonDeleteRow = <button class="right" title="delete row">
            <svg width="13" height="13"><use href="#delete-row" /></svg>
        </button>as HTMLElement
        this.buttonDeleteRow.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isRowEditInterface(model)) {
                model.removeRow(selection.row, 1)
            }
        }
        this.toolbar.appendChild(this.buttonDeleteRow)

        this.toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddColumnLeft = <button class="left" title="add column left">
            <svg width="13" height="13"><use href="#add-column-left" /></svg>
        </button> as HTMLElement
        this.buttonAddColumnLeft.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isColumnEditInterface(model)) {
                model.insertColumn(selection.col)
            }
        }
        this.toolbar.appendChild(this.buttonAddColumnLeft)

        this.buttonAddColumnRight = <button title="add column right">
            <svg width="13" height="13"><use href="#add-column-right" /></svg>
        </button> as HTMLElement
        this.buttonAddColumnRight.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isColumnEditInterface(model)) {
                model.insertColumn(selection.col+1)
            }
        }
        this.toolbar.appendChild(this.buttonAddColumnRight)

        this.buttonDeleteColumn = <button class="right" title="delete column">
            <svg width="13" height="13"><use href="#delete-column" /></svg>
        </button> as HTMLElement
        this.buttonDeleteColumn.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && isColumnEditInterface(model)) {
                model.removeColumn(selection.col, 1)
            }
        }
        this.toolbar.appendChild(this.buttonDeleteColumn)

        this.toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddNodeAbove = <button class="left" title="add node above">
            <svg style={{ display: "block", border: "none" }} width="8" height="17"><use href="#add-node-above" /></svg>
        </button> as HTMLElement
        // this.buttonAddNodeAbove.onclick = () => {
        //     document.execCommand("bold", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeAbove)

        this.buttonAddNodeBelow = <button title="add node below">
            <svg style={{ display: "block", border: "none" }} width="8" height="17"><use href="#add-node-below" /></svg>
        </button> as HTMLElement
        // this.buttonAddNodeBelow.onclick = () => {
        //     document.execCommand("italic", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeBelow)

        this.buttonAddNodeParent = <button title="add node parent">
            <svg width="13" height="17"><use href="#add-node-parent" /></svg>
        </button> as HTMLElement
        this.buttonAddNodeParent.onclick = () => {
            // document.execCommand("underline", false)
            // this.update()
        }
        this.toolbar.appendChild(this.buttonAddNodeParent)

        this.buttonAddNodeChild = <button title="add node child">
            <svg width="13" height="17"><use href="#add-node-child" /></svg>
        </button> as HTMLElement
        // this.buttonAddNodeChild.onclick = () => {
        //     document.execCommand("strikeThrough", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeChild)

        this.buttonDeleteNode = <button class="right" title="delete node">
            <svg width="10" height="17"><use href="#delete-node" /></svg>
        </button> as HTMLElement
        // this.buttonDeleteNode.onclick = () => {
        //     document.execCommand("subscript", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonDeleteNode)

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [textAreaStyle]
        this.shadowRoot!.appendChild(this.toolbar)
    }

    canHandle(view: View): boolean {
        return view instanceof Table
    }
    activate(): void {
        this.lastActiveTable = GenericTool.activeView as Table
        this.toolbar.classList.add("active")
    }
    deactivate(): void {
        this.lastActiveTable = undefined
        this.toolbar.classList.remove("active")
    }

    // update() {
    //     this.buttonAddRowAbove.classList.toggle("active", document.queryCommandValue("formatBlock") === "h1")
    //     this.buttonAddRowBelow.classList.toggle("active", document.queryCommandValue("formatBlock") === "h2")
    //     this.buttonDeleteRow.classList.toggle("active", document.queryCommandValue("formatBlock") === "h3")
    //     this.buttonAddColumnLeft.classList.toggle("active", document.queryCommandValue("formatBlock") === "h4")

    //     this.buttonAddNodeAbove.classList.toggle("active", document.queryCommandState("bold"))
    //     this.buttonAddNodeBelow.classList.toggle("active", document.queryCommandState("italic"))
    //     this.buttonAddNodeParent.classList.toggle("active", document.queryCommandState("underline"))
    //     this.buttonAddNodeChild.classList.toggle("active", document.queryCommandState("strikeThrough"))
    //     this.buttonDeleteNode.classList.toggle("active", document.queryCommandState("subscript"))
    //     this.buttonSuperscript.classList.toggle("active", document.queryCommandState("superscript"))

    //     this.buttonJustifyLeft.classList.toggle("active", document.queryCommandState("justifyLeft"))
    //     this.buttonJustifyCenter.classList.toggle("active", document.queryCommandState("justifyCenter"))
    //     this.buttonJustifyRight.classList.toggle("active", document.queryCommandState("justifyRight"))
    //     //        this.buttonJustifyFull.classList.toggle("active", document.queryCommandState("justifyFull"))
    // }
}
View.define("tx-tabletool", TableTool)

function isRowEditInterface(model: any): model is RowEditInterface {
    return model !== undefined && 'insertRow' in model && "removeRow" in model
}

function isColumnEditInterface(model: any): model is ColumnEditInterface {
    return model !== undefined && 'insertColumn' in model && "removeColumn" in model
}
