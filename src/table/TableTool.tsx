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

import { Model } from "../model/Model"
import { View } from "../view/View"
import { GenericTool } from "../view/GenericTool"
import { textAreaStyle } from "../view/textAreaStyle"

import { Table } from "./Table"
import { ArrayTableModel } from "./model/ArrayTableModel"

// TODO: we should be able to reduce the amount of code by adding some helper functions

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

        this.toolbar = <div class="toolbar"/>

        this.buttonAddRowAbove = <button class="left" title="add row above">
            <svg style={{ display: "block" }} viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="0.5" y1="8.5" x2="12.5" y2="8.5" class="stroke" />
                <line x1="4.5" y1="8.5" x2="4.5" y2="13.5" class="stroke" />
                <line x1="8.5" y1="8.5" x2="8.5" y2="13.5" class="stroke" />
                <line x1="6.5" y1="2" x2="6.5" y2="7" class="stroke" />
                <line x1="4" y1="4.5" x2="9" y2="4.5" class="stroke" />
            </svg>
        </button>
        this.buttonAddRowAbove.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && model && model instanceof ArrayTableModel) {
                model.insertRow(selection.row)
            }
        }
        this.toolbar.appendChild(this.buttonAddRowAbove)

        this.buttonAddRowBelow = <button title="add row below">
            <svg viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="0.5" y1="4.5" x2="12.5" y2="4.5" class="stroke" />
                <line x1="4.5" y1="0.5" x2="4.5" y2="4.5" class="stroke" />
                <line x1="8.5" y1="0.5" x2="8.5" y2="4.5" class="stroke" />
                <line x1="6.5" y1="6" x2="6.5" y2="11" class="stroke" />
                <line x1="4" y1="8.5" x2="9" y2="8.5" class="stroke" />
            </svg>
        </button>
        this.buttonAddRowBelow.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && model && model instanceof ArrayTableModel) {
                model.insertRow(selection.row+1)
            }
        }
        this.toolbar.appendChild(this.buttonAddRowBelow)

        this.buttonDeleteRow = <button class="right" title="delete row">
            <svg viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="0.5" y1="4.5" x2="12.5" y2="4.5" class="stroke" />
                <line x1="0.5" y1="8.5" x2="12.5" y2="8.5" class="stroke" />
                <line x1="5.5" y1="3.5" x2="11.5" y2="9.5" class="stroke" stroke-width="1.5" />
                <line x1="11.5" y1="3.5" x2="5.5" y2="9.5" class="stroke" stroke-width="1.5" />
            </svg>
        </button>
        this.buttonDeleteRow.onclick = () => {
            this.lastActiveTable?.focus()
            const model = this.lastActiveTable?.model
            const selection = this.lastActiveTable?.selection
            if (selection && model && model instanceof ArrayTableModel) {
                model.removeRow(selection.row)
            }
        }
        this.toolbar.appendChild(this.buttonDeleteRow)

        this.toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddColumnLeft = <button class="left" title="add column left">
            <svg viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="8.5" y1="0.5" x2="8.5" y2="12.5" class="stroke" />
                <line x1="8.5" y1="4.5" x2="12.5" y2="4.5" class="stroke" />
                <line x1="8.5" y1="8.5" x2="12.5" y2="8.5" class="stroke" />
                <line x1="2" y1="6.5" x2="7" y2="6.5" class="stroke" />
                <line x1="4.5" y1="4" x2="4.5" y2="9" class="stroke" />
            </svg>
        </button>
        this.toolbar.appendChild(this.buttonAddColumnLeft)

        this.buttonAddColumnRight = <button title="add column right">
            <svg viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="4.5" y1="0.5" x2="4.5" y2="12.5" class="stroke" />
                <line x1="0.5" y1="4.5" x2="4.5" y2="4.5" class="stroke" />
                <line x1="0.5" y1="8.5" x2="4.5" y2="8.5" class="stroke" />
                <line x1="6" y1="6.5" x2="11" y2="6.5" class="stroke" />
                <line x1="8.5" y1="4" x2="8.5" y2="9" class="stroke" />
            </svg>
        </button>
        // this.buttonAddColumnRight.onclick = (event) => {
        //     document.execCommand("insertUnorderedList", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddColumnRight)

        this.buttonDeleteColumn = <button class="right" title="delete column">
            <svg viewBox="0 0 13 13" width="13" height="13">
                <rect x="0.5" y="0.5" width="12" height="12" class="strokeFill" />
                <line x1="4.5" y1="0.5" x2="4.5" y2="12.5" class="stroke" />
                <line x1="8.5" y1="0.5" x2="8.5" y2="12.5" class="stroke" />
                <line x1="3.5" y1="5.5" x2="9.5" y2="11.5" class="stroke" stroke-width="1.5" />
                <line x1="3.5" y1="11.5" x2="9.5" y2="5.5" class="stroke" stroke-width="1.5" />
            </svg>
        </button>
        // this.buttonDeleteColumn.onclick = () => {
        //     document.execCommand("insertOrderedList", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonDeleteColumn)

        this.toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddNodeAbove = <button class="left" title="add node above">
            <svg style={{ display: "block", border: "none" }} viewBox="0 0 8 17" width="8" height="17">
                <rect x="0.5" y="1.5" width="6" height="6" class="strokeFill" />
                <rect x="0.5" y="9.5" width="6" height="6" class="fill" />
                <line x1="3.5" y1="3" x2="3.5" y2="6" class="stroke" />
                <line x1="2" y1="4.5" x2="5" y2="4.5" class="stroke" />
                <line x1="3.5" y1="0" x2="3.5" y2="1" class="stroke" />
                <line x1="3.5" y1="8" x2="3.5" y2="17" class="stroke" />
            </svg>
        </button>
        // this.buttonAddNodeAbove.onclick = () => {
        //     document.execCommand("bold", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeAbove)

        this.buttonAddNodeBelow = <button title="add node below">
            <svg style={{ display: "block", border: "none" }} viewBox="0 0 8 17" width="8" height="17">
                <rect x="0.5" y="1.5" width="6" height="6" class="fill" />
                <rect x="0.5" y="9.5" width="6" height="6" class="strokeFill" />
                <line x1="3.5" y1="11" x2="3.5" y2="14" class="stroke" />
                <line x1="2" y1="12.5" x2="5" y2="12.5" class="stroke" />
                <line x1="3.5" y1="0" x2="3.5" y2="9" class="stroke" />
                <line x1="3.5" y1="16" x2="3.5" y2="17" class="stroke" />
            </svg>
        </button>
        // this.buttonAddNodeBelow.onclick = () => {
        //     document.execCommand("italic", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeBelow)

        this.buttonAddNodeParent = <button title="add node parent">
            <svg viewBox="0 0 13 17" width="13" height="17">
                <rect x="0.5" y="1.5" width="6" height="6" class="strokeFill" />
                <rect x="6.5" y="9.5" width="6" height="6" class="fill" />
                <line x1="7" y1="4.5" x2="10" y2="4.5" class="stroke" />
                <line x1="9.5" y1="4" x2="9.5" y2="9" class="stroke" />
                <line x1="3.5" y1="3" x2="3.5" y2="6" class="stroke" />
                <line x1="2" y1="4.5" x2="5" y2="4.5" class="stroke" />
                <line x1="3.5" y1="0" x2="3.5" y2="1" class="stroke" />
                <line x1="3.5" y1="8" x2="3.5" y2="17" class="stroke" />
            </svg>
        </button>
        this.buttonAddNodeParent.onclick = () => {
            // document.execCommand("underline", false)
            // this.update()
        }
        this.toolbar.appendChild(this.buttonAddNodeParent)

        this.buttonAddNodeChild = <button title="add node child">
            <svg viewBox="0 0 13 17" width="13" height="17">
                <rect x="0.5" y="1.5" width="6" height="6" class="fill" />
                <rect x="6.5" y="9.5" width="6" height="6" class="strokeFill" />
                <line x1="7" y1="4.5" x2="10" y2="4.5" class="stroke" />
                <line x1="9.5" y1="4" x2="9.5" y2="9" class="stroke" />
                <line x1="9.5" y1="11" x2="9.5" y2="14" class="stroke" />
                <line x1="8" y1="12.5" x2="11" y2="12.5" class="stroke" />
                <line x1="3.5" y1="0" x2="3.5" y2="17" class="stroke" />
            </svg>
        </button>
        // this.buttonAddNodeChild.onclick = () => {
        //     document.execCommand("strikeThrough", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonAddNodeChild)

        this.buttonDeleteNode = <button class="right" title="delete node">
            <svg viewBox="0 0 10 17" width="10" height="17">
                <rect x="1.5" y="5.5" width="6" height="6" class="strokeFill" />
                <line x1="4.5" y1="2" x2="4.5" y2="5" class="stroke" />
                <line x1="4.5" y1="12" x2="4.5" y2="15" class="stroke" />
                <line x1="0.5" y1="4.5" x2="8.5" y2="12.5" class="stroke" stroke-width="1.5" />
                <line x1="8.5" y1="4.5" x2="0.5" y2="12.5" class="stroke" stroke-width="1.5" />
            </svg>
        </button>
        // this.buttonDeleteNode.onclick = () => {
        //     document.execCommand("subscript", false)
        //     this.update()
        // }
        this.toolbar.appendChild(this.buttonDeleteNode)

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(textAreaStyle, true))
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