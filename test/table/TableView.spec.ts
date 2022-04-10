import { expect } from "@esm-bundle/chai"

import { 
    TableView, TableEditMode, 
    SelectionModel, Text, 
    bindModel as bind, unbind, TableAdapter
} from "@toad"

import { setAnimationFrameCount } from "src/util/scrollIntoView"
import { TestTableAdapter, TestTableModel, TestRow } from "./TestTableScene"

describe("view", function() {
    describe("table", function() {
        describe("class TableView", function() {

            beforeEach(function() {
                unbind()
                TableAdapter.unbind()
                document.body.innerHTML = ""
                TableAdapter.register(TestTableAdapter, TestTableModel, TestRow)
                setAnimationFrameCount(0)
            })

            describe("when initializing TableView from a Model", function() {
                it("initializes when the MODEL is defined BEFORE the VIEW", function() {
                    const model = new TestTableModel()
                    bind("data", model)
                    
                    document.body.innerHTML = "<tx-table model='data'></tx-table>"
                    
                    const table = document.body.children[0] as TableView
                    expect(table.tagName).to.equal("TX-TABLE")                  
                    const cell = table.getCellAt(0, 0)!
                    expect(cell.innerText).to.equal("CELL:0:0")
                })
                it("initializes when the VIEW is defined BEFORE the MODEL", function() {
                    document.body.innerHTML = "<tx-table model='data'></tx-table>"

                    const model = new TestTableModel()
                    bind("data", model)
                    
                    const table = document.body.children[0] as TableView
                    expect(table.tagName).to.equal("TX-TABLE")
                    const cell = table.getCellAt(0, 0)!
                    expect(cell.innerText).to.equal("CELL:0:0")
                })
            })
            
            describe("selection model", function() {
                it("when changed in EDIT_CELL mode, the edit field in the table view also changes", function() {
                    const dataModel = new TestTableModel()
                    bind("books", dataModel)
                    const selectionModel = new SelectionModel()
                    expect(selectionModel.mode).to.equal(TableEditMode.EDIT_CELL)
                    bind("books", selectionModel)
                    document.body.innerHTML = "<tx-table model='books'></tx-table>"
                    
                    const table = document.querySelector("tx-table") as TableView
                   
                    // check that the table works

                    const cell = table.getCellAt(0, 0)!
                    expect(cell.innerText).to.equal("CELL:0:0")

                    const row = cell.parentElement as HTMLTableRowElement
                    expect(row.tagName).to.equal("TR")
                    
                    expect(row.classList.contains("selected")).to.equal(false)
                    
                    // selection is at initial position
                    let text = table.inputOverlay.children[0] as Text
                    expect(text.tagName).to.equal("TX-TEXT")
                    expect(text.value).to.equal("CELL:0:0")
                    
                    // change selected row
                    selectionModel.row = 1                   
                    text = table.inputOverlay.children[0] as Text
                    expect(text.tagName).to.equal("TX-TEXT")
                    expect(text.value).to.equal("CELL:0:1")
                    
                    // change selected column
                    selectionModel.col = 1
                    text = table.inputOverlay.children[0] as Text
                    expect(text.tagName).to.equal("TX-TEXT")
                    expect(text.value).to.equal("CELL:1:1")
                })

                it("when changed in SELECT_ROW mode, the row marked as selected also changes", function() {
                    const dataModel = new TestTableModel()
                    bind("books", dataModel)
                    const selectionModel = new SelectionModel()
                    selectionModel.mode = TableEditMode.SELECT_ROW
                    bind("books", selectionModel)
                    document.body.innerHTML = "<tx-table model='books'></tx-table>"
                    
                    const table = document.body.children[0] as TableView
                    expect(table.tagName).to.equal("TX-TABLE")
                    
                    const cell0 = table.getCellAt(0, 0)!
                    const cell1 = table.getCellAt(0, 1)!
                    expect(cell0.innerText).to.equal("CELL:0:0")
                    expect(cell1.innerText).to.equal("CELL:0:1")

                    const row0 = cell0.parentElement as HTMLTableRowElement
                    const row1 = cell1.parentElement as HTMLTableRowElement
                    expect(row0.tagName).to.equal("TR")
                    
                    // intial row
                    expect(row0.classList.contains("selected")).to.be.true
                    expect(row1.classList.contains("selected")).to.be.false

                    // change row
                    selectionModel.row = 1
                    expect(row0.classList.contains("selected")).to.be.false
                    expect(row1.classList.contains("selected")).to.be.true
                })
            })
    /*
            describe("on change sync data between model and view", function() {

                it("updates the html element when the model changes", function() {
                    let model = new BooleanModel(true)
                    bind("bool", model)
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
                    let checkbox = document.body.children[0]
                    expect(checkbox.hasAttribute("checked")).to.equal(true)
                    model.value = false
                    expect(checkbox.hasAttribute("checked")).to.equal(false)
                    clearAll()
                })
    
                it("updates the model when the html element changes", function() {
                    let model = new BooleanModel(false)
                    bind("bool", model)
                    document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
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
})
