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

// TODO list table
// [ ] start writing unit tests, doing it manually is getting out of hands...
// [X] get rid of webpack now that we have rollup
// [ ] adjust all lowercase *.ts file names
// [X] one internal style sheet for <table>, TreeAdapter chooses a layout via class
// [X] row headers
// [ ] don't scroll left & right when clicking on a 1st field (same issue for up'n down)
// [ ] don't add scrollbars when editing OR always add scrollbars when editing is possible OR resize
// [ ] restore table focus after toolbutton usage
// [ ] don't default to row selection mode when there's a selection mode
// [ ] keyboard for row selection mode
// [ ] resize table
// [ ] fold/unfold tree
// [X] table/tree toolbox
// [X] select whole column/row
// [ ] select rectangular area
// [ ] resize columns
// [ ] rearrange columns
// [ ] sort rows
// [ ] filter rows
// [ ] simple spreadsheet demo

import {
    ArrayTableModel, TableAdapter,
    TreeNode, TreeNodeModel, TreeAdapter,
    TextModel, TextView,
    bind,
    TableEvent, TableEventType
} from '..'

//
// Books
//

class Book {
    title: string
    author: string
    year: number
    constructor(title: string = "", author: string = "", year: number = 1970) {
        this.title = title
        this.author = author
        this.year = year
    }
}

class BookTableModel extends ArrayTableModel<Book> {
    constructor(data: Array<Book>) {
        super(data, Book)
     }
    get colCount(): number { return 10 }
}

class BookTableAdapter extends TableAdapter {
    model?: BookTableModel

    setModel(model: BookTableModel) {
        this.model = model
    }

    getColumnHead(col: number): Node | undefined {
        switch(col) {
            case 0: return document.createTextNode("Title")
            case 1: return document.createTextNode("Author")
            case 2: return document.createTextNode("Year")
        }
        return document.createTextNode("x")
    }

    getRowHead(row: number) {
        return document.createTextNode(`${row}`)
    }

    displayCell(col: number, row: number): Node | undefined {       
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        return document.createTextNode(text)
    }

    createEditor(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (text === undefined)
            return undefined
        const model = new TextModel(text)
        model.modified.add( () => {
            this.setField(col, row, model.value)
        })
        const view = new TextView()
        view.setModel(model)
        return view
    }

    private getField(col: number, row: number): string | undefined {
        if (!this.model)
            return undefined
        let text: string | undefined
        switch(col) {
            case 0: text = this.model.data[row].title; break
            case 1: text = this.model.data[row].author; break
            case 2: text = `${this.model.data[row].year}`; break
            default: text = `dummy${col}:${row}`
        }
        // console.log(`BookTableAdapter.getField(${col}, ${row}) -> "${text}"`)
        // console.log(this.model.data[row])
        return text
    }

    private setField(col: number, row: number, text: string): void {
        // console.log(`BookTableAdapter.setField(${col}, ${row}, "${text}")`)
        if (!this.model)
            return
        // FIXME: hide data and let the model itself generate the trigger
        switch(col) {
            case 0: this.model.data[row].title = text; break
            case 1: this.model.data[row].author = text; break
            case 2: this.model.data[row].year = Number.parseInt(text); break
        }
        this.model.modified.trigger(new TableEvent(TableEventType.CELL_CHANGED, col, row))
    }
}
TableAdapter.register(BookTableAdapter, BookTableModel, Book)

function initializeBooks() {
    const data = new Array<Book>()
    const init = [
        [ "The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966 ],
        [ "Stranger In A Strange Land", "Robert A. Heinlein", 1961 ],
        [ "The Fountains of Paradise", "Arthur C. Clarke", 1979],
        [ "Rendezvous with Rama", "Arthur C. Clarke", 1973 ],
        [ "2001: A Space Odyssey", "Arthur C. Clarke", 1968 ],
        [ "Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
        [ "A Scanner Darkly", "Philip K. Dick", 1977],
        [ "Second Variety", "Philip K. Dick", 1953]
    ].forEach( (e) => {
        data.push(new Book(e[0] as string, e[1] as string, e[2] as number))
    })
    const books = new BookTableModel(data)
    bind("books", books)
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
    displayCell(col: number, row: number): Node | undefined {       
        return this.model && this.treeCell(row, this.model.rows[row].node.label)
    }
}
TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)

function initializeTree(): void {
    let tree = new TreeNodeModel(MyNode)
    tree.addSiblingAfter(0)
    tree.addChildAfter(0)
    tree.addChildAfter(1)
    tree.addSiblingAfter(2)
    tree.addSiblingAfter(1)
    tree.addChildAfter(4)
    tree.addSiblingAfter(0)
    bind("tree", tree)
}

export function main(): void {
    initializeBooks()
    initializeTree()
}
