import { expect, use } from "chai"
import { chaiSubset } from "../../chaiSubset"
use(chaiSubset)

import { TextModel, TreeNodeModel, TableEvent } from "@toad"
import { INSERT_ROW, REMOVE_ROW } from "@toad/table/TableEvent"

describe("model", function () {
    describe("table", function () {
        describe("class TreeNodeModel manages a tree consisting of nodes with next and down pointers", function () {
            class Node {
                label: string
                next?: Node
                down?: Node
                constructor(label?: string, next?: Node, down?: Node) {
                    if (label === undefined) this.label = `#${counter++}`
                    else this.label = label
                    this.next = next
                    this.down = down
                }
                print(indent = 0) {
                    console.log(`${"  ".repeat(indent)} ${this.label}`)
                    if (this.down) this.down.print(indent + 1)
                    if (this.next) this.next.print(indent)
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
                for (let i in tree.rows) {
                    if (tree.rows[i] === undefined) {
                        console.log(`tree.rows[${i}]: undefined`)
                    } else if (tree.rows[i].node === undefined) {
                        console.log(`tree.rows[${i}]: depth = ${tree.rows[i].depth}, node=undefined'`)
                    } else {
                        console.log(
                            `tree.rows[${i}]: depth = ${tree.rows[i].depth}, label='${tree.rows[i].node.label}'`
                        )
                    }
                }
                console.log(`${ctx.test?.title}: ${reason} <<<<<<<<<<<`)
            }

            beforeEach(function () {
                counter = 0
                event = undefined
                tree = new MyTreeModel(Node)
                tree.signal.add((e) => {
                    event = e
                })
            })

            describe("constructor", function () {
                it("initialises from an existing tree", function () {
                    const root = new Node("#0")
                    root.down = new Node("#1")
                    root.down.next = new Node("#2")
                    root.next = new Node("#3")
                    tree = new MyTreeModel(Node, root)

                    expect(tree.rows.length).is.equal(2)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#3" } })
                })
            })

            describe("addSiblingBefore(row: number)", function () {
                it("can add a root node to an empty table", function () {
                    //    ⇨  └─ 0
                    tree.addSiblingBefore(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", undefined, undefined))

                    // check table
                    expect(tree.rows.length).is.equal(1)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("can add at head being the root node", function () {
                    // └─ 0  ⇨  ├─ 1
                    //          └─ 0
                    tree.addSiblingBefore(0)

                    tree.addSiblingBefore(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#1", new Node("#0", undefined, undefined), undefined))

                    // check table
                    expect(tree.rows.length).is.equal(2)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#1" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("can add between two nodes", function () {
                    // ├─ 1     ├─ 1
                    // └─ 0  ⇨  ├─ 2
                    //          └─ 0
                    tree.addSiblingBefore(0)
                    tree.addSiblingBefore(0)

                    tree.addSiblingBefore(1)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node("#1", new Node("#2", new Node("#0", undefined, undefined), undefined), undefined)
                    )

                    // check table
                    expect(tree.rows.length).is.equal(3)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#1" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#2" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("can add at head of children", function () {
                    // └─ 0     ⇨  └─ 0
                    //    └─ 1        ├─ 2
                    //                └─ 1
                    tree.addSiblingBefore(0)
                    tree.addChildAfter(0)

                    tree.addSiblingBefore(1)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node("#0", undefined, new Node("#2", new Node("#1", undefined, undefined), undefined))
                    )

                    // check table
                    expect(tree.rows.length).is.equal(3)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#2" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 1, node: { label: "#1" } })
                })
            })

            describe("addSiblingAfter(row: number)", function () {
                it("can add a root node to an empty table", function () {
                    //    ⇨  └─ 0
                    tree.addSiblingAfter(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", undefined, undefined))

                    // check table
                    expect(tree.rows.length).is.equal(1)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("can add after node", function () {
                    // └─ 0  ⇨  ├─ 0
                    //          └─ 1
                    tree.addSiblingAfter(0)

                    tree.addSiblingAfter(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", new Node("#1", undefined, undefined), undefined))

                    // check table
                    expect(tree.rows.length).is.equal(2)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#1" } })
                })
                it("can add between two nodes", function () {
                    // ├─ 0     ├─ 0
                    // └─ 1  ⇨  ├─ 2
                    //          └─ 1
                    tree.addSiblingAfter(0)
                    tree.addSiblingAfter(0)

                    tree.addSiblingAfter(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node("#0", new Node("#2", new Node("#1", undefined, undefined), undefined), undefined)
                    )

                    // check table
                    expect(tree.rows.length).is.equal(3)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#2" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 0, node: { label: "#1" } })
                })
                it("can add after node with children", function () {
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
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 4, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node(
                            "#0",
                            new Node("#4", undefined, undefined),
                            new Node("#1", new Node("#3", undefined, undefined), new Node("#2", undefined, undefined))
                        )
                    )

                    // check table
                    expect(tree.rows.length).is.equal(5)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#1" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 2, node: { label: "#2" } })
                    expect(tree.rows[3]).to.containSubset({ depth: 1, node: { label: "#3" } })
                    expect(tree.rows[4]).to.containSubset({ depth: 0, node: { label: "#4" } })
                })
            })

            describe("addChildAfter(row: number)", function () {
                it("can add a root node to an empty table", function () {
                    //    ⇨  └─ 0
                    tree.addChildAfter(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", undefined, undefined))

                    // check table
                    expect(tree.rows.length).is.equal(1)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("can add a child to a root node", function () {
                    // └─ 0  ⇨  └─ 0
                    //             └─ 1
                    tree.addSiblingBefore(0)

                    // dump(this, "BEFORE")
                    tree.addChildAfter(0)
                    // dump(this, "AFTER")

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", undefined, new Node("#1", undefined, undefined)))

                    // check table
                    expect(tree.rows.length).is.equal(2)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#1" } })
                })
                it("can add a child between a root node and it's child", function () {
                    // └─ 0        └─ 0
                    //    └─ 1  ⇨      └─ 2
                    //                    └─ 1
                    tree.addSiblingBefore(0)
                    tree.addChildAfter(0)

                    tree.addChildAfter(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node("#0", undefined, new Node("#2", undefined, new Node("#1", undefined, undefined)))
                    )

                    // check table
                    expect(tree.rows.length).is.equal(3)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#2" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 2, node: { label: "#1" } })
                })
            })

            describe("addParentBefore(row: number)", function () {
                it("can add a root node to an empty table", function () {
                    //    ⇨  └─ 0
                    tree.addParentBefore(0)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#0", undefined, undefined))

                    // check table
                    expect(tree.rows.length).is.equal(1)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                })
                it("add a parent at root", function () {
                    // └─ 0  ⇨  └─ 1
                    //             └─ 0
                    tree.addSiblingBefore(0)

                    // dump(this, "BEFORE")
                    tree.addParentBefore(0)
                    // dump(this, "AFTER")

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 0, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(new Node("#1", undefined, new Node("#0", undefined, undefined)))

                    // check table
                    expect(tree.rows.length).is.equal(2)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#1" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#0" } })
                })
                it("add a parent at head of children", function () {
                    // └─ 0     ⇨  └─ 0
                    //    └─ 1        └─ 2
                    //                   └─ 1
                    tree.addSiblingBefore(0)
                    tree.addChildAfter(0)

                    tree.addParentBefore(1)

                    // check signal
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node("#0", undefined, new Node("#2", undefined, new Node("#1", undefined, undefined)))
                    )

                    // check table
                    expect(tree.rows.length).is.equal(3)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#2" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 2, node: { label: "#1" } })
                })
                it("add a parent between children", function () {
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
                    expect(event).to.deep.equal({ type: INSERT_ROW, index: 1, size: 1 })

                    // check tree
                    expect(tree.root).to.deep.equal(
                        new Node(
                            "#0",
                            new Node("#3", new Node("#2", undefined, undefined), new Node("#1", undefined, undefined)),
                            undefined
                        )
                    )

                    // check table
                    expect(tree.rows.length).is.equal(4)
                    expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                    expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#3" } })
                    expect(tree.rows[2]).to.containSubset({ depth: 1, node: { label: "#1" } })
                    expect(tree.rows[3]).to.containSubset({ depth: 0, node: { label: "#2" } })
                })
            })
            describe("deleteAt(row: number)", function () {
                describe("when children exist, move them up", function () {
                    it("can delete root with child and sibling", function () {
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
                        expect(event).to.deep.equal({ type: REMOVE_ROW, index: 0, size: 1 })

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#1", new Node("#2", new Node("#3", undefined, undefined), undefined), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#1" } })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#2" } })
                        expect(tree.rows[2]).to.containSubset({ depth: 0, node: { label: "#3" } })
                    })
                    it("can delete between with child and sibling", function () {
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
                        expect(event).to.deep.equal({ type: REMOVE_ROW, index: 1, size: 1 })

                        // check tree
                        expect(tree.root).to.deep.equal(
                            new Node("#0", new Node("#2", new Node("#3", undefined, undefined), undefined), undefined)
                        )

                        // check table
                        expect(tree.rows.length).is.equal(3)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#2" } })
                        expect(tree.rows[2]).to.containSubset({ depth: 0, node: { label: "#3" } })
                    })
                })

                describe("when no children exist, move siblings upwards", function () {
                    it("can delete root without child and sibling", function () {
                        // ├─ 0 X ⇨  └─ 1
                        // └─ 1
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(0)

                        tree.deleteAt(0)

                        // check signal
                        expect(event).to.deep.equal({ type: REMOVE_ROW, index: 0, size: 1 })

                        // check tree
                        expect(tree.root).to.deep.equal(new Node("#1", undefined, undefined))

                        // check table
                        expect(tree.rows.length).is.equal(1)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#1" } })
                    })
                    it("can delete child head without child and sibling", function () {
                        // └─ 0        └─ 0
                        //    ├─ 1 X ⇨    └─ 2
                        //    └─ 2
                        tree.addSiblingAfter(0)
                        tree.addChildAfter(0)
                        tree.addSiblingAfter(1)

                        tree.deleteAt(1)

                        // check signal
                        expect(event).to.deep.equal({ type: REMOVE_ROW, index: 1, size: 1 })

                        // check tree
                        expect(tree.root).to.deep.equal(new Node("#0", undefined, new Node("#2", undefined, undefined)))

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                        expect(tree.rows[1]).to.containSubset({ depth: 1, node: { label: "#2" } })
                    })
                    it("can delete between without child and sibling", function () {
                        // ├─ 0        ├─ 0
                        // ├─ 1 X ⇨    └─ 2
                        // └─ 2
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(0)
                        tree.addSiblingAfter(1)

                        tree.deleteAt(1)

                        // check signal
                        expect(event).to.deep.equal({ type: REMOVE_ROW, index: 1, size: 1 })

                        // check tree
                        expect(tree.root).to.deep.equal(new Node("#0", new Node("#2", undefined, undefined), undefined))

                        // check table
                        expect(tree.rows.length).is.equal(2)
                        expect(tree.rows[0]).to.containSubset({ depth: 0, node: { label: "#0" } })
                        expect(tree.rows[1]).to.containSubset({ depth: 0, node: { label: "#2" } })
                    })
                })
            })

            describe("toggleAt(row: number)", function () {
                it("getVisibleChildCount(row: number)", function () {
                    // ├─ 0
                    // │  ├─ 1
                    // │  │  ├─ 2
                    // │  │  └─ 3
                    // │  └─ 4
                    // │     └─ 5
                    // └─ 6
                    tree.addSiblingAfter(0)
                    tree.addChildAfter(0)
                    tree.addChildAfter(1)
                    tree.addSiblingAfter(2)
                    tree.addSiblingAfter(1)
                    tree.addChildAfter(4)
                    tree.addSiblingAfter(0)

                    expect(tree.getVisibleChildCount(6)).to.equal(0)
                    expect(tree.getVisibleChildCount(5)).to.equal(0)
                    expect(tree.getVisibleChildCount(4)).to.equal(1)
                    expect(tree.getVisibleChildCount(3)).to.equal(0)
                    expect(tree.getVisibleChildCount(2)).to.equal(0)
                    expect(tree.getVisibleChildCount(1)).to.equal(2)
                    expect(tree.getVisibleChildCount(0)).to.equal(5)

                    // ├─ 0
                    // │  ├─ 1
                    // │  └─ 2
                    // │     └─ 3
                    // └─ 4
                    tree.toggleAt(1)
                    expect(tree.getVisibleChildCount(4)).to.equal(0)
                    expect(tree.getVisibleChildCount(3)).to.equal(0)
                    expect(tree.getVisibleChildCount(2)).to.equal(1)
                    expect(tree.getVisibleChildCount(1)).to.equal(0)
                    expect(tree.getVisibleChildCount(0)).to.equal(3)
                })
                it("close removes rows, open adds rows", function () {
                    // ├─ 0
                    // │  ├─ 1
                    // │  │  ├─ 2
                    // │  │  └─ 3
                    // │  └─ 4
                    // │     └─ 5
                    // └─ 6
                    tree.addSiblingAfter(0)
                    tree.addChildAfter(0)
                    tree.addChildAfter(1)
                    tree.addSiblingAfter(2)
                    tree.addSiblingAfter(1)
                    tree.addChildAfter(4)
                    tree.addSiblingAfter(0)

                    expect(tree.rows.length).to.equal(7)
                    expect(tree.rows[1].open).to.equal(true)
                    expect(tree.rows[1].node.label).to.equal("#1")
                    expect(tree.rows[2].node.label).to.equal("#2")

                    tree.toggleAt(1)

                    expect(tree.rows.length).to.equal(5)
                    expect(tree.rows[1].open).to.equal(false)
                    expect(tree.rows[1].node.label).to.equal("#1")
                    expect(tree.rows[2].node.label).to.equal("#4")

                    tree.toggleAt(1)
                    // dump(this, "xxx")

                    expect(tree.rows.length).to.equal(7)
                    expect(tree.rows[1].open).to.equal(true)
                    expect(tree.rows[1].node.label).to.equal("#1")
                    expect(tree.rows[2].node.label).to.equal("#2")
                })
                xit("do not overlap tree cell with input div", function () {
                    // 1st there's some list of events to reach this state
                    // the input overlay should only be visible/placed when there is an editCell provided by the adapter
                    // to ease debugging, code has been tweak to use opacity 0.5 instead of 0 and a red background
                    // was reproduced by opening/closing row 0 very fast, then clicking in 4?
                    // animateStep -> replaceChild gives: NotFoundError: The object can not be found here
                    // 30 updateViewAfterInsertRow: adjustToCell() messages
                    // haven't I done something with the display option as it's visible...?
                    // can i make the input overlay transparent for input too? what the heck am i doing here anyway?
                    // here's an idea for the animation: put it into an object, add a replace() method to it,
                    // which will jump to the animations and on the next animation frame and jump into the animation
                    // provided by the next animation. we could also use the earlier animations number of steps already
                    // passed to use them for the duration of the next animation. (which is for the key up/down stuff)
                })
                xit("fast open/close with mouse breaks table update", function () {})
                // cursor up & down should just skip the animation if it ain't fast enough or
                // adjust the scroll speed dynamically (whew! over-engineering)

                // we have a related issues here with the open/close animation...

                // if a new animation comes up, just skip to it's end?

                // custom algorithm to scroll the whole table into view as the built-in ones ain't nice
                // select tree row, followed by implementing TableTool tree buttons
            })
        })
    })
})
