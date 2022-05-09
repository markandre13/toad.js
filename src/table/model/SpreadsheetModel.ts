import { TableEvent } from '../TableEvent'
import { TableEventType } from '../TableEventType'
import { GridTableModel } from './GridTableModel'
import { SpreadsheetCell } from "./SpreadsheetCell"

export class SpreadsheetModel extends GridTableModel<SpreadsheetCell> {
    protected dependencies = new Map<SpreadsheetCell, Set<SpreadsheetCell>>();

    constructor(cols: number, rows: number) {
        super(SpreadsheetCell, cols, rows)
    }
    getField(col: number, row: number): string {
        const cell = this.getCell(col, row)
        if (cell === undefined) {
            return ""
        }
        return `${cell.value}`
    }
    setField(col: number, row: number, value: string) {
        // console.log(`SpreadsheetModel.setField(${col}, ${row}, '${value}')`)
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

    // FIXME: can we do this without a linear search for the cell coordinates?
    protected sendCellChanged(cell: SpreadsheetCell) {
        let idx = 0
        for(let row = 0; row<this._rows; ++row) {
            for(let col = 0; col<this._cols; ++col) {
                if (cell === this._data[idx++]) {
                    this.modified.trigger(new TableEvent(TableEventType.CELL_CHANGED, col, row))
                    return
                }
            }
        }
    }

    protected eval(cell: SpreadsheetCell, marks = new Set<SpreadsheetCell>()) {
        // mark...
        if (marks.has(cell)) {
            throw Error("cycle")
        }
        marks.add(cell)

        // (evaluate)
        const oldValue = cell._value
        cell.eval(this)
        if (oldValue != cell._value) {
            this.sendCellChanged(cell)
        }

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
