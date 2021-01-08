import { expect, use } from "chai"
use(require('chai-subset'))

import { 
    View, TableView, TableModel, TableEditMode, 
    Model, SelectionModel, TextView, TextModel, BooleanModel, 
    TreeNodeModel, TableEvent,
    bind, unbind, action, globalController, TableEventType
} from "../../src/toad"
// import { TreeNodeModel } from "../../src/tree"

describe("toad.js", function() {

    beforeEach(function() {
      unbind()
      document.body.innerHTML = ""
    })

    describe("view", function() {

        class MyTableModel extends TableModel {
            data: any
            constructor() {
                super()
                this.data = [
                    [ "The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966 ],
                    [ "Stranger In A Strange Land", "Robert A. Heinlein", 1961 ],
                    [ "The Fountains of Paradise", "Arthur C. Clarke", 1979],
                    [ "Rendezvous with Rama", "Arthur C. Clarke", 1973 ],
                    [ "2001: A Space Odyssey", "Arthur C. Clarke", 1968 ],
                    [ "Do Androids Dream of Electric Sheep?", "Philip K. Dick", 1968],
                    [ "A Scanner Darkly", "Philip K. Dick", 1977],
                    [ "Second Variety", "Philip K. Dick", 1953]
                ]
            }
            get colCount(): number { return this.data[0].length }
            get rowCount(): number { return this.data.length }
            getColumnHead(column: number): TextModel {
                switch(column) {
                    case 0: return new TextModel("Title")
                    case 1: return new TextModel("Author")
                    case 2: return new TextModel("Year")
                }
                throw Error("fuck")
            }
            getFieldModel(col: number, row: number): TextModel {
                let model = new TextModel(this.data[row][col])
                model.modified.add( () => {
                    this.data[row][col] = model.value
                })
                return model
            }
            getFieldView(col: number, row: number): View {
                return new TextView()
            }
        }

        describe("initialize view from model", function() {
            it("does so when the model is defined before the view", function() {
                let model = new MyTableModel()
                bind("data", model)
                document.body.innerHTML = "<toad-table model='data'></toad-table>"
                
                let table = document.body.children[0] as TableView
                expect(table.tagName).to.equal("TOAD-TABLE")
                
                let cell = table.getElementAt(0, 0)
                expect(cell.innerText).to.equal("The Moon Is A Harsh Mistress")
            })
            it("does so when the view is defined before the model", function() {
                document.body.innerHTML = "<toad-table model='data'></toad-table>"
                let model = new MyTableModel()
                bind("data", model)
                
                let table = document.body.children[0] as TableView
                expect(table.tagName).to.equal("TOAD-TABLE")
                
                let cell = table.getElementAt(0, 0)
                expect(cell.innerText).to.equal("The Moon Is A Harsh Mistress")
            })
        })
        
        describe("selection model", function() {
            it("edit cell", function() {
                let dataModel = new MyTableModel()
                bind("books", dataModel)
                let selectionModel = new SelectionModel()
                selectionModel.mode = TableEditMode.EDIT_CELL
                bind("books", selectionModel)
                document.body.innerHTML = "<toad-table model='books'></toad-table>"
                
                let table = document.body.children[0] as TableView
                expect(table.tagName).to.equal("TOAD-TABLE")
                
                let cell = table.getElementAt(0, 0)
                expect(cell.innerText).to.equal("The Moon Is A Harsh Mistress")

                let row = cell.parentElement as HTMLTableRowElement
                expect(row.tagName).to.equal("TR")
                
                expect(row.classList.contains("selected")).to.equal(false)
                
                let text = table.inputDiv.children[0] as TextView
                expect(text.tagName).to.equal("TOAD-TEXT")
                expect(text.value).to.equal("The Moon Is A Harsh Mistress")
                
                selectionModel.row = 1
                
                text = table.inputDiv.children[0] as TextView
                expect(text.tagName).to.equal("TOAD-TEXT")
                expect(text.value).to.equal("Stranger In A Strange Land")
                
                selectionModel.col = 1
                text = table.inputDiv.children[0] as TextView
                expect(text.tagName).to.equal("TOAD-TEXT")
                expect(text.value).to.equal("Robert A. Heinlein")
            })

            it("select row", function() {
                let dataModel = new MyTableModel()
                bind("books", dataModel)
                let selectionModel = new SelectionModel()
                selectionModel.mode = TableEditMode.SELECT_ROW
                bind("books", selectionModel)
                document.body.innerHTML = "<toad-table model='books'></toad-table>"
                
                let table = document.body.children[0] as TableView
                expect(table.tagName).to.equal("TOAD-TABLE")
                
                let cell0 = table.getElementAt(0, 0)
                let cell1 = table.getElementAt(0, 1)
                expect(cell0.innerText).to.equal("The Moon Is A Harsh Mistress")

                let row0 = cell0.parentElement as HTMLTableRowElement
                let row1 = cell1.parentElement as HTMLTableRowElement
                expect(row0.tagName).to.equal("TR")
                
                expect(row0.classList.contains("selected")).to.equal(true)
                expect(row1.classList.contains("selected")).to.equal(false)
                
                selectionModel.row = 1

                expect(row0.classList.contains("selected")).to.equal(false)
                expect(row1.classList.contains("selected")).to.equal(true)
            })
        })
/*
        describe("on change sync data between model and view", function() {

            it("updates the html element when the model changes", function() {
                let model = new BooleanModel(true)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0]
                expect(checkbox.hasAttribute("checked")).to.equal(true)
                model.value = false
                expect(checkbox.hasAttribute("checked")).to.equal(false)
                clearAll()
            })
  
            it("updates the model when the html element changes", function() {
                let model = new BooleanModel(false)
                bind("bool", model)
                document.body.innerHTML = "<toad-checkbox model='bool'></toad-checkbox>"
                let checkbox = document.body.children[0] as CheckboxView
                expect(model.value).not.to.equal(true)
                checkbox.setAttribute("checked", "")
                expect(model.value).to.equal(true)
                clearAll()
            })
        })
*/
    })
})
