/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
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

import { Model } from "../model/Model"
import { GenericView } from "../view/GenericView"
import { textAreaStyle } from "../view/textAreaStyle"

import { TableView } from "./TableView"
import { ArrayTableModel } from "./ArrayTableModel"

// TODO: we should be able to reduce the amount of code by adding some helper functions

export class TableTool extends GenericView<Model> {
    // FIXME: make this a list where all texttools register/unregister via connectedCallback()/disconnectedCallback()
    // FIXME: disable texttool when it is not above an active textarea in the view hierachy
    static tabletool?: TableTool

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

    constructor() {
        super()

        TableTool.tabletool = this

        let toolbar = document.createElement("div")
        toolbar.classList.add("toolbar")

        this.buttonAddRowAbove = document.createElement("button")
        this.buttonAddRowAbove.title = "add row above"
        this.buttonAddRowAbove.classList.add("left")
        this.buttonAddRowAbove.innerHTML = this.buttonAddRowAbove.innerHTML = `<svg style="display: block;" viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="0.5" y1="8.5" x2="12.5" y2="8.5" stroke="#000"/>
            <line x1="4.5" y1="8.5" x2="4.5" y2="13.5" stroke="#000"/>
            <line x1="8.5" y1="8.5" x2="8.5" y2="13.5" stroke="#000"/>
            <line x1="6.5" y1="2" x2="6.5" y2="7" stroke="#000"/>
            <line x1="4" y1="4.5" x2="9" y2="4.5" stroke="#000"/>
        </svg>`
        this.buttonAddRowAbove.onclick = () => {
            const model = TableView.lastActiveTable?.model
            const selection = TableView.lastActiveTable?.selectionModel
            if (selection && model && model instanceof ArrayTableModel) {
                model.addRowAbove(selection.row) // table selectionmodel provides the row?
            }
        }
        toolbar.appendChild(this.buttonAddRowAbove)

        this.buttonAddRowBelow = document.createElement("button")
        this.buttonAddRowBelow.title = "add row below"
        this.buttonAddRowBelow.innerHTML = `<svg viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="0.5" y1="4.5" x2="12.5" y2="4.5" stroke="#000"/>
            <line x1="4.5" y1="0.5" x2="4.5" y2="4.5" stroke="#000"/>
            <line x1="8.5" y1="0.5" x2="8.5" y2="4.5" stroke="#000"/>
            <line x1="6.5" y1="6" x2="6.5" y2="11" stroke="#000"/>
            <line x1="4" y1="8.5" x2="9" y2="8.5" stroke="#000"/>
        </svg>`
        // this.buttonAddRowBelow.onclick = () => {
        //     document.execCommand("formatBlock", false, "<h2>")
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddRowBelow)

        this.buttonDeleteRow = document.createElement("button")
        this.buttonDeleteRow.title = "delete row"
        this.buttonDeleteRow.classList.add("right")
        this.buttonDeleteRow.innerHTML = `<svg viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="0.5" y1="4.5" x2="12.5" y2="4.5" stroke="#000"/>
            <line x1="0.5" y1="8.5" x2="12.5" y2="8.5" stroke="#000"/>
            <line x1="5.5" y1="3.5" x2="11.5" y2="9.5" stroke="#000" stroke-width="1.5"/>
            <line x1="11.5" y1="3.5" x2="5.5" y2="9.5" stroke="#000" stroke-width="1.5"/>
        </svg>`
        this.buttonDeleteRow.onclick = () => {
            const model = TableView.lastActiveTable?.model
            const selection = TableView.lastActiveTable?.selectionModel
            if (selection && model && model instanceof ArrayTableModel) {
                model.deleteRow(selection.row)
            }
        }
        toolbar.appendChild(this.buttonDeleteRow)

        toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddColumnLeft = document.createElement("button")
        this.buttonAddColumnLeft.title = "add column left"
        this.buttonAddColumnLeft.classList.add("left")
        this.buttonAddColumnLeft.innerHTML = `<svg viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="8.5" y1="0.5" x2="8.5" y2="12.5" stroke="#000"/>
            <line x1="8.5" y1="4.5" x2="12.5" y2="4.5" stroke="#000"/>
            <line x1="8.5" y1="8.5" x2="12.5" y2="8.5" stroke="#000"/>
            <line x1="2" y1="6.5" x2="7" y2="6.5" stroke="#000"/>
            <line x1="4.5" y1="4" x2="4.5" y2="9" stroke="#000"/>
        </svg>`
        // this.buttonAddColumnLeft.onclick = () => {
        //     document.execCommand("formatBlock", false, "<h4>")
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddColumnLeft)

        this.buttonAddColumnRight = document.createElement("button")
        this.buttonAddColumnRight.title = "add column right"
        this.buttonAddColumnRight.innerHTML = `<svg viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="4.5" y1="0.5" x2="4.5" y2="12.5" stroke="#000"/>
            <line x1="0.5" y1="4.5" x2="4.5" y2="4.5" stroke="#000"/>
            <line x1="0.5" y1="8.5" x2="4.5" y2="8.5" stroke="#000"/>
            <line x1="6" y1="6.5" x2="11" y2="6.5" stroke="#000"/>
            <line x1="8.5" y1="4" x2="8.5" y2="9" stroke="#000"/>
        </svg>`
        // this.buttonAddColumnRight.onclick = (event) => {
        //     document.execCommand("insertUnorderedList", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddColumnRight)

        this.buttonDeleteColumn = document.createElement("button")
        this.buttonDeleteColumn.title = "delete column"
        this.buttonDeleteColumn.classList.add("right")
        this.buttonDeleteColumn.innerHTML = `<svg viewBox="0 0 13 13" width="13" height="13">
            <rect x="0.5" y="0.5" width="12" height="12" stroke="#000" fill="#fff"/>
            <line x1="4.5" y1="0.5" x2="4.5" y2="12.5" stroke="#000"/>
            <line x1="8.5" y1="0.5" x2="8.5" y2="12.5" stroke="#000"/>
            <line x1="3.5" y1="5.5" x2="9.5" y2="11.5" stroke="#000" stroke-width="1.5"/>
            <line x1="3.5" y1="11.5" x2="9.5" y2="5.5" stroke="#000" stroke-width="1.5"/>
        </svg>`
        // this.buttonDeleteColumn.onclick = () => {
        //     document.execCommand("insertOrderedList", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonDeleteColumn)

        toolbar.appendChild(document.createTextNode(" "))

        this.buttonAddNodeAbove = document.createElement("button")
        this.buttonAddNodeAbove.classList.add("left")
        this.buttonAddNodeAbove.innerHTML = `<svg style="display: block; border: none;" viewBox="0 0 8 17" width="8" height="17">
            <rect x="0.5" y="1.5" width="6" height="6" stroke="#000" fill="#fff"/>
            <rect x="0.5" y="9.5" width="6" height="6" stroke="#000" fill="#000"/>
            <line x1="3.5" y1="3" x2="3.5" y2="6" stroke="#000"/>
            <line x1="2" y1="4.5" x2="5" y2="4.5" stroke="#000"/>
            <line x1="3.5" y1="0" x2="3.5" y2="1" stroke="#000"/>
            <line x1="3.5" y1="8" x2="3.5" y2="17" stroke="#000"/>
        </svg>`
        // this.buttonAddNodeAbove.onclick = () => {
        //     document.execCommand("bold", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddNodeAbove)

        this.buttonAddNodeBelow = document.createElement("button")
        this.buttonAddNodeBelow.innerHTML = `<svg style="display: block; border: none;" viewBox="0 0 8 17" width="8" height="17">
            <rect x="0.5" y="1.5" width="6" height="6" stroke="#000" fill="#000"/>
            <rect x="0.5" y="9.5" width="6" height="6" stroke="#000" fill="#fff"/>
            <line x1="3.5" y1="11" x2="3.5" y2="14" stroke="#000"/>
            <line x1="2" y1="12.5" x2="5" y2="12.5" stroke="#000"/>     
            <line x1="3.5" y1="0" x2="3.5" y2="9" stroke="#000"/>      
            <line x1="3.5" y1="16" x2="3.5" y2="17" stroke="#000"/>
        </svg>`
        // this.buttonAddNodeBelow.onclick = () => {
        //     document.execCommand("italic", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddNodeBelow)

        this.buttonAddNodeParent = document.createElement("button")
        this.buttonAddNodeParent.innerHTML = `<svg viewBox="0 0 13 17" width="13" height="17">
            <rect x="0.5" y="1.5" width="6" height="6" stroke="#000" fill="#fff"/>
            <rect x="6.5" y="9.5" width="6" height="6" stroke="#000" fill="#000"/>
            <line x1="7" y1="4.5" x2="10" y2="4.5" stroke="#000"/>
            <line x1="9.5" y1="4" x2="9.5" y2="9" stroke="#000"/>
            <line x1="3.5" y1="3" x2="3.5" y2="6" stroke="#000"/>
            <line x1="2" y1="4.5" x2="5" y2="4.5" stroke="#000"/>
            <line x1="3.5" y1="0" x2="3.5" y2="1" stroke="#000"/>
            <line x1="3.5" y1="8" x2="3.5" y2="17" stroke="#000"/>
        </svg>`
        this.buttonAddNodeParent.onclick = () => {
            // document.execCommand("underline", false)
            // this.update()
        }
        toolbar.appendChild(this.buttonAddNodeParent)

        this.buttonAddNodeChild = document.createElement("button")
        this.buttonAddNodeChild.innerHTML = `<svg viewBox="0 0 13 17" width="13" height="17">
            <rect x="0.5" y="1.5" width="6" height="6" stroke="#000" fill="#000"/>
            <rect x="6.5" y="9.5" width="6" height="6" stroke="#000" fill="#fff"/>
            <line x1="7" y1="4.5" x2="10" y2="4.5" stroke="#000"/>
            <line x1="9.5" y1="4" x2="9.5" y2="9" stroke="#000"/>
            <line x1="9.5" y1="11" x2="9.5" y2="14" stroke="#000"/>
            <line x1="8" y1="12.5" x2="11" y2="12.5" stroke="#000"/>    
            <line x1="3.5" y1="0" x2="3.5" y2="17" stroke="#000"/>
        </svg>`
        // this.buttonAddNodeChild.onclick = () => {
        //     document.execCommand("strikeThrough", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonAddNodeChild)

        this.buttonDeleteNode = document.createElement("button")
        this.buttonDeleteNode.classList.add("right")
        this.buttonDeleteNode.innerHTML = `<svg viewBox="0 0 10 17" width="10" height="17">
            <rect x="1.5" y="5.5" width="6" height="6" stroke="#000" fill="#fff"/>
            <line x1="4.5" y1="2" x2="4.5" y2="5" stroke="#000"/>
            <line x1="4.5" y1="12" x2="4.5" y2="15" stroke="#000"/>
            <line x1="0.5" y1="4.5" x2="8.5" y2="12.5" stroke="#000" stroke-width="1.5"/>
            <line x1="8.5" y1="4.5" x2="0.5" y2="12.5" stroke="#000" stroke-width="1.5"/>
        </svg>`
        // this.buttonDeleteNode.onclick = () => {
        //     document.execCommand("subscript", false)
        //     this.update()
        // }
        toolbar.appendChild(this.buttonDeleteNode)

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(textAreaStyle, true))
        this.shadowRoot!.appendChild(toolbar)
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

    updateModel() {
        if (this.model) {
        }
    }

    updateView() {
        if (!this.model) {
            return
        }
    }
}
window.customElements.define("toad-tabletool", TableTool)
