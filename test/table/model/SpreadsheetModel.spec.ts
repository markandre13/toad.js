import { expect } from 'chai'

import { SpreadsheetModel } from 'src/table/model/SpreadsheetModel'
import { TableEvent } from 'src/table/TableEvent'
import { TableEventType } from 'src/table/TableEventType'

describe.only("spreadsheetmodel", function () {
    function createModel4x4() {
        const m = new SpreadsheetModel(4, 4)
        for (let row = 0; row < 4; ++row) {
            for (let col = 0; col < 4; ++col) {
                m.setField(col, row, `C${col}R${row}`)
            }
        }
        return m
    }
    function logModel(m: SpreadsheetModel) {
        let txt = "\n"
        for (let row = 0; row < m.rowCount; ++row) {
            for (let col = 0; col < m.colCount; ++col) {
                txt += m.getField(col, row) + " "
            }
            txt += "\n"
        }
        console.log(txt)
    }
    describe("add/remove rows/columns", function () {
        it("insert row", function () {
            const m = createModel4x4()
            let event!: TableEvent
            m.modified.add((e) => {
                if (e instanceof TableEvent) {
                    event = e
                }
            })

            m.insertRow(2)
            
            expect(event).to.deep.equal({
                type: TableEventType.INSERT_ROW,
                index: 2,
                size: 1
            })

            expect(m.rowCount).to.equal(5)

            for (let row = 0; row < 5; ++row) {
                for (let col = 0; col < 4; ++col) {
                    let want
                    if (row<2) {
                        want = `C${col}R${row}`
                    } else
                    if (row === 2) {
                        want = ""
                    } else {
                        want = `C${col}R${row-1}`
                    }
                    expect(m.getField(col, row)).to.equal(want)
                }
            }
        })
        it("remove row", function () {
            const m = createModel4x4()
            let event!: TableEvent
            m.modified.add((e) => {
                if (e instanceof TableEvent) {
                    event = e
                }
            })

            m.removeRow(2)
            
            expect(event).to.deep.equal({
                type: TableEventType.REMOVE_ROW,
                index: 2,
                size: 1
            })
            
            expect(m.rowCount).to.equal(3)
            for (let row = 0; row < 3; ++row) {
                for (let col = 0; col < 4; ++col) {
                    let want
                    if (row<2) {
                        want = `C${col}R${row}`
                    } else {
                        want = `C${col}R${row+1}`
                    }
                    expect(m.getField(col, row)).to.equal(want)
                }
            }
        })
        it("insert column", function() {
            const m = createModel4x4()
            let event!: TableEvent
            m.modified.add((e) => {
                if (e instanceof TableEvent) {
                    event = e
                }
            })

            m.insertColumn(2)

            expect(event).to.deep.equal({
                type: TableEventType.INSERT_COL,
                index: 2,
                size: 1
            })

            expect(m.colCount).to.equal(5)
            for (let col = 0; col < 5; ++col) {
                for (let row = 0; row < 4; ++row) {                
                    let want
                    if (col<2) {
                        want = `C${col}R${row}`
                    } else
                    if (col === 2) {
                        want = ""
                    } else {
                        want = `C${col-1}R${row}`
                    }
                    expect(m.getField(col, row)).to.equal(want)
                }
            }
        })
        it("remove column", function () {
            const m = createModel4x4()
            let event!: TableEvent
            m.modified.add((e) => {
                if (e instanceof TableEvent) {
                    event = e
                }
            })

            m.removeColumn(2)

            expect(event).to.deep.equal({
                type: TableEventType.REMOVE_COL,
                index: 2,
                size: 1
            })
            expect(m.colCount).to.equal(3)
            for (let col = 0; col < 3; ++col) {
                for (let row = 0; row < 4; ++row) {
                    let want
                    if (col<2) {
                        want = `C${col}R${row}`
                    } else {
                        want = `C${col+1}R${row}`
                    }
                    expect(m.getField(col, row)).to.equal(want)
                }
            }
        })
    })

    describe("arithmetics", function () {
        it("1+2 -> 1=2", function () {
            const m = new SpreadsheetModel(4, 4)
            m.setField(0, 0, "1+2")
            expect(m.getField(0, 0)).to.equal("1+2")
        })
        it("=1+2 -> 3", function () {
            const m = new SpreadsheetModel(4, 4)
            m.setField(0, 0, "=1+2")
            expect(m.getField(0, 0)).to.equal("3")
        })
        it("A1=1, B1=2, A2=A1+B1, B2=A2*2 -> 6 and A1=3 -> 10", function () {
            const m = new SpreadsheetModel(4, 4)
            m.setField(0, 0, "=1")
            m.setField(1, 0, "=2")
            m.setField(0, 1, "=A1+B1")
            m.setField(1, 1, "=A2*2")
            expect(m.getField(1, 1)).to.equal("6")
            m.setField(0, 0, "=3")
            expect(m.getField(1, 1)).to.equal("10")
        })
        it("cycle", function () {
            const m = new SpreadsheetModel(4, 4)
            m.setField(0, 0, "=1")    // A1 := 1
            m.setField(1, 0, "=A1+1") // B1 := A1 +1
            m.setField(2, 0, "=B1+2") // C1 := B1 + 2

            expect(m.getCell(0,0)._error).to.be.undefined
            m.setField(0, 0, "=C1+3")
            expect(m.getCell(0,0)._error).to.not.be.undefined
        })
    })
})
