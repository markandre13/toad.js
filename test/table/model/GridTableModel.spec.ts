import { expect } from '@esm-bundle/chai'

import { GridTableModel } from 'src/table/model/GridTableModel'
import { TableEvent } from 'src/table/TableEvent'
import { TableEventType } from 'src/table/TableEventType'

class NumberGrid extends GridTableModel<Number> { }

describe("gridtablemodel", function () {
    describe("initialization", function () {
        it("it can be empty", function () {
            const model = new NumberGrid(Number)
            expect(model.colCount).to.equal(0)
            expect(model.rowCount).to.equal(0)
        })
        it("it can contain data", function () {
            const model = new NumberGrid(Number, 3, 2, [
                1, 2, 3,
                4, 5, 6
            ])
            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(2)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)
        })
    })
    describe("insert row", function () {
        it("into empty", function () {
            const model = new NumberGrid(Number)
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertRow(0, [
                1, 2, 3,
                4, 5, 6
            ], 3)
            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(2)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_ROW)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at head", function () {
            const model = new NumberGrid(Number, 3, 2, [
                7, 8, 9,
                10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertRow(0, [
                1, 2, 3,
                4, 5, 6
            ], 3)
            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(4)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)
            expect(model.getCell(0, 2)).to.equal(7)
            expect(model.getCell(2, 3)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_ROW)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at middle", function () {
            const model = new NumberGrid(Number, 3, 2, [
                1, 2, 3,
                10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertRow(1, [
                4, 5, 6,
                7, 8, 9
            ], 3)
            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(4)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)
            expect(model.getCell(0, 2)).to.equal(7)
            expect(model.getCell(2, 3)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_ROW)
            expect(event!!.index).to.equal(1)
            expect(event!!.size).to.equal(2)
        })
        it("at end", function () {
            const model = new NumberGrid(Number, 3, 2, [
                1, 2, 3,
                4, 5, 6
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertRow(2, [
                7, 8, 9,
                10, 11, 12
            ], 3)
            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(4)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)
            expect(model.getCell(0, 2)).to.equal(7)
            expect(model.getCell(2, 3)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_ROW)
            expect(event!!.index).to.equal(2)
            expect(event!!.size).to.equal(2)
        })
    })
    describe("insert column", function () {
        it("into empty", function () {
            const model = new NumberGrid(Number)
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertColumn(0, [
                1, 4,
                2, 5,
                3, 6
            ], 3)
            expect(model.colCount).to.equal(2)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 2)).to.equal(6)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_COL)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at head", function () {
            const model = new NumberGrid(Number, 2, 3, [
                7, 10,
                8, 11,
                9, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertColumn(0, [
                1, 4,
                2, 5,
                3, 6
            ])

            expect(model.colCount).to.equal(4)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 0)).to.equal(4)
            expect(model.getCell(1, 2)).to.equal(6)
            expect(model.getCell(2, 0)).to.equal(7)
            expect(model.getCell(3, 0)).to.equal(10)
            expect(model.getCell(3, 2)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_COL)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at middle", function () {
            const model = new NumberGrid(Number, 2, 3, [
                1, 10,
                2, 11,
                3, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertColumn(1, [
                4, 7,
                5, 8,
                6, 9
            ])

            expect(model.colCount).to.equal(4)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 0)).to.equal(4)
            expect(model.getCell(1, 2)).to.equal(6)
            expect(model.getCell(2, 0)).to.equal(7)
            expect(model.getCell(3, 0)).to.equal(10)
            expect(model.getCell(3, 2)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_COL)
            expect(event!!.index).to.equal(1)
            expect(event!!.size).to.equal(2)
        })
        it("at end", function () {
            const model = new NumberGrid(Number, 2, 3, [
                1, 4,
                2, 5,
                3, 6
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.insertColumn(2, [
                7, 10,
                8, 11,
                9, 12
            ])

            expect(model.colCount).to.equal(4)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 0)).to.equal(4)
            expect(model.getCell(1, 2)).to.equal(6)
            expect(model.getCell(2, 0)).to.equal(7)
            expect(model.getCell(3, 0)).to.equal(10)
            expect(model.getCell(3, 2)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.INSERT_COL)
            expect(event!!.index).to.equal(2)
            expect(event!!.size).to.equal(2)
        })
    })
    describe("remove row", function () {
        it("remove all")
        it("at head", function () {
            const model = new NumberGrid(Number, 3, 4, [
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
                10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeRow(0, 2)

            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(2)
            expect(model.getCell(0, 0)).to.equal(7)
            expect(model.getCell(2, 1)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_ROW)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at middle", function () {
            const model = new NumberGrid(Number, 3, 4, [
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
                10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeRow(1, 2)

            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(2)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_ROW)
            expect(event!!.index).to.equal(1)
            expect(event!!.size).to.equal(2)
        })
        it("at end", function () {
            const model = new NumberGrid(Number, 3, 4, [
                1, 2, 3,
                4, 5, 6,
                7, 8, 9,
                10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeRow(2, 2)

            expect(model.colCount).to.equal(3)
            expect(model.rowCount).to.equal(2)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(2, 1)).to.equal(6)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_ROW)
            expect(event!!.index).to.equal(2)
            expect(event!!.size).to.equal(2)
        })
    })
    describe("remove column", function () {
        it("remove all")
        it("at head", function() {

            // backwards: 8 4 0
            //  B  B        B  B       B  B
            //  1  2  3  4  5  6  7  8  9 10 11 12
            //        3  4  5  6  7  8  9 10 11 12   0  +(cols-1)
            //        3  4  5        8  9 10 11 12   3  
            //        3  4  5        8  9       12   5
           
            //  backwards: 9 5 1
            //  1  2  3  4  5  6  7  8  9 10 11 12
            //  1        4  5  6  7  8  9 10 11 12   1 
            //  1        4  5        8  9 10 11 12   3
            //  1        4  5        8  9       12   5


            const model = new NumberGrid(Number, 4, 3, [
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeColumn(0, 2)

            expect(model.colCount).to.equal(2)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(3)
            expect(model.getCell(1, 2)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_COL)
            expect(event!!.index).to.equal(0)
            expect(event!!.size).to.equal(2)
        })
        it("at middle", function() {
            const model = new NumberGrid(Number, 4, 3, [
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeColumn(1, 2)

            expect(model.colCount).to.equal(2)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 2)).to.equal(12)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_COL)
            expect(event!!.index).to.equal(1)
            expect(event!!.size).to.equal(2)
        })
        it("at end", function() {
            const model = new NumberGrid(Number, 4, 3, [
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12
            ])
            let event: TableEvent | undefined
            model.modified.add((e) => {
                event = e
            })
            model.removeColumn(2, 2)

            expect(model.colCount).to.equal(2)
            expect(model.rowCount).to.equal(3)
            expect(model.getCell(0, 0)).to.equal(1)
            expect(model.getCell(1, 2)).to.equal(10)

            expect(event).to.be.not.undefined
            expect(event!!.type).to.equal(TableEventType.REMOVE_COL)
            expect(event!!.index).to.equal(2)
            expect(event!!.size).to.equal(2)
        })

    })
})