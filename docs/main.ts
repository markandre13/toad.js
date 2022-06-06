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

/* the need to do the following is... not cool */
import { Select } from "@toad/view/Select"
Select
import { Text } from "@toad/view/Text"
Text
import { Menu } from "@toad/menu/Menu"
Menu
import { TextArea } from "@toad/view/TextArea"
TextArea
import { TextTool } from "@toad/view/TextTool"
TextTool
import { TableTool } from "@toad/table/TableTool"
TableTool
import { Button } from "@toad/view/Button"
Button
import { RadioButton } from "@toad/view/RadioButton"
RadioButton
import { Checkbox } from "@toad/view/Checkbox"
Checkbox
import { Tab } from "@toad/view/Tab"
Tab
import { Table } from "@toad/table/Table"
Table
import { Slider } from "@toad/view/Slider"
Slider
import { Switch } from "@toad/view/Switch"
Switch
import { ToadIf } from "@toad/view/ToadIf"
ToadIf

import { TextModel } from "@toad/model/TextModel"
import { HtmlModel } from "@toad/model/HtmlModel"
import { BooleanModel } from "@toad/model/BooleanModel"
import { NumberModel } from "@toad/model/NumberModel"
import { EnumModel } from "@toad/model/EnumModel"

import { TablePos } from "@toad/table/TablePos"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { TreeNode } from "@toad/table/model/TreeNode"
import { TreeNodeModel } from "@toad/table/model/TreeNodeModel"
import { TreeAdapter } from "@toad/table/adapter/TreeAdapter"

import { bindModel as bind, action } from "@toad/controller/globalController"
import { Template } from "@toad/controller/Template"

import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'

import { span, text } from "@toad/util/lsx"

import { initializeSodaMachine } from "./src/sodamachine"
import { initializeStarSystem } from "./src/starsystem"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

window.onload = () => {
    document.head.appendChild(txBase)
    document.head.appendChild(txStatic)
    document.head.appendChild(txDark)
    main()
}

export function main(): void {
    initializeSodaMachine()
    // initializeBooks()
    initializeStarSystem()
    initializeTree()
}

//
// <tx-text>
//

let textModel = new TextModel("")
bind("hello", textModel)

//
// <tx-texttool> & <tx-textarea>
//
let markupModel = new HtmlModel("")
markupModel.modified.add(() => {
    document.getElementById("rawhtml")!.innerText = markupModel.value
})
bind("markup", markupModel)

//
// <tx-button>
//
action("hitMe", () => {
    textModel.value = "Hit me too!"
    hitMeMore.enabled = true
})
var hitMeMore = action("hitMeMore", () => {
    textModel.value = "You hit me!"
    hitMeMore.enabled = false
})

//
// <tx-checkbox>, <tx-switch> and <tx-if>
//

const off = new BooleanModel(false)
const on = new BooleanModel(true)
const offDisabled = new BooleanModel(false)
offDisabled.enabled = false
const onDisabled = new BooleanModel(true)
onDisabled.enabled = false

bind("off", off)
bind("on", on)
bind("offDisabled", offDisabled)
bind("onDisabled", onDisabled)

//
// EnumModel
//

enum Color {
    BLUEBERRY = 0,
    GRAPE,
    TANGERINE,
    LIME,
    STRAWBERRY,
    BONDIBLUE
}

const flavourEnabled = new EnumModel<Color>(Color)
flavourEnabled.value = Color.GRAPE
bind("flavourEnabled", flavourEnabled)

const flavourDisabled = new EnumModel<Color>(Color)
flavourDisabled.enabled = false
flavourDisabled.value = Color.TANGERINE
bind("flavourDisabled", flavourDisabled)

const customFlavour = new TextModel("")
bind("customFlavour", customFlavour)
const customFlavourDisabled = new TextModel("")
bind("customFlavourDisabled", customFlavourDisabled)
//
// <tx-slider>
//

let size = new NumberModel(42, { min: 0, max: 99 })
bind("size", size)

// <toad-menu>
action("file|logout", () => {
    alert("You are about to logout")
})
action("help", () => {
    alert("Please.")
})

//
// Books
//

const sheet = [
    ["Name", "Pieces", "Price/Piece", "Price"],
    ["Apple", "=4", "=0.98", "=B2*C2"],
    ["Banana", "=2", "=1.98", "=B3*C3"],
    ["Citrus", "=1", "=1.48", "=B4*C4"],
    ["SUM", "", "", "=D2+D3+D4"],
]

const spreadsheet = new SpreadsheetModel(25, 25)
for (let row = 0; row < spreadsheet.rowCount; ++row) {
    for (let col = 0; col < spreadsheet.colCount; ++col) {
        if (row < sheet.length && col < sheet[row].length) {
            spreadsheet.setField(col, row, sheet[row][col])
        }
    }
}
TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
bind("spreadsheet", spreadsheet)

//
// Tree
//

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

// class MyTreeAdapter extends TreeAdapter<MyNode> {
//     override showCell(pos: TablePos, cell: HTMLSpanElement) {
//         // return this.model && this.treeCell(row, this.model.rows[row].node.label)
//     }
// }

class MyTreeAdapter extends TreeAdapter<MyNode> {
    override get isSeamless(): boolean {
        return true
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        super.showCell(pos, cell)

        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label

        const labelNode = span(text(label))
        labelNode.style.verticalAlign = "middle"
        labelNode.style.padding = "2px"
        cell.appendChild(labelNode)
    }
}

function initializeTree(): void {
    TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)
    let model = new TreeNodeModel(MyNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    model.addSiblingAfter(0)
    bind("tree", model)
}

class MyCodeButton extends HTMLElement {
    condition = new BooleanModel(false)
    constructor() {
        super()
        let template = new Template("my-code-button") // FIXME: how about inlining the HTML?
        let label = template.text("label", "Show Code")
        template.action("action", () => {
            if (this.condition.value) {
                this.condition.value = false
                label.value = "Show Code"
            } else {
                this.condition.value = true
                label.value = "Hide Code"
            }
        })
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(template.root)
    }
    connectedCallback() {
        bind(this.getAttribute("condition")!, this.condition) // FIXME: bind to parents context
    }
}
window.customElements.define("my-code-button", MyCodeButton)

