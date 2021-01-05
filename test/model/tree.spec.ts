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
    describe("model", function() {
        describe("tree", function() {
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
                let tree: TreeNodeModel<Node>

                function dump(ctx: Mocha.Context, reason: string) {
                    console.log(`${ctx.test?.title}: ${reason} >>>>>>>>>>>`)
                    tree.root!.print()
                    for(let i in tree.rows) {
                        console.log(`tree.rows[${i}]: depth = ${tree.rows[i].depth}, label='${tree.rows[i].node.label}'`)
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#1"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#0"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#1"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#2"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 0, node: {label: "#0"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#2"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 1, node: {label: "#1"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#1"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#2"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 0, node: {label: "#1"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#1"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 2, node: {label: "#2"} })
                        expect(tree.rows[3]).to.containSubset({ depth: 1, node: {label: "#3"} })
                        expect(tree.rows[4]).to.containSubset({ depth: 0, node: {label: "#4"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                    })
                    it("can add a child to a root node", function() {
                        // └─ 0  ⇨  └─ 0
                        //             └─ 1        
                        tree.addSiblingBefore(0)

                        // dump(this, "BEFORE")
                        tree.addChildAfter(0)
                        // dump(this, "AFTER")

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", undefined, new Node("#1", undefined, undefined))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#1"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#2"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 2, node: {label: "#1"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                    })
                    it("add a parent at root", function() {   
                        // └─ 0  ⇨  └─ 1
                        //             └─ 0
                        tree.addSiblingBefore(0)

                        // dump(this, "BEFORE")
                        tree.addParentBefore(0)
                        // dump(this, "AFTER")

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 0, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#1", undefined, new Node("#0", undefined, undefined))
                        )

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#1"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#0"} })
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
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#2"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 2, node: {label: "#1"} })
                    })
                    it("add a parent between children", function() {  
                        // ├─ 0     ├─ 0
                        // ├─ 1  ⇨  ├─ 3
                        // │        │  └─ 1
                        // └─ 2     └─ 2
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(1)

                        // dump(this, "BEFORE")
                        tree.addParentBefore(1)
                        // dump(this, "AFTER")

                        // check signal
                        expect(event).to.deep.equal(new TableEvent(TableEventType.INSERT_ROW, 1, 1))

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", new Node("#3", new Node("#2", undefined, undefined), new Node("#1", undefined, undefined)), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(4)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#3"} })
                        expect(tree.rows[2]).to.containSubset({ depth: 1, node: {label: "#1"} })
                        expect(tree.rows[3]).to.containSubset({ depth: 0, node: {label: "#2"} })
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
                            expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#1"} })
                            expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#2"} })
                            expect(tree.rows[2]).to.containSubset({ depth: 0, node: {label: "#3"} })
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
                            expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                            expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#2"} })
                            expect(tree.rows[2]).to.containSubset({ depth: 0, node: {label: "#3"} })
                        })
                    })

                    describe("when no children exist, move siblings upwards", function() {
                        it("can delete root without child and sibling", function() {
                            // ├─ 0 X ⇨  └─ 1
                            // └─ 1
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(0)

                            tree.deleteAt(0)

                            // check signal
                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 0, 1))

                            // check tree
                            expect(tree.root).to.deep.equal(
                                new Node("#1", undefined, undefined)
                            )

                            // check table
                            expect(tree.rows.length).is.equal(1)
                            expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#1"} })
                        })
                        it("can delete child head without child and sibling", function() {
                            // └─ 0        └─ 0
                            //    ├─ 1 X ⇨    └─ 2
                            //    └─ 2
                            tree.addSiblingAfter(0)
                            tree.addChildAfter(0)
                            tree.addSiblingAfter(1)

                            tree.deleteAt(1)

                            // check signal
                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 1, 1))

                            // check tree
                            expect(tree.root).to.deep.equal(
                                new Node("#0", undefined, new Node("#2", undefined, undefined))
                            )

                            // check table
                            expect(tree.rows.length).is.equal(2)
                            expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                            expect(tree.rows[1]).to.containSubset({ depth: 1, node: {label: "#2"} })
                        })
                        it("can delete between without child and sibling", function() {
                            // ├─ 0        ├─ 0
                            // ├─ 1 X ⇨    └─ 2
                            // └─ 2
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(0)
                            tree.addSiblingAfter(1)

                            tree.deleteAt(1)

                            // check signal
                            expect(event).to.deep.equal(new TableEvent(TableEventType.REMOVED_ROW, 1, 1))

                            // check tree
                            expect(tree.root).to.deep.equal(
                                new Node("#0", new Node("#2", undefined, undefined), undefined)
                            )

                            // check table
                            expect(tree.rows.length).is.equal(2)
                            expect(tree.rows[0]).to.containSubset({ depth: 0, node: {label: "#0"} })
                            expect(tree.rows[1]).to.containSubset({ depth: 0, node: {label: "#2"} })
                        })
                    })
                })
            })
        })
    })
})
