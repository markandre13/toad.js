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
    TableModel, TableAdapter,
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
    constructor(title: string, author: string, year: number) {
        this.title = title
        this.author = author
        this.year = year
    }
}

// TODO: use ArrayTableModel for this
class BookTableModel extends TableModel {
    data: Array<Book>
    constructor(data: Array<Book>) {
        super()
        this.data = data
    }
    get colCount(): number { return 3 }
    get rowCount(): number { return this.data.length }
}

class BookTableAdapter extends TableAdapter {
    model?: BookTableModel

    setModel(model: TableModel) {
        this.model = model as BookTableModel
    }

    getColumnHead(col: number): Node | undefined {
        switch(col) {
            case 0: return document.createTextNode("Title")
            case 1: return document.createTextNode("Author")
            case 2: return document.createTextNode("Year")
        }
        return undefined
    }

    displayCell(col: number, row: number): Node | undefined {       
        const text = this.getField(col, row)
        if (!text)
            return undefined
        return document.createTextNode(text)
    }

    editCell(col: number, row: number): Node | undefined {
        const text = this.getField(col, row)
        if (!text)
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
        switch(col) {
            case 0: return this.model.data[row].title
            case 1: return this.model.data[row].author
            case 2: return `${this.model.data[row].year}`
        }
        return undefined
    }

    private setField(col: number, row: number, text: string): void {
        console.log(`BookTableAdapter.setField(${col}, ${row}, "${text}")`)
        if (!this.model)
            return
        // FIXME: hide data and let the model itself generate the trigger
        switch(col) {
            case 0: this.model.data[row].title = text
            case 1: this.model.data[row].author = text
            case 2: this.model.data[row].year = Number.parseInt(text)
        }
        // FIXME: let table handle this event and maybe also provide (col, row)
        this.model.modified.trigger(new TableEvent(TableEventType.CHANGED, 0, 0))
    }
}
TableAdapter.register(BookTableAdapter, BookTableModel)

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
        if (!this.model)
            return undefined
        return this.treeCell(row, this.model.rows[row].node.label)
    }
}
TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)

function initializeTree(): void {
    let tree = new TreeNodeModel(MyNode)
    tree.addSiblingAfter(0)
    tree.addChildAfter(0)
    tree.addChildAfter(1)
    tree.addSiblingAfter(1)
    tree.addSiblingAfter(0)
    bind("tree", tree)
}

export function main(): void {
    initializeBooks()
    initializeTree()
}
