import { TablePos } from "@toad/table/TablePos"
import { TableModel } from "@toad/table/model/TableModel"
import { ArrayModel } from "@toad/table/model/ArrayModel"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { ArrayAdapter } from "@toad/table/adapter/ArrayAdapter"
import { refs } from "toad.jsx/lib/jsx-runtime"
import { text } from "@toad/util/lsx"

//
// Elite
//

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

class FixedSystemModel extends TableModel {
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
        return FixedSystemModel.get(col, row)
    }

    static get(col: number, row: number) {
        let h = this.hash(`${row}`)
        switch (col) {
            case 0: {
                // species
                let name = ""
                let l = (h % 6) + 1
                for (let j = 0; j < l; ++j) {
                    h = this.hash(`${row}`, h)
                    name += token[h % token.length]
                }
                return name.charAt(0) + name.toLowerCase().substring(1)
            }
            case 1: {
                // government
                return government[h % government.length]
            }
            case 2: {
                // economy
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
                const h3 = ((h % 4) + h2) % species3.length
                return species0[h0] + species1[h1] + species2[h2] + species3[h3]
            }
        }

        throw Error(`unreachable col ${col}, row ${row}`)
    }

    // cyrb53 from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/7616484#7616484
    static hash(str: string, seed = 0) {
        let h1 = 0xdeadbeef ^ seed,
            h2 = 0x41c6ce57 ^ seed
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

class FixedSystemAdapter extends TableAdapter<FixedSystemModel> {
    constructor(model: FixedSystemModel) {
        super(model)
    }

    override getColumnHead(col: number): Node | undefined {
        switch (col) {
            case 0:
                return text("Name")
            case 1:
                return text("Government")
            case 2:
                return text("Economy")
            case 3:
                return text("Species")
        }
    }

    override getRowHead(row: number): Node | undefined {
        return text(`${row + 1}`)
    }

    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        cell.replaceChildren(text(this.model!.get(pos.col, pos.row)))
    }
}

class System {
    name: string = "New Name"
    government: string = "New Government"
    economy: string = "New Economy"
    species: string = "New Species"
}

class DynamicSystemAdapter extends ArrayAdapter<ArrayModel<System>> {
    override getColumnHeads() {
        return ["Name", "Government", "Economy", "Species"]
    }
    override getRow(system: System) {
        return refs(system, "name", "government", "economy", "species")
    }
}

TableAdapter.register(FixedSystemAdapter, FixedSystemModel)
export const fixedSystem = new FixedSystemModel()

const systemList: System[] = Array(64)
for (let i = 0; i < 64; ++i) {
    systemList[i] = {
        name: FixedSystemModel.get(0, i),
        government: FixedSystemModel.get(1, i),
        economy: FixedSystemModel.get(2, i),
        species: FixedSystemModel.get(3, i),
    }
}

TableAdapter.register(DynamicSystemAdapter, ArrayModel, System)
export const dynamicSystem = new ArrayModel<System>(systemList, System)
