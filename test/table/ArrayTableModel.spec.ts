import { expect, use } from "chai"
use(require('chai-subset'))

import { TableEvent, TableEventType } from "@toad"
import { BookTableScene, Book } from "./BookTableScene"

describe("toad.js", function() {
    describe("table", function() {
        describe("class ArrayTableModel<T> is an adapter for Array<T>", function() {
            describe("constructor()", function() {
                it("constructor(data: Array<T>, ...)", function() {
                    const model = BookTableScene.createBookModel()
                    expect(model.data.length).to.equal(8)
                })
            })

            describe("insert()", function() {
                it("insert(index, object)", async function() {
                    const model = BookTableScene.createBookModel()
                    let event: TableEvent | undefined
                    model.modified.add( (data: TableEvent) => { event = data })

                    const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                    model.insert(3, newBook)

                    expect(model.data.length).to.equal(9)
                    expect(model.data[3]).to.equal(newBook)

                    expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 3, 1))
                })

                it("insert(index, [object, ...])", async function() {
                    const model = BookTableScene.createBookModel()
                    let event: TableEvent | undefined
                    model.modified.add( (data: TableEvent) => { event = data })

                    const newBook0 = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
                    const newBook1 = new Book("Master of the World", "Jules Verne", 1904)
                    model.insert(3, [newBook0, newBook1])

                    expect(model.data.length).to.equal(10)
                    expect(model.data[3]).to.equal(newBook0)
                    expect(model.data[4]).to.equal(newBook1)

                    expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 3, 2))
                })
            })
            describe("remove()", function() {
                it("remove(index)", function() {
                    const model = BookTableScene.createBookModel()
                    let event: TableEvent | undefined
                    model.modified.add( (data: TableEvent) => { event = data })

                    model.remove(2)

                    expect(model.data.length).to.equal(7)
                    expect(model.data[1].title).to.equal("Stranger In A Strange Land")
                    expect(model.data[2].title).to.equal("Rendezvous with Rama")

                    expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVE_ROW, 2, 1))
                })
                it("remove(startIndex, deleteCount)", async function() {
                    const model = BookTableScene.createBookModel()
                    let event: TableEvent | undefined
                    model.modified.add( (data: TableEvent) => { event = data })
                    model.remove(2, 2)

                    expect(model.data.length).to.equal(6)
                    expect(model.data[1].title).to.equal("Stranger In A Strange Land")
                    expect(model.data[2].title).to.equal("2001: A Space Odyssey")

                    expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVE_ROW, 2, 2))
                })
            })
        })
    })
})


