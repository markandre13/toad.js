import { expect } from '@esm-bundle/chai'

import { bindModel, unbind, refs, TableEditMode } from "@toad"

import { Table } from '@toad/table/Table'
import { TablePos } from "@toad/table/TablePos"

import { TreeNode } from "@toad/table/model/TreeNode"
import { TreeModel } from "@toad/table/model/TreeModel"
import { TreeNodeModel } from "@toad/table/model/TreeNodeModel"
import { TreeAdapter } from "@toad/table/adapter/TreeAdapter"
import { SpreadsheetModel } from '@toad/table/model/SpreadsheetModel'
import { SpreadsheetCell } from '@toad/table/model/SpreadsheetCell'

import { ArrayModel } from '@toad/table/model/ArrayModel'
import { TableAdapter, EditMode } from '@toad/table/adapter/TableAdapter'
import { ArrayAdapter } from "@toad/table/adapter/ArrayAdapter"
import { SpreadsheetAdapter } from '@toad/table/adapter/SpreadsheetAdapter'

import { TableFriend } from '@toad/table/private/TableFriend'

import { TextModel } from "@toad/model/TextModel"
import { NumberModel } from "@toad/model/NumberModel"
import { Text } from "@toad/view/Text"
import { Slider } from "@toad/view/Slider"
import { Tab, Tabs } from '@toad/view/Tab'

import { span, input, text } from "@toad/util/lsx"

import { style as txBase } from "@toad/style/tx"
import { style as txStatic } from "@toad/style/tx-static"
import { style as txDark } from "@toad/style/tx-dark"

import { sleep, tabForward, tabBackward, getById, getByText, click, type, keyboard, activeElement, px2float } from "../testlib"
import {
    validateRender, TestModel, getTable,
    prepareByRows, flatMapRows, prepareByColumns, flatMapColumns, Measure, bodyRowInfo, testTableLayout
} from "./util"
import { Animator, AnimationBase } from '@toad/util/animation'

import { InsertRowAnimation } from '@toad/table/private/InsertRowAnimation'
import { SelectionModel } from '@toad/table/model/SelectionModel'
import { hasFocus } from '@toad/util/dom'

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [X] tab in/out of table
// [X] edit on enter
// [X] display error
// [ ] tree view
//   [X] add 'seamless' option to TableAdapter (formerly known as 'compact')
//   [X] fix that opening and closing several times make the row smaller and smaller
//   [ ] don't let the scrollbars flicker (e.g. place the splitBody inside this.root instead of this.body?)
//   [X] hide below bottom when shrinking
//   [ ] hide behind right side when shrinking
//   [ ] space bar to open/close node with focus
// [X] insert more than one row/column
// [ ] edit on focus
// [ ] no edit
// [ ] row select mode
// [ ] adjust selection, caret, after insert/remove row/column !!!
// [ ] adjust table tool to indicate available commands !!

// [ ] header glitches
// [ ] restrict minimal table size to at least one row or one column
// [ ] make table sizing more dynamic
//   [ ] never exceed the max width of the parent
//   [ ] if width smaller than max width of parent, become smaller unless overridden by style
//       (can we add some css in the element which can be overridden by element & page css?)

// [ ] update doc
// [ ] adjust other repositories to new table & style
// [ ] publish version 0.1.0

