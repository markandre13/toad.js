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
    ArrayModel, ArrayAdapter, TableAdapter, View,
    bindModel as bind, refs
} from '@toad'

import { span, div, text } from '@toad/util/lsx'

window.onload = () => {
    initializeBooks()
}

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

.body > span {
    position: absolute;
}

.measure {
    width: 4096px;
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

// NEXT:
// [ ] use the tokens to create a normal table more
// [ ] let the table set the cells into a grid

export class Table extends View {
    root: HTMLDivElement
    body: HTMLDivElement
    measure: HTMLDivElement

    cells: HTMLSpanElement[][] = []

    constructor() {
        super()
        this.measured = this.measured.bind(this)

        this.root = div(
            this.body = div()
        )
        this.body.classList.add("body")
        this.measure = div()
        this.measure.classList.add("measure")

        for (let i = 0; i < 256; ++i) {
            let name = ""
            const l = random(5) + 1
            for (let j = 0; j < l; ++j) {
                name += token[random(token.length)]
            }
            const d = span(text(name))
            this.measure.append(d)
        }

        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.appendChild(document.importNode(tableStyle, true))
        this.shadowRoot!.appendChild(this.root)
        this.shadowRoot!.appendChild(this.measure)

        setTimeout(this.measured, 0)
    }

    measured() {
        // for(let i=0; i<this.measure.children.length; ++i) {
        //     const child = this.measure.children[i]
        //     const bounds = child.getBoundingClientRect()
        //     console.log(`${bounds.width} x ${bounds.height} ${child.innerHTML}`)
        // }

        let x = 0, y = 0
        while (this.measure.children.length > 0) {
            const child = this.measure.children[0] as HTMLSpanElement
            const bounds = child.getBoundingClientRect()

            child.style.left = `${x}px`
            child.style.top = `${y}px`

            x += Math.ceil(bounds.width) + 10
            if (x > 200) {
                x = 0
                y += Math.ceil(bounds.height)
            }

            this.body.appendChild(child)
        }
        // setTimeout(()=>{
        //     for(let i=0; i<this.body.children.length; ++i) {
        //         const child = this.body.children[i]
        //         console.log(`${child.clientWidth} x ${child.clientHeight} ${child.innerHTML}`)
        //     }
        // }, 0)
    }

}
Table.define("tx-table2", Table)
