/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2022 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
            this.unobserve(cell)
            cell.value = value
        }
        this.observe(cell)

        // FIXME: this needs to be done recursivley
        this.eval(cell, new Set<SpreadsheetCell>())
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

    protected eval(cell: SpreadsheetCell, marks: Set<SpreadsheetCell>) {
        // mark...
        if (marks.has(cell)) {
            marks.forEach( c => {
                c._error = "Cycle: This formula can't reference its own cell, or depend on another formula that references this cell."
                this.sendCellChanged(c)
            })
            return
        }
        if (cell._error) {
            cell._error = undefined
            this.sendCellChanged(cell)
        }
        marks.add(cell)

        // (evaluate)
        const oldValue = cell._calculatedValue
        cell.eval(this)
        if (oldValue != cell._calculatedValue) {
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

    protected unobserve(cell: SpreadsheetCell) {
        const dependencies = cell.getDependencies()
        dependencies.forEach(element => {
            const col = element[0]
            const row = element[1]

            // console.log(`    depends on [${col}, ${row}]`)
            const index = col + row * this._cols
            let dependency = this._data[index]
            if (dependency !== undefined) {
                let dependents = this.dependencies.get(dependency)
                if (dependents !== undefined) {
                    // if (dependency._error) {
                    //     dependency._error = undefined
                    //     this.sendCellChanged(dependency)
                    // }
                    dependents.delete(cell)
                }
            }
        })
    }
}