// FIXME: use the 'with data' for all tests because with or without data is a property of the model, not the view

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Animator.halt = false
        AnimationBase.animationFrameCount = 1
        // InsertRowAnimation.halt = false
        document.head.replaceChildren(txBase, txStatic, txDark)
    })

    describe("render", function () {
        it("render model", async function () {
            const model = createModel(4, 4)
            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            await sleep()
            validateRender(model)
        })

        it("with headers: render model", async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true
            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            await sleep()
            validateRender(model)
        })
    })

    describe("Table Examples", function () {
        it("display array of objects (using ArrayAdapter)", function () {
            // Domain Layer
            class Book {
                title: string = ""
                author: string = ""
                year: number = 1970
            }

            const bookList = [
                { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
                { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
                { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
                { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
                { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
                { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
                { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
                { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
            ]

            // Application Layer
            const model = new ArrayModel<Book>(bookList, Book)
            class BookAdapter extends ArrayAdapter<ArrayModel<Book>> {
                override getColumnHeads() { return ["Title", "Author", "Year"] }
                override getRow(book: Book) { return refs(book, "title", "author", "year") }
            }
            TableAdapter.register(BookAdapter, ArrayModel, Book)

            // View Layer
            document.body.replaceChildren(<Table style={{ width: `720px`, height: `350px` }} model={model} />)

            // TODO: add some test
        })
        it("display array of objects (custom adapter)", function () {
            // Domain Layer
            class Book {
                title: string = ""
                author: string = ""
                year: number = 1970
            }

            const bookList = [
                { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
                { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
                { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
                { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
                { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
                { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
                { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
                { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
            ]

            // Application Layer
            const model = new ArrayModel<Book>(bookList, Book)
            class BookAdapter extends TableAdapter<ArrayModel<Book>> {
                constructor(model: ArrayModel<Book>) { super(model) }
                override get colCount(): number { return 3 }
                override getColumnHead(col: number): Node | undefined {
                    switch (col) {
                        case 0: return text("Title")
                        case 1: return text("Author")
                        case 2: return text("Year")
                    }
                }
                override getRowHead(row: number): Node | undefined { return text(`${row + 1}`) }
                override showCell(pos: TablePos, cell: HTMLSpanElement) {
                    switch (pos.col) {
                        case 0:
                            cell.replaceChildren(text(this.model?.data[pos.row].title!))
                            break
                        case 1:
                            cell.replaceChildren(text(this.model?.data[pos.row].author!))
                            break
                        case 2:
                            cell.replaceChildren(text(`${this.model?.data[pos.row].year}`))
                            break
                    }
                }
            }
            TableAdapter.register(BookAdapter, ArrayModel, Book)

            // View Layer
            document.body.replaceChildren(<Table style={{ width: `720px`, height: `350px` }} model={model} />)

            // TODO: add some test
        })
        it("display and edit array of objects (custom adapter, EDIT_ON_ENTER)", async function () {
            // Domain Layer
            class Book {
                title: string = ""
                author: string = ""
                year: number = 1970
            }

            const bookList = [
                { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
                { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
                { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
                { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
                { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
                { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
                { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
                { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
            ]

            // Application Layer
            const model = new ArrayModel<Book>(bookList, Book)
            class BookAdapter extends TableAdapter<ArrayModel<Book>> {
                constructor(model: ArrayModel<Book>) {
                    super(model)
                    this.config.editMode = EditMode.EDIT_ON_ENTER
                }
                override get colCount(): number { return 3 }
                override getColumnHead(col: number): Node | undefined {
                    switch (col) {
                        case 0: return text("Title")
                        case 1: return text("Author")
                        case 2: return text("Year")
                    }
                }
                override getRowHead(row: number): Node | undefined { return text(`${row + 1}`) }
                override showCell(pos: TablePos, cell: HTMLSpanElement) {
                    switch (pos.col) {
                        case 0:
                            cell.replaceChildren(text(this.model?.data[pos.row].title!))
                            break
                        case 1:
                            cell.replaceChildren(text(this.model?.data[pos.row].author!))
                            break
                        case 2:
                            cell.replaceChildren(text(`${this.model?.data[pos.row].year}`))
                            break
                    }
                }
                override saveCell(pos: TablePos, cell: HTMLSpanElement) {
                    const row = this.model!.data[pos.row]
                    switch (pos.col) {
                        case 0: row.title = cell.innerText; break
                        case 1: row.author = cell.innerText; break
                        case 2: row.year = parseInt(cell.innerText); break
                    }
                }
            }
            TableAdapter.register(BookAdapter, ArrayModel, Book)

            // for now the EDIT_ON_ENTER code only works when in SELECT_CELL
            const selectionModel = new SelectionModel(TableEditMode.SELECT_CELL)

            // View Layer
            document.body.replaceChildren(
                <Table
                    style={{ width: `720px`, height: `350px` }}
                    model={model}
                    selectionModel={selectionModel}
                />
            )

            // Test
            await sleep()

            const c0r1 = getByText("Stranger In A Strange Land") as HTMLSpanElement
            expect(c0r1).to.not.be.undefined

            click(c0r1)
            expect(hasFocus(c0r1)).to.be.true

            keyboard({ key: "Enter" }) // enter edit mode

            type("Hello", true)

            keyboard({ key: "Enter" }) // leave edit mode and jump to next cell
            expect(hasFocus(c0r1)).to.be.false

            expect(model.data[1].title).to.equal("Hello")
        })
        it("display and edit array of objects (custom adapter, EDIT_ON_FOCUS)", async function () {
            // Domain Layer
            class Book {
                title: string = ""
                author: string = ""
                year: number = 1970
            }

            const bookList = [
                { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
                { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
                { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
                { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
                { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
                { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
                { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
                { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
            ]

            // Application Layer
            const model = new ArrayModel<Book>(bookList, Book)
            class BookAdapter extends TableAdapter<ArrayModel<Book>> {
                constructor(model: ArrayModel<Book>) {
                    super(model)
                    this.config.editMode = EditMode.EDIT_ON_FOCUS
                }
                override get colCount(): number { return 3 }
                override getColumnHead(col: number): Node | undefined {
                    switch (col) {
                        case 0: return text("Title")
                        case 1: return text("Author")
                        case 2: return text("Year")
                    }
                }
                override getRowHead(row: number): Node | undefined { return text(`${row + 1}`) }
                override showCell(pos: TablePos, cell: HTMLSpanElement) {
                    switch (pos.col) {
                        case 0:
                            cell.replaceChildren(text(this.model?.data[pos.row].title!))
                            break
                        case 1:
                            cell.replaceChildren(text(this.model?.data[pos.row].author!))
                            break
                        case 2:
                            cell.replaceChildren(text(`${this.model?.data[pos.row].year}`))
                            break
                    }
                }
                override saveCell(pos: TablePos, cell: HTMLSpanElement) {
                    const row = this.model!.data[pos.row]
                    switch (pos.col) {
                        case 0: row.title = cell.innerText; break
                        case 1: row.author = cell.innerText; break
                        case 2: row.year = parseInt(cell.innerText); break
                    }
                }
            }
            TableAdapter.register(BookAdapter, ArrayModel, Book)

            // for now the EDIT_ON_ENTER code only works when in SELECT_CELL
            const selectionModel = new SelectionModel(TableEditMode.SELECT_CELL)

            // View Layer
            document.body.replaceChildren(
                <Table
                    style={{ width: `720px`, height: `350px` }}
                    model={model}
                    selectionModel={selectionModel}
                />
            )

            // Test
            await sleep()

            const c0r1 = getByText("Stranger In A Strange Land") as HTMLSpanElement
            expect(c0r1).to.not.be.undefined

            click(c0r1)
            // expect(hasFocus(c0r1)).to.be.true

            // keyboard({ key: "Enter" }) // enter edit mode

            type("Hello", true)

            keyboard({ key: "Enter" }) // leave edit mode and jump to next cell
            // // expect(hasFocus(c0r1)).to.be.false

            expect(model.data[1].title).to.equal("Hello")
        })
        it("display and edit array of objects (custom adapter, cell contains elements)", async function () {
            // Domain Layer
            class Book {
                title: TextModel
                author: TextModel
                year: NumberModel
                constructor(title: string = "", author: string = "", year: number = 1970) {
                    this.title = new TextModel(title)
                    this.author = new TextModel(author)
                    this.year = new NumberModel(year)
                }
            }

            const bookList = [
                { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
                { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
                { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
                { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
                { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
                { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
                { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
                { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
            ].map(book => new Book(book.title, book.author, book.year))

            // Application Layer
            const model = new ArrayModel<Book>(bookList, Book)
            class BookAdapter extends TableAdapter<ArrayModel<Book>> {
                constructor(model: ArrayModel<Book>) {
                    super(model)
                    this.config.editMode = EditMode.EDIT_ON_FOCUS
                }
                override get colCount(): number { return 1 }
                override getRowHead(row: number): Node | undefined { return text(`${row + 1}`) }
                override showCell(pos: TablePos, cell: HTMLSpanElement) {
                    cell.replaceChildren(
                        <Text model={model.data[pos.row].title} style={{ width: "100px" }} />,
                        <Text model={model.data[pos.row].author} style={{ width: "100px" }} />,
                        <Text model={model.data[pos.row].year} style={{ width: "50px" }}/>
                    )
                }
            }
            TableAdapter.register(BookAdapter, ArrayModel, Book)

            // for now the EDIT_ON_ENTER code only works when in SELECT_CELL
            const selectionModel = new SelectionModel(TableEditMode.SELECT_CELL)

            // View Layer
            document.body.replaceChildren(
                <Table
                    style={{ width: `720px`, height: `350px` }}
                    model={model}
                    selectionModel={selectionModel}
                />
            )

            // Test
            await sleep()

            const c0r1 = getByText("Stranger In A Strange Land") as HTMLSpanElement
            expect(c0r1).to.not.be.undefined

            click(c0r1)
            expect(hasFocus(c0r1)).to.be.true

            // type("Hello", true)
            c0r1.setAttribute("value", "Hello")

            keyboard({ key: "Enter" }) // leave edit mode and jump to next cell
            // expect(hasFocus(c0r1)).to.be.false

            expect(model.data[1].title.value).to.equal("Hello")
        })
    })

    describe("event", function () {
        xit("test", async function () {
            let i0, i1, i2

            await sleep()
            for (let i = 0; i < 3; ++i) {
                const element = input()
                for (let type of ["focusin", "focusout", "focus", "blur", "pointerdown", "pointerup", "keydown", "keyup"]) {
                    element.addEventListener(type as any, (ev: FocusEvent) => {
                        console.log(`========== i${i} ${ev.type} ===========`)
                        console.log(ev)
                    })
                }
                document.body.appendChild(element)
            }
        })
    })

    describe("regressions", function () {
        it("JSX renders correctly", async function () {
            const model = createModel(4, 4)
            document.body.replaceChildren(<Table style={{ width: `720px`, height: `350px` }} model={model} />)
            await sleep()
            validateRender(model)
        })
        it("HTML renders correctly", async function () {
            const model = createModel(4, 4)
            document.body.innerHTML = `<tx-table model="model" style="width: 720px; height: 350px;"></tx-table>`
            await sleep()
            validateRender(model)
        })
        it.only("makehuman.js, pose table, 1st column has size 0", async function () {
            class Bone {
                name: string
                children: Bone[]
                constructor(name: string, children: Bone[]) {
                    this.name = name
                    this.children = children
                }
            }
            class PoseNode implements TreeNode {
                static count = 0
                bone!: Bone
                next?: PoseNode
                down?: PoseNode

                x: NumberModel
                y: NumberModel
                z: NumberModel

                constructor(bone: Bone | undefined = undefined) {
                    this.x = new NumberModel(0, { min: -180, max: 180, step: 5})
                    this.y = new NumberModel(0, { min: -180, max: 180, step: 5 })
                    this.z = new NumberModel(0, { min: -180, max: 180, step: 5 })

                    if (bone === undefined) {
                        return
                    }
                    this.bone = bone
                    bone.children.forEach(childBone => {
                        if (this.down === undefined) {
                            this.down = new PoseNode(childBone)
                        } else {
                            const next = this.down
                            this.down = new PoseNode(childBone)
                            this.down.next = next
                        }
                    })
                }
            }

            // this tells <toad-table> how to render TreeNodeModel<PoseNode>
            class PoseTreeAdapter extends TreeAdapter<PoseNode> {
                constructor(model: TreeNodeModel<PoseNode>) {
                    super(model)
                    this.config.expandColumn = true
                }
                override get colCount(): number {
                    return 2
                }
                override showCell(pos: TablePos, cell: HTMLSpanElement) {
                    if (this.model === undefined) {
                        console.log("no model")
                        return
                    }
                    const node = this.model.rows[pos.row].node
                    switch (pos.col) {
                        case 0:
                            this.treeCell(pos, cell, node.bone.name)
                            break
                        case 1:
                            const x = <>
                                <Text model={node.x} style={{ width: '50px' }} />
                                <Text model={node.y} style={{ width: '50px' }} />
                                <Text model={node.z} style={{ width: '50px' }} />
                            </>
                            cell.replaceChildren(...x)
                            break
                    }
                }
            }

            const bones = new Bone("root", [
                new Bone("pelvis.R", [
                    new Bone("upperleg01.R", [])
                ]),
                new Bone("pelvis.L", [
                    new Bone("upperleg01.L", [])
                ]),
                new Bone("spine05", [
                    new Bone("spine04", [])
                ])
            ])
            const poseNodes = new PoseNode(bones)

            TreeAdapter.register(PoseTreeAdapter, TreeNodeModel, PoseNode)
            const poseControls = new TreeNodeModel(PoseNode, poseNodes)

            document.body.replaceChildren(
                <Tabs>
                    <Tab label="Morph" value="MORPH">WIP</Tab>
                    <Tab label="Pose" value="POSE">
                        <Table style={{
                            width: `720px`,
                            height: `350px`
                        }} model={poseControls} />
                    </Tab>
                </Tabs>
            )
            await sleep()

            // [X] Morph Tab has no bar
            // [X] switching to Pose tab results in first column of width 0
            // [ ] o switch to pose tab
            //     o open root
            //     o switch to morph tab
            //     o switch to pose tab
            //      o close root
            //      => two root nodes appear
        })
        // FIXME: unstable test
        it("insert row into table which already has row and column headers", async function () {
            // AnimationBase.animationFrameCount = 2000
            Animator.halt = false
            const model = await prepareByRows([
                new Measure(1, 32),
                new Measure(4, 64)
            ], { rowHeaders: true, columnHeaders: true })
            await sleep(150)
            // return

            model.insertRow(1, flatMapRows([
                new Measure(2, 48)
            ]))

            // let animation = InsertRowAnimation.current!
            // animation.prepare()
            await sleep(150)
            // animation.arrangeNewRowsInStaging()

            // const table = getTable()
            // expect(table.rowHeads.style.top).to.equal("19px")
            testTableLayout()
        })
        // race condition
        it("insert column into table which already has row and column headers", async function () {
            // AnimationBase.animationFrameCount = 2000
            // Animator.halt = false
            const model = await prepareByColumns([
                new Measure(1, 32),
                new Measure(4, 64)
            ], { rowHeaders: true, columnHeaders: true })
            await sleep(150)
            model.insertColumn(1, flatMapColumns([
                new Measure(2, 48)
            ]))
            // let animation = InsertColumnAnimation.current!
            // animation.prepare()
            await sleep(150)
            // animation.arrangeNewColumnsInStaging()

            // const table = getTable()
            // expect(table.colHeads.style.left).to.equal("21px")

            testTableLayout()
        })
        // FIXME: unstable test
        it("three successive animations fail", async function () {
            // AnimationBase.animationFrameCount = 1
            // Animator.halt = false

            const model = await prepareByRows([
                new Measure(1, 32),
                new Measure(4, 64)
            ], { rowHeaders: true, columnHeaders: true })

            model.insertRow(1, flatMapRows([
                new Measure(2, 48)
            ]))

            await sleep(10)

            model.insertRow(2, flatMapRows([
                new Measure(3, 72),
            ]))

            await sleep(100)

            model.insertRow(2, flatMapRows([
                new Measure(3, 72),
            ]))

            testTableLayout()
        })
        // FIXME: unstable test
        it("layout formerly invisible table (e.g. within tabs)", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `
            <tx-tabs style="width: 100%">
                <tx-tab label="TAB1">
                    This page intentionally left blank.
                </tx-tab>
                <tx-tab label="TAB2">
                    <tx-table model="model"></tx-table>
                </tx-tab>
            </tx-tabs>`
            await sleep()

            const tab2 = getByText("TAB2")!
            click(tab2)

            await sleep(20)
            const c0r0 = getByText("C0R0")!
            const c1r1 = getByText("C1R1")!

            const b0 = c0r0.getBoundingClientRect()
            const b1 = c1r1.getBoundingClientRect()

            expect(b0.width).to.be.greaterThan(10)
            expect(b0.height).to.be.greaterThan(10)

            expect(b0.x + b0.width - 1).to.equal(b1.x)
            expect(b0.y + b0.height - 1).to.equal(b1.y)
        })
    })

    describe("error display", function () {
        it("cycle", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()
            const table = getTable()

            const c0r0 = getByText("C0R0") as HTMLSpanElement
            const c1r0 = getByText("C1R0") as HTMLSpanElement
            const c0r1 = getByText("C0R1") as HTMLSpanElement

            // create cycle
            click(c0r0)
            keyboard({ key: "Enter" })
            type("=8", true)

            click(c1r0)
            keyboard({ key: "Enter" })
            type("=A1*2", true)

            click(c0r1)
            keyboard({ key: "Enter" })
            type("=B1*2", true)

            click(c0r0)
            keyboard({ key: "Enter" })
            type("=A2", true)

            keyboard({ key: "Enter" })

            expect(c0r0.classList.contains("error")).to.be.true
            expect(c1r0.classList.contains("error")).to.be.true
            expect(c0r1.classList.contains("error")).to.be.true

            // break cycle
            click(c0r0)
            keyboard({ key: "Enter" })
            type("=7", true)
            keyboard({ key: "Enter" })

            expect(c0r0.classList.contains("error")).to.be.false
            expect(c1r0.classList.contains("error")).to.be.false
            expect(c0r1.classList.contains("error")).to.be.false
        })
    })

    describe("interaction", function () {
        it("click into cells", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()
            const table = getTable()

            for (let row = 0; row < 2; ++row) {
                for (let col = 0; col < 2; ++col) {
                    const cell = getByText(`C${col}R${row}`)
                    click(cell!)
                    expect(activeElement()).to.equal(cell)
                    expect(table.selection?.value).to.deep.equal({ col, row })
                }
            }
        })

        it("tab forward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[0] as HTMLElement).focus()

            tabForward()

            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })

        it("tab backward into table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[2] as HTMLElement).focus()

            tabBackward()

            const cell = getByText("C1R1")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 1 })
        })

        it("tab to next cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)
            tabForward()

            const cell = getByText("C1R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 0 })
        })
        it("tab to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)
            tabBackward()
            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })
        it("tab forward out of table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            const c1r1 = getByText("C1R1")!
            click(c1r1)
            tabForward()

            expect(activeElement()).to.equal(getById("after"))
        })
        it("tab backward out of table", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<input id="before"/><tx-table model="model"></tx-table><input id="after"/>`
            await sleep()

            click(getByText("C0R0")!)
            tabBackward()

            expect(activeElement()).to.equal(getById("before"))
        })
        it("cursor right to next cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({ key: "ArrowRight" })

            const cell = getByText("C1R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 1, row: 0 })
        })
        xit("cursor right to next row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({ key: "ArrowRight" })

            const cell = getByText("C0R1")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor left to previous cell", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C1R0")!)

            keyboard({ key: "ArrowLeft" })

            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })
        xit("cursor left to previous row", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({ key: "ArrowLeft" })

            const cell = getByText("C1R0")
            expect(cell?.classList.contains("selected")).is.true
        })
        it("cursor up", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R1")!)

            keyboard({ key: "ArrowUp" })

            const cell = getByText("C0R0")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 0 })
        })
        it("cursor down", async function () {
            const model = createModel(2, 2)
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            click(getByText("C0R0")!)

            keyboard({ key: "ArrowDown" })

            const cell = getByText("C0R1")
            expect(activeElement()).to.equal(cell)
            const table = getTable()
            expect(table.selection?.value).to.deep.equal({ col: 0, row: 1 })
        })

        function dumpCell(id: string, cell: SpreadsheetCell) {
            console.log(`${id}: _inputValue=${cell._inputValue} (${typeof cell._inputValue}), _calculatedValue=${cell._calculatedValue} (${typeof cell._calculatedValue}), _error=${cell._error} (${typeof cell._error}), _node=${cell._node} (${typeof cell._node})`)
        }

        // different edit modes: normal, spreadsheet
        describe("edit cell on enter (spreadsheet mode)", function () {
            it("editing an empty cell will result in an empty cell", async function () {
                TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
                const model = new TestSpreadsheetModel(2, 2)
                bindModel("model", model)
                document.body.innerHTML = `<tx-table model="model"></tx-table>`
                await sleep()
                const table = getTable()
                const c0r0 = table.body.children[0]

                click(c0r0)
                expect(c0r0.textContent).to.equal("")

                keyboard({ key: "Enter" })
                expect(c0r0.textContent).to.equal("")

                keyboard({ key: "Enter" })
                expect(c0r0.textContent).to.equal("")
            })

            it("edit cell", async function () {
                const model = createModel(2, 2)
                document.body.innerHTML = `<tx-table model="model"></tx-table>`
                await sleep()
                const table = getTable()

                const c0r0 = getByText("C0R0") as HTMLSpanElement
                const c1r0 = getByText("C1R0") as HTMLSpanElement
                const c0r1 = getByText("C0R1") as HTMLSpanElement

                click(c0r0)
                expect(activeElement()).to.equal(c0r0)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // [enter] starts editing the cell
                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("edit")).is.true
                expect(c0r0.hasAttribute("contenteditable")).to.be.true
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // when there is another row, [enter] saves value and edits next row
                type("= 2 * 3", true)
                expect(c0r0.textContent).to.equal("=2*3")

                keyboard({ key: "Enter" })

                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r0.textContent).to.equal("6")

                expect(c0r1.classList.contains("edit")).is.true
                expect(c0r1.hasAttribute("contenteditable")).to.be.true
                expect(activeElement()).to.equal(c0r1)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })

                type("= A1 * 2", true)

                // when there is no other row, [enter] saves value, and stays in row without editing
                // FIXME: this test does not cover that the code needs stopPropagation(), otherwise
                // switching the focus from the cell to the table will create another 'Enter' event
                // which switches the cell again into edit mode
                keyboard({ key: "Enter" })

                expect(c0r1.classList.contains("edit")).is.false
                expect(c0r1.textContent).to.equal("12")
                expect(activeElement()).to.equal(c0r1)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })

                // we can move to another cell
                keyboard({ key: "ArrowUp" })
                expect(activeElement()).to.equal(c0r0)
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })

                // in edit mode ArrowDown moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowDown" })
                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r0.textContent).to.equal("6")
                expect(c0r1.classList.contains("edit")).is.false
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 1 })
                expect(activeElement()).to.equal(c0r1)

                // in edit mode ArrowUp moves to another cell
                keyboard({ key: "Enter" })
                keyboard({ key: "ArrowUp" })
                expect(c0r0.classList.contains("edit")).is.false
                expect(c0r1.classList.contains("edit")).is.false
                expect(c0r1.textContent).to.equal("12")
                expect(table.selection!.value).to.deep.equal({ col: 0, row: 0 })
                expect(activeElement()).to.equal(c0r0)

                // in edit mode Tab moves to another cell
                // FIXME: test fails but it works in real
                keyboard({ key: "Enter" })
                await sleep(100)
                // console.log("--------------------------")
                // keyboard({ key: "Tab" }) // TODO: this should lead to execute tabForward()
                tabForward()

                await sleep(100)
                expect(c0r0.classList.contains("edit")).is.false
                expect(c1r0.classList.contains("edit")).is.false
                expect(table.selection!.value).to.deep.equal({ col: 1, row: 0 })
                expect(activeElement()).to.equal(c1r0)

                // allow shift + enter to create line break!
            })
        })
    })

    describe("jsx", function () {
        it("table accepts 'model' and 'style' attributes", async function () {
            const model = createModel(4, 4)
            const x = (<>
                <style>{"body{background: #888;}"}</style>
                <Table model={model} style={{ width: '42%' }} />
            </>)
            document.body.replaceChildren(...x)
            await sleep()

            validateRender(model)

            const table = getTable()!
            expect(table.style.width).to.equal("42%")
        })
    })

    describe("layout", function () {
        it("expand", async function () {
            // Table.transitionDuration = "500ms"
            const model = createWidgetTree();
            // TODO
            // * while when a TreeNodeModel is initialized from a populated tree,
            //   all nodes are closed.
            //   but an emtpy tree is used, which is then populated using add*()
            //   methods, all nodes are open
            //   => this should be consistent
            // * the leaf nodes don't render correctly
            (model as TreeModel<any>).collapse()

            document.body.replaceChildren(
                <Table model={model} style={{
                    position: 'absolute',
                    inset: 0,
                }} />
            )
            await sleep()
            const table = getTable().table
            const bounds = table.getBoundingClientRect()
            expect(bounds.width).to.equal(window.innerWidth)
            expect(bounds.height).to.equal(window.innerHeight)
        })
    })

    describe("tree", function () {

        // basically, modelChanged() delegates all the work
        // this.animation = new InsertRowAnimation(this, event)
        // this.animation.run()

        // I shouldn't do this with a tree, but with a normal array for more
        // flexibility

        // this is an incomplete test for the makehuman.js scenario with widgets within the tree
        // todo:
        // * decide whether to throw away
        // * update for new animation implementation
        // * will otherwise work well but look bad because we do not expand the columns
        //   when the tree unfolds, hence displaying only '#' of the label and only part
        //   of one of two controls
        xit("insert row animation (middle)", async function () {
            // Table.transitionDuration = "5000ms"
            // InsertRowAnimation.halt = true

            const model = createTreeModelFromTree()
            document.body.replaceChildren(
                <Table model={model} style={{ position: 'absolute', inset: 0 }} />
            )
            await sleep()
            const table = getTable()

            expect(rowCount(table)).to.equal(2)
            expect(rowPosAndLabelTop(table, 0)).to.equal("0,0: #0")
            expect(rowPosAndLabelTop(table, 1)).to.equal("0,19: #3")

            click(getByText("#0")!.previousElementSibling!)

            const animation = InsertRowAnimation.current!
            animation.prepareCellsToBeMeasured()
            await sleep()

            // move measured cells into the body
            animation.arrangeInStaging()

            // expect(table.body.children.length).to.equal(2 * 4)
            expect(rowPosAndLabelTop(table, 0)).to.equal("0,0: #0")
            expect(rowPosAndLabelTop(table, 1)).to.equal("0,19: #1")
            expect(rowPosAndLabelTop(table, 2)).to.equal("0,78: #2")
            expect(rowPosAndLabelTop(table, 3)).to.equal("0,19: #3")

            // now split at row 3
            animation.split()
            expect(table.body.children.length).to.equal(2 * 3 + 1)
            expect(table.splitBody.children.length).to.equal(2 * 1)
            expect(rowPosAndLabelTop(table, 0)).to.equal("0,0: #0")
            expect(rowPosAndLabelTop(table, 1)).to.equal("0,19: #1")
            expect(rowPosAndLabelTop(table, 2)).to.equal("0,78: #2")

            expect(table.splitBody.style.top).to.equal("19px")
            expect(rowPosAndLabelBottom(table, 0)).to.equal("0,0: #3")

            // animation thingy (should check for transform being to to splitBody)
            expect(animation.totalSize).to.equal(118)

            animation.join()
            expect(table.body.children.length).to.equal(2 * 4)
            expect(rowPosAndLabelTop(table, 0)).to.equal("0,0: #0")
            expect(rowPosAndLabelTop(table, 1)).to.equal("0,19: #1")
            expect(rowPosAndLabelTop(table, 2)).to.equal("0,78: #2")
            expect(rowPosAndLabelTop(table, 3)).to.equal("0,118: #3")
        })

        it("center tree control vertically in row (?)")

        it("expand columns during insert row", async function () {
            // Table.transitionDuration = "500ms"

            // GIVEN an initial tree view
            const model = createTreeModelFromTree()
            document.body.replaceChildren(
                <Table model={model} style={{ position: 'absolute', inset: 0 }} />
            )
            await sleep()
            const table = getTable()
            table.adapter.config.expandColumn = true

            // THEN it renders correctly
            expect(rowLabel(table, 0)).to.equal("#0")
            expect(rowLabel(table, 1)).to.equal("#3")
            expect(rowCount(table)).to.equal(2)
            validateRender(model)

            // WHEN opening the 1st node
            // click(getByText("#0")!.previousElementSibling!)

            // await table.animation()
        })

    })
})

function createModel(cols: number, rows: number) {
    TableAdapter.register(SpreadsheetAdapter, SpreadsheetModel, SpreadsheetCell)
    const model = new TestSpreadsheetModel(cols, rows)
    for (let row = 0; row < 4; ++row) {
        for (let col = 0; col < 4; ++col) {
            model.setField(col, row, `C${col}R${row}`)
        }
    }
    bindModel("model", model)
    return model
}

function str2cell(s: string[]) {
    return s.map((item) => new SpreadsheetCell(item))
}

// --------------------

class TestSpreadsheetModel extends SpreadsheetModel implements TestModel {
    showColumnHeaders = false
    showRowHeaders = false
    editMode = EditMode.EDIT_ON_ENTER
    getModelValueOf(col: number, row: number): string {
        return this.getField(col, row).valueOf()
    }
    getCellValueOf(table: TableFriend, col: number, row: number): string {
        const cell = table.body.children[col + row * table.adapter.colCount] as HTMLElement
        return cell.innerText
    }
}

class TestAdapter extends SpreadsheetAdapter<TestSpreadsheetModel> {
}

// ---------------------

class MyNode implements TreeNode {
    label: string
    next?: MyNode
    down?: MyNode
    static counter = 0
    constructor() {
        this.label = `#${MyNode.counter++}`
    }
}

class MyTreeAdapter extends TreeAdapter<MyNode> {
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        super.showCell(pos, cell)

        const rowinfo = this.model.rows[pos.row]
        const label = rowinfo.node.label

        const labelNode = span(text(label))
        labelNode.style.verticalAlign = "middle"
        labelNode.style.padding = "2px"
        cell.appendChild(labelNode)
    }
}

function createTree(): TreeNodeModel<MyNode> {
    TreeAdapter.register(MyTreeAdapter, TreeNodeModel, MyNode)
    let model = new TreeNodeModel(MyNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    model.addSiblingAfter(0)
    bindModel("tree", model)
    return model
}

class WidgetTreeAdapter extends TreeAdapter<WidgetNode> {
    override get colCount(): number {
        return 2
    }
    override showCell(pos: TablePos, cell: HTMLSpanElement) {
        if (this.model === undefined) {
            console.log("no model")
            return
        }
        const node = this.model.rows[pos.row].node
        switch (pos.col) {
            case 0:
                this.treeCell(pos, cell, node.label)
                break
            case 1:
                if (node.model && node.down === undefined) {
                    const x = <>
                        <Text model={node.model} style={{ width: '50px', margin: '10px' }} />
                        <Slider model={node.model} style={{ margin: '10px' }} />
                    </>
                    cell.replaceChildren(...x)
                }
                break
        }
    }
}

class TestTreeNodeModel extends TreeNodeModel<WidgetNode> implements TestModel {
    showColumnHeaders = false
    showRowHeaders = false
    editMode = EditMode.EDIT_ON_ENTER
    getModelValueOf(col: number, row: number): string {
        if (col !== 0) {
            return ""
        }
        return this.rows[row].node.label
    }
    getCellValueOf(table: TableFriend, col: number, row: number): string {
        if (col !== 0) {
            return ""
        }
        const cell = table.body.children[col + row * table.adapter.colCount] as HTMLElement
        return cell.innerText
    }
}

function createWidgetTree(): TestTreeNodeModel {
    TreeAdapter.register(WidgetTreeAdapter, TreeNodeModel, WidgetNode)

    let model = new TestTreeNodeModel(WidgetNode)
    model.addSiblingAfter(0)
    model.addChildAfter(0)
    model.addChildAfter(1)
    model.addSiblingAfter(2)
    model.addSiblingAfter(1)
    model.addChildAfter(4)
    // model.addSiblingAfter(0)
    return model
}

class WidgetNode implements TreeNode {
    label: string
    next?: WidgetNode
    down?: WidgetNode
    model = new NumberModel(0, { min: 0, max: 1, step: 0.01 })
    static counter = 0
    constructor(label?: string, ...children: WidgetNode[]) {
        this.label = label ? label : ""
        if (children.length > 0) {
            this.down = children[0]
        }
        for (let i = 1; i < children.length; ++i) {
            children[i - 1].next = children[i]
        }
    }
}

function createTreeModelFromTree(): TestTreeNodeModel {
    TreeAdapter.register(WidgetTreeAdapter, TreeNodeModel, WidgetNode)
    return new TestTreeNodeModel(WidgetNode,
        new WidgetNode("",
            new WidgetNode("#0",
                new WidgetNode("#1"),
                new WidgetNode("#2")
            ),
            new WidgetNode("#3",
                new WidgetNode("#4"),
                new WidgetNode("#5")
            )
        ).down
    )
}

function rowLabel(table: TableFriend, row: number): string {
    // console.log(`${row} * ${table.adapter.colCount}`)
    // console.log(table.body.children[row * table.adapter.colCount])
    return (table.body.children[row * table.adapter.colCount].children[1] as HTMLElement).innerText
}

function rowPosAndLabelTop(table: TableFriend, row: number): string {
    const child = table.body.children[row * table.adapter.colCount] as HTMLElement
    const x = px2float(child.style.left)
    const y = px2float(child.style.top)
    return `${x},${y}: ${(child.children[1] as HTMLElement).innerText}`
}

function rowPosAndLabelBottom(table: TableFriend, row: number): string {
    const child = table.splitBody.children[row * table.adapter.colCount] as HTMLElement
    const x = px2float(child.style.left)
    const y = px2float(child.style.top)
    return `${x},${y}: ${(child.children[1] as HTMLElement).innerText}`
}

function rowCount(table: TableFriend): number {
    return table.adapter.rowCount
}