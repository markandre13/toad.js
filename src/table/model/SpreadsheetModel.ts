import { GridTableModel } from './GridTableModel'
import { SpreadsheetCell } from "./SpreadsheetCell"

export class SpreadsheetModel extends GridTableModel<SpreadsheetCell> {
    protected dependencies = new Map<SpreadsheetCell, Set<SpreadsheetCell>>();

    constructor(cols: number, rows: number) {
        super(SpreadsheetCell, cols, rows)
    }
    getCell(col: number, row: number) {
        const index = col + row * this._cols
        return this._data[index]
    }
    getField(col: number, row: number): string {
        const cell = this.getCell(col, row)
        if (cell === undefined) {
            return ""
        }
        return `${cell.value}`
    }
    setField(col: number, row: number, value: string) {
        // console.log(`setField(${col}, ${row}, '${value}')`)
        const index = col + row * this._cols
        let cell = this._data[index]
        if (cell === undefined) {
            cell = new SpreadsheetCell(value)
            this._data[col + row * this._cols] = cell
        } else {
            // remove depedencies
            cell.value = value
        }
        this.observe(cell)

        // FIXME: this needs to be done recursivley
        this.eval(cell)
    }

    protected eval(cell: SpreadsheetCell, marks = new Set<SpreadsheetCell>()) {
        // mark...
        if (marks.has(cell)) {
            throw Error("cycle")
        }
        marks.add(cell)

        // (evaluate)
        cell.eval(this)

        // ...and sweep
        const observers = this.dependencies.get(cell)
        if (observers !== undefined) {
            observers.forEach(observer => {
                // console.log(`  update observer ${observer._str}`)
                this.eval(observer, marks)
            })
        }
    }

    protected observe(cell: SpreadsheetCell) {
        const dependencies = cell.getDependencies()
        dependencies.forEach(element => {
            const col = element[0]
            const row = element[1]

            // console.log(`    depends on [${col}, ${row}]`)
            const index = col + row * this._cols
            let dependency = this._data[index]
            if (dependency === undefined) {
                dependency = new SpreadsheetCell()
                this._data[index] = dependency
            }
            let dependents = this.dependencies.get(dependency)
            if (dependents === undefined) {
                dependents = new Set<SpreadsheetCell>()
                this.dependencies.set(dependency, dependents)
            }
            dependents.add(cell)
        })
    }
}
