// import { expect } from '@esm-bundle/chai'
// import { TableEvent, TableEventType } from "@toad"
// import { BookTableScene, Book } from "./BookTableScene"

// describe("view", function() {
//     describe("table", function() {
//         describe("class ArrayTableModel<T> is an adapter for Array<T>", function() {
//             describe("constructor()", function() {
//                 it("constructor(data: Array<T>, ...)", function() {
//                     const model = BookTableScene.createBookModel()
//                     expect(model.data.length).to.equal(8)
//                 })
//             })

//             describe("insert()", function() {
//                 it("insert(index, object)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     let event: TableEvent | undefined
//                     model.modified.add( (data: TableEvent) => { event = data })

//                     const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
//                     model.insertRow(3, newBook)

//                     expect(model.data.length).to.equal(9)
//                     expect(model.data[3]).to.equal(newBook)

//                     expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 3, 1))
//                 })

//                 it("insert(index, [object, ...])", async function() {
//                     const model = BookTableScene.createBookModel()
//                     let event: TableEvent | undefined
//                     model.modified.add( (data: TableEvent) => { event = data })

//                     const newBook0 = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
//                     const newBook1 = new Book("Master of the World", "Jules Verne", 1904)
//                     model.insertRow(3, [newBook0, newBook1])

//                     expect(model.data.length).to.equal(10)
//                     expect(model.data[3]).to.equal(newBook0)
//                     expect(model.data[4]).to.equal(newBook1)

//                     expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 3, 2))
//                 })

//                 it("insert AT END of table (index == model.rowCount)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect(model.data.length).to.equal(8)

//                     const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
//                     model.insertRow(model.rowCount, newBook)

//                     expect(model.data.length).to.equal(9)
//                     expect(model.data[8]).to.equal(newBook)
//                 })

//                 it("insert BEHIND END of table throws an exception (index > model.rowCount)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect(model.data.length).to.equal(8)

//                     const newBook = new Book("A Princess of Mars", "Edgar Rice Burroughs", 1912)
//                     expect( () => model.insertRow(model.rowCount + 1, newBook)).to.throw(Error)
//                 })

//             })
//             describe("remove()", function() {
//                 it("remove(index)", function() {
//                     const model = BookTableScene.createBookModel()
//                     let event: TableEvent | undefined
//                     model.modified.add( (data: TableEvent) => { event = data })

//                     model.removeRow(2)

//                     expect(model.data.length).to.equal(7)
//                     expect(model.data[1].title).to.equal("Stranger In A Strange Land")
//                     expect(model.data[2].title).to.equal("Rendezvous with Rama")

//                     expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVE_ROW, 2, 1))
//                 })
//                 it("remove(startIndex, deleteCount)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     let event: TableEvent | undefined
//                     model.modified.add( (data: TableEvent) => { event = data })
//                     model.removeRow(2, 2)

//                     expect(model.data.length).to.equal(6)
//                     expect(model.data[1].title).to.equal("Stranger In A Strange Land")
//                     expect(model.data[2].title).to.equal("2001: A Space Odyssey")

//                     expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVE_ROW, 2, 2))
//                 })
//                 it("remove AT END of table throws an exception (index == model.rowCount)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect( () => model.removeRow(model.rowCount)).to.throw(Error)
//                 })
//                 it("remove BEHIND END of table throws an exception (index > model.rowCount)", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect( () => model.removeRow(model.rowCount)).to.throw(Error)
//                 })
//                 it("remove AT END of table", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect(model.data.length).to.equal(8)
//                     model.removeRow(model.rowCount-1, 1)
//                     expect(model.data.length).to.equal(7)
//                 })
//                 it("removed are stretches BEHIND END of table", async function() {
//                     const model = BookTableScene.createBookModel()
//                     expect( () => model.removeRow(model.rowCount-1, 2)).to.throw(Error)
//                 })
//             })
//         })
//     })
// })


