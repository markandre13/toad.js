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

import { loadComponents } from "@toad/util/loadComponents"

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

import { bindModel as bind, action, bindModel } from "@toad/controller/globalController"
import { Template } from "@toad/controller/Template"

import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'

import { initializeSodaMachine } from "./src/sodamachine"
import { initializeStarSystem } from "./src/starsystem"
import { EmailModel } from "@toad/model/EmailModel"
import { RGBModel } from "@toad/model/RGBModel"

loadComponents()

window.onload = () => {
    main()
}

export function main(): void {
    initializeSodaMachine()
    // initializeBooks()
    initializeStarSystem()
    initializeTree()
}

const colorModel = new RGBModel("#f80")
bindModel("colorModel", colorModel)

const nameModel = new TextModel("", {
    label: "The Name of Your Avatar",
    description: `An avatar is a computer-enhanced doppelganger; a
computer-generated image that takes your place in a three-dimensional online
encounter.`
})

const mailModel = new EmailModel("", {
    label: "Email address",
    description: `Contains a locally interpreted string followed by the
at-sign character ("@", ASCII value 64) followed by an Internet domain. The
locally interpreted string is either a quoted-string or a dot-atom.  If the
string can be represented as a dot-atom (that is, it contains no characters
other than atext characters or "." surrounded by atext characters), then the
dot-atom form SHOULD be used and the quoted-string form SHOULD NOT be used.
Comments and folding white space SHOULD NOT be used around the "@" in the addr-spec.`
})

const birthModel = new NumberModel(1970, {
    min: 1900, max: 2025,
    label: "Year of Birth",
    description: `Unlikely and invalid entries should result in an error message.`
})
bindModel("nameModel", nameModel)
bindModel("mailModel", mailModel)
bindModel("birthModel", birthModel)

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
action("dummy", () => { })

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

const flavourEnabled = new EnumModel<Color>(Color, Color.GRAPE)
bind("flavourEnabled", flavourEnabled)

const flavourDisabled = new EnumModel<Color>(Color, Color.TANGERINE)
flavourDisabled.enabled = false
bind("flavourDisabled", flavourDisabled)

const customFlavour = new TextModel("")
bind("customFlavour", customFlavour)
const customFlavourDisabled = new TextModel("")
bind("customFlavourDisabled", customFlavourDisabled)
//
// <tx-slider>
//

let sliderMin = new NumberModel(0, { min: 0, max: 99 })
bind("sliderMin", sliderMin)

let sliderMax = new NumberModel(99, { min: 0, max: 99 })
bind("sliderMax", sliderMax)

let sliderMiddle = new NumberModel(42, { min: 0, max: 99 })
bind("sliderMiddle", sliderMiddle)

let sliderDisabled = new NumberModel(83, { min: 0, max: 99 })
sliderDisabled.enabled = false
bind("sliderDisabled", sliderDisabled)

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
// Spreadsheet
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
    constructor(model: TreeNodeModel<MyNode>) {
        super(model)
        this.config.seamless = true
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label
        super.treeCell(pos, cell, label)
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

