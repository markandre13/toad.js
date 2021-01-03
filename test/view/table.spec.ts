import { expect } from "chai"
import { 
    View, TableView, TableModel, TableEditMode, 
    Model, SelectionModel, TextView, TextModel, BooleanModel, 
    DownAndNextTreeNodeModel, TableEvent,
    bind, unbind, action, globalController, TableEventType
} from "../../src/toad"
import { TreeNodeModel } from "../../src/tree"

describe("toad.js", function() {

    beforeEach(function() {
      unbind()
      document.body.innerHTML = ""
    })

    describe("<toad-table>, TableModel and SelectionModel", function() {

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
                
                let text = table.input.children[0] as TextView
                expect(text.tagName).to.equal("TOAD-TEXT")
                expect(text.value).to.equal("The Moon Is A Harsh Mistress")
                
                selectionModel.row = 1
                
                text = table.input.children[0] as TextView
                expect(text.tagName).to.equal("TOAD-TEXT")
                expect(text.value).to.equal("Stranger In A Strange Land")
                
                selectionModel.col = 1
                text = table.input.children[0] as TextView
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
        describe("tree support", function() {
            describe("class TreeNodeModel manages a tree consisting of nodes with next and down pointers", function() {

                class Node {
                    label: string
                    next?: Node
                    down?: Node
                    constructor(label?: string, next?: Node, down?: Node) {
                        if (label === undefined)
                            this.label = `#${counter++}`
                        else
                            this.label = label
                        this.next = next
                        this.down = down
                    }
                    print(indent = 0) {
                        console.log(`${"  ".repeat(indent)} ${this.label}`)
                        if (this.down)
                            this.down.print(indent+1)
                        if (this.next)
                            this.next.print(indent)
                    }
                }

                class MyTreeModel extends TreeNodeModel<Node> {
                    getFieldModel(col: number, row: number): TextModel {
                        let model = new TextModel(this.rows[row].node.label)
                        // model.modified.add( () => {
                        //     this.data[row][col] = model.value
                        // })
                        return model
                    }
                }

                let counter: number = 0
                let event: TableEvent | undefined
                let tree: DownAndNextTreeNodeModel<Node>

                function dump(ctx: Mocha.Context, reason: string) {
                    console.log(`${ctx.test?.title}: ${reason} >>>>>>>>>>>`)
                    tree.root!.print()
                    for(let i in tree.rows) {
                        console.log(`tree.rows[${i}] = ${tree.rows[i].node.label}`)
                    }
                    console.log(`${ctx.test?.title}: ${reason} <<<<<<<<<<<`)
                }

                beforeEach(function() {
                    counter = 0
                    event = undefined
                    tree = new MyTreeModel(Node)
                    tree.modified.add( (data)=> {
                        event = data
                    })
                })

                describe("addSiblingBefore(row: number)", function() {
                    it("can add a root node to an empty table", function() {      
                        //    ⇨  └─ 0
                        tree.addSiblingBefore(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(1)
                        expect(tree.rows[0].node.label).equals("#0")
                    })
                    it("can add at head being the root node", function() {        
                        // └─ 0  ⇨  ├─ 1
                        //          └─ 0
                        tree.addSiblingBefore(0)
                        
                        tree.addSiblingBefore(0)
                        
                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#1", 
                                new Node("#0", undefined, undefined),
                                undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0].node.label).equals("#1")
                        expect(tree.rows[1].node.label).equals("#0")
                    })
                    it("can add between two nodes", function() {        
                        // ├─ 1     ├─ 1
                        // └─ 0  ⇨  ├─ 2
                        //          └─ 0
                        tree.addSiblingBefore(0)
                        tree.addSiblingBefore(0)
                        
                        tree.addSiblingBefore(1)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#1", 
                                new Node("#2", new Node("#0", undefined, undefined), undefined),
                                undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0].node.label).equals("#1")
                        expect(tree.rows[1].node.label).equals("#2")
                        expect(tree.rows[2].node.label).equals("#0")
                    })
                    it("can add at head of children", function() {
                        // └─ 0     ⇨  └─ 0
                        //    └─ 1        ├─ 2
                        //                └─ 1
                        tree.addSiblingBefore(0)
                        tree.addChildAfter(0)

                        tree.addSiblingBefore(1)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined,
                                new Node("#2", new Node("#1", undefined, undefined), undefined))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#2")
                        expect(tree.rows[2].node.label).equals("#1")
                    })
                })
                describe("addSiblingAfter(row: number)", function() {
                    it("can add a root node to an empty table", function() {        
                        //    ⇨  └─ 0
                        tree.addSiblingAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(1)
                        expect(tree.rows[0].node.label).equals("#0")
                    })
                    it("can add after node", function() {
                        // └─ 0  ⇨  ├─ 0
                        //          └─ 1      
                        tree.addSiblingAfter(0)

                        tree.addSiblingAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", new Node("#1", undefined, undefined), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#1")
                    })
                    it("can add between two nodes", function() {
                        // ├─ 0     ├─ 0
                        // └─ 1  ⇨  ├─ 2
                        //          └─ 1
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(0)

                        tree.addSiblingAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", new Node("#2", new Node("#1", undefined, undefined), undefined), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#2")
                        expect(tree.rows[2].node.label).equals("#1")
                    })
                    it("can add after node with children", function() {
                        // └─ 0           ├─ 0
                        //    ├─ 1     ⇨  │  ├─ 1
                        //    │  └─ 2     │  │  └─ 2
                        //    └─ 3        │  └─ 3
                        //                └─ 4
                        tree.addSiblingAfter(0)
                        tree.addChildAfter(0)
                        tree.addChildAfter(1)
                        tree.addSiblingAfter(1)

                        tree.addSiblingAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 4, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0",
                                new Node("#4", undefined, undefined),
                                new Node("#1", 
                                         new Node("#3", undefined, undefined),
                                         new Node("#2", undefined, undefined)
                                )
                            )
                        )

                        // check table
                        expect(tree.rows.length).is.equal(5)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#1")
                        expect(tree.rows[2].node.label).equals("#2")
                        expect(tree.rows[3].node.label).equals("#3")
                        expect(tree.rows[4].node.label).equals("#4")
                    })
                })
                describe("addChildAfter(row: number)", function() {
                    it("can add a root node to an empty table", function() {        
                        //    ⇨  └─ 0
                        tree.addChildAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(1)
                        expect(tree.rows[0].node.label).equals("#0")
                    })
                    it("can add a child to a root node", function() {
                        // └─ 0  ⇨  └─ 0
                        //             └─ 1        
                        tree.addSiblingBefore(0)

                        tree.addChildAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, new Node("#1", undefined, undefined))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#1")
                    })
                    it("can add a child between a root node and it's child", function() { 
                        // └─ 0        └─ 0
                        //    └─ 1  ⇨      └─ 2
                        //                    └─ 1          
                        tree.addSiblingBefore(0)
                        tree.addChildAfter(0)

                        tree.addChildAfter(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, new Node("#2", undefined, new Node("#1", undefined, undefined)))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#2")
                        expect(tree.rows[2].node.label).equals("#1")
                    })
                })
                describe("addParentBefore(row: number)", function() {
                    it("can add a root node to an empty table", function() {        
                        //    ⇨  └─ 0
                        tree.addParentBefore(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(1)
                        expect(tree.rows[0].node.label).equals("#0")
                    })
                    it("add a parent at root", function() {   
                        // └─ 0  ⇨  └─ 1
                        //             └─ 0
                        tree.addSiblingBefore(0)

                        tree.addParentBefore(0)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#1", undefined, new Node("#0", undefined, undefined))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0].node.label).equals("#1")
                        expect(tree.rows[1].node.label).equals("#0")
                    })
                    it("add a parent at head of children", function() {  
                        // └─ 0     ⇨  └─ 0
                        //    └─ 1        └─ 2
                        //                   └─ 1      
                        tree.addSiblingBefore(0)
                        tree.addChildAfter(0)

                        tree.addParentBefore(1)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, new Node("#2", undefined, new Node("#1", undefined, undefined)))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#2")
                        expect(tree.rows[2].node.label).equals("#1")
                    })
                    it("add a parent between children", function() {  
                        // ├─ 0     ├─ 0
                        // ├─ 1  ⇨  ├─ 3
                        // │        │  └─ 1
                        // └─ 2     └─ 2
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(1)

                        tree.addParentBefore(1)

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", new Node("#3", new Node("#2", undefined, undefined), new Node("#1", undefined, undefined)), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(4)
                        expect(tree.rows[0].node.label).equals("#0")
                        expect(tree.rows[1].node.label).equals("#3")
                        expect(tree.rows[2].node.label).equals("#1")
                        expect(tree.rows[3].node.label).equals("#2")
                    })
                })
                describe("deleteAt(row: number)", function() {
                    describe("when children exist, move them up", function() {
                        it("can delete root with child and sibling", function() {
                            // ├─ 0 X      ├─ 1
                            // │  ├─ 1  ⇨  ├─ 2
                            // │  └─ 2     └─ 3
                            // └─ 3
                            tree.addSiblingAfter(0)
                            tree.addChildAfter(0)
                            tree.addSiblingAfter(1)
                            tree.addSiblingAfter(0)

                            tree.deleteAt(0)

                            // check signal
                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 0, 1))

                            // check tree
                            expect(tree.root).to.deep.equal(
                                new Node("#1", new Node("#2", new Node("#3", undefined, undefined), undefined), undefined)
                            )

                            // check table
                            expect(tree.rows.length).is.equal(3)
                            expect(tree.rows[0].node.label).equals("#1")
                            expect(tree.rows[1].node.label).equals("#2")
                            expect(tree.rows[2].node.label).equals("#3")
                        })

                        it("can delete between with child and sibling", function() {
                            // ├─ 0        ├─ 0
                            // ├─ 1 X      ├─ 2
                            // │  └─ 2  ⇨  └─ 3
                            // └─ 3
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(0)
                            tree.addChildAfter(1)
                            tree.addSiblingAfter(1)

                            // dump(this, "before")
                            tree.deleteAt(1)
                            // dump(this, "after")

                            // check signal
                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 1, 1))

                            // check tree
                            expect(tree.root).to.deep.equal(
                                new Node("#0", new Node("#2", new Node("#3", undefined, undefined), undefined), undefined)
                            )

                            // check table
                            expect(tree.rows.length).is.equal(3)
                            expect(tree.rows[0].node.label).equals("#0")
                            expect(tree.rows[1].node.label).equals("#2")
                            expect(tree.rows[2].node.label).equals("#3")
                        })
                    })

                    describe("when no children exist, move siblings upwards", function() {
                        it("can delete root without child and sibling", function() {
                            // ├─ 0 X ⇨  └─ 1
                            // └─ 1
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(0)

                            // console.log(`BEFORE >>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`BEFORE <<<<<<<<<<`)

                            tree.deleteAt(0)

                            // console.log(`AFTER >>>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`AFTER <<<<<<<<<<<`)

                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 0, 1))
                            expect(tree.root).to.deep.equal(
                                new Node("#1", undefined, undefined)
                            )

                            expect(tree.rows.length).is.equal(1)
                        })
                        it("can delete child head without child and sibling", function() {
                            // └─ 0        └─ 0
                            //    ├─ 1 X ⇨    └─ 2
                            //    └─ 2
                            tree.addSiblingAfter(0)
                            tree.addChildAfter(0)
                            tree.addSiblingAfter(1)

                            // console.log(`BEFORE >>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`BEFORE <<<<<<<<<<`)

                            tree.deleteAt(1)

                            // console.log(`AFTER >>>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`AFTER <<<<<<<<<<<`)

                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 1, 1))
                            expect(tree.root).to.deep.equal(
                                new Node("#0", undefined, new Node("#2", undefined, undefined))
                            )

                            expect(tree.rows.length).is.equal(2)
                        })
                        it("can delete between without child and sibling", function() {
                            // ├─ 0        ├─ 0
                            // ├─ 1 X ⇨    └─ 2
                            // └─ 2
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(1)

                            // console.log(`BEFORE >>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`BEFORE <<<<<<<<<<`)

                            tree.deleteAt(1)

                            // console.log(`AFTER >>>>>>>>>>>`)
                            // tree.root!.print()
                            // console.log(`AFTER <<<<<<<<<<<`)

                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 1, 1))
                            expect(tree.root).to.deep.equal(
                                new Node("#0", new Node("#2", undefined, undefined), undefined)
                            )

                            expect(tree.rows.length).is.equal(2)
                        })
                    })
                })
            })
        })
    })


})
