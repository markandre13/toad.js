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

import {
    TextModel, HtmlModel, NumberModel, BooleanModel, EnumModel,
    Template,
    ArrayModel, ArrayAdapter, TableAdapter,
    TreeNode, TreeNodeModel, TreeAdapter,
    bindModel as bind, action, refs
} from '@toad'

window.onload = () => {
    main()
}

//
// Soda Machine
//
const soda = document.getElementById("soda")!

soda.onanimationend = () => {
    soda.classList.remove("animated")
}

const defaultSize = 330
enum Flavour {
    CLASSIC, CHERRY, VANILLA
}

const flavour = new EnumModel<Flavour>(Flavour)
flavour.value = Flavour.CLASSIC
bind("flavour", flavour)
const quantity = new NumberModel(defaultSize, { min: 0, max: 1500 })
bind("quantity", quantity)
action("fill", () => {
    const height = quantity.value / quantity.max!
    document.documentElement.style.setProperty("--soda-height", `${height}`)
    switch (flavour.value) {
        case Flavour.CLASSIC:
            document.documentElement.style.setProperty("--soda-color", "#420")
            break
        case Flavour.CHERRY:
            document.documentElement.style.setProperty("--soda-color", "#d44")
            break
        case Flavour.VANILLA:
            document.documentElement.style.setProperty("--soda-color", "#d80")
            break
    }
    soda.classList.add("animated")
})

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

class Book {
    title: string = ""
    author: string = ""
    year: number = 1970
}

const bookList = [
    { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
    { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
    { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
    { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
    { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
    { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
    { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
    { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
]

class BookAdapter extends ArrayAdapter<ArrayModel<Book>> {
    override getColumnHeads() { return ["Title", "Author", "Year"] }
    override getRow(book: Book) { return refs(book, "title", "author", "year") }
}

function initializeBooks() {
    TableAdapter.register(BookAdapter, ArrayModel, Book)
    const model = new ArrayModel<Book>(bookList, Book)
    bind("books", model)
}

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

class MyTreeAdapter extends TreeAdapter<MyNode> {
    override getDisplayCell(col: number, row: number) {
        return this.model && this.treeCell(row, this.model.rows[row].node.label)
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

export function main(): void {
    initializeBooks()
    initializeTree()
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
