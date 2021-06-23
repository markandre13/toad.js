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
    ArrayModel, ArrayAdapter, TableAdapter,
    TreeNode, TreeNodeModel, TreeAdapter,
    bind, refs
} from '@toad'

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
