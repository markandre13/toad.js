/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2022 Mark-André Hopf <mhopf@mark13.org>
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

/*

this is the 2nd version of the table
* stop using <table> internally...
  => perform layout without fighting <table>'s own layout algorithm
  => required tracking of all cell width x height makes it possible
     to adjust table to content without flicker
  => makes it possible to use sparse tables in case of huge datasets
  => simplifies implementation of row/column insert/delete animation
* stop using an input overlay (? it worked fine for the caret)
* custom scrollbars matching the theme(?) (how do other libraries do that?)

NEXT STEPS:
[ ] let Table2 use model & adapter similar to the old table
[ ] row & column headers
[ ] grab between col headers to get to initiate a resize
[ ] to resize a column with CSS
    => plan:
    * once when starting the animation
      * put the right half into a div/span which we'll then translate
      * extend the width of the left column to have row lines in the background
    * then just transform: translateX the right div/span

*/

import { text } from '@toad/util/lsx'
import { TableModel, TableAdapter, bindModel } from '@toad'

// https://www.bbcelite.com/deep_dives/generating_system_data.html
// https://www.bbcelite.com/deep_dives/printing_text_tokens.html
const token = ["AL", "LE", "XE", "GE", "ZA", "CE", "BI", "SO", "US", "ES", "AR", "MA", "IN", "DI", "RE", "A", "ER", "AT", "EN", "BE", "RA", "LA", "VE", "TI", "ED", "OR", "QU", "AN", "TE", "IS", "RI", "ON"]
const government = ["Anarchy", "Feudal", "Multi-government", "Dictatorship", "Communist", "Confederacy", "Democracy", "Corporate State"]
const prosperity = ["Rich", "Average", "Poor", "Mainly"]
const economy = [" Industrial", " Agricultural"]
// "Human Colonials"
const species0 = ["Large ", "Fierce ", "Small "]
const species1 = ["Green ", "Red ", "Yellow ", "Blue ", "Black ", "Harmless "]
const species2 = ["Slimy ", "Bug-Eyed ", "Horned ", "Bony ", "Fat ", "Furry "]
//                 0           1        2          3           4        5            6          7
const species3 = ["Rodents ", "Frogs", "Lizards", "Lobsters", "Birds", "Humanoids", "Felines", "Insects"]
// species3 := (random(4) + species2) % 7
// radius = 6911 km to 2816 km
// population := (tech level * 4) + economy + government + 1 (71 = 7.1 billion)

class MyModel extends TableModel {
    constructor() {
        super()
    }
    get colCount() {
        return 4
    }
    get rowCount() {
        return 64
    }
    get(col: number, row: number) {
        let h = this.hash(`${row}`)
        switch (col) {
            case 0: { // species
                let name = ""
                let l = (h % 6) + 1
                for (let j = 0; j < l; ++j) {
                    h = this.hash(`${row}`, h)
                    name += token[h % token.length]
                }
                return name.charAt(0) + name.toLowerCase().substring(1)
            }
            case 1: { // government
                return government[h % government.length]
            }
            case 2: { // economy
                h = h >>> 3
                const h0 = h % prosperity.length
                h = h >>> 2
                const h1 = h % economy.length
                return prosperity[h0] + economy[h1]
            }
            case 3: {
                h = h >>> 6
                let h0 = h % species0.length
                h = h >>> 2
                const h1 = h % species1.length
                h = h >>> 3
                const h2 = h % species2.length
                h = h >>> 3
                const h3 = (h % 4 + h2) % species3.length
                return species0[h0] + species1[h1] + species2[h2] + species3[h3]
            }
        }

        throw Error(`unreachable col ${col}, row ${row}`)
    }

    // cyrb53 from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
    hash(str: string, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i)
            h1 = Math.imul(h1 ^ ch, 2654435761)
            h2 = Math.imul(h2 ^ ch, 1597334677)
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
        return 4294967296 * (2097151 & h2) + (h1 >>> 0)
    }
}

class MyAdapter extends TableAdapter<MyModel> {

    constructor(model: MyModel) {
        super(model)
    }

    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.get(col, row)
        )
    }
    // getEditorCell(col: number, row: number): Node | undefined { return undefined }
}

// TODO: something else to redesign:
// static register<T, A extends TypedTableAdapter<TypedTableModel<T>>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
function register<T extends TableModel>(adapter: new(model: T) => TableAdapter<any>, model: new(...args: any[])=>T): void
// static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel, data?: any): void
{
    TableAdapter.register(adapter as any, model)
}
register(MyAdapter, MyModel)

const model = new MyModel()
bindModel("solarsystems", model)
