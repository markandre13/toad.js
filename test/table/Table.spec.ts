import { expect } from '@esm-bundle/chai'
import { TableAdapter, bindModel, unbind, text, Table, TablePos } from "@toad"
import { TableFriend } from '@toad/table/private/TableFriend'
import { GridTableModel } from "@toad/table/model/GridTableModel"
import { input } from "@toad/util/lsx"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [X] add tests for row/column insert/remove animations
// [X] all of the above with row/col headers
// [ ] header glitches
// [ ] edit cells
// [ ] adjust selection, caret, ...
// [ ] tab in/out of table
// [ ] display error

// [ ] insert more than one row/column
// [ ] restrict minimal table size to at least one row or one column

// cell editing follows google sheets shortcuts
// not editing
//   type    : replace cell content
//   [enter] : edit cell content/formula (ms & apple use these: ctrl+u, f2, ctrl+=)
// editing
//   [enter] : move down
//   [esc]   : revert changes

// FIXME: use the 'with data' for all tests because with or without data is a property of the model, not the view

describe("table", function () {
    beforeEach(async function () {
        unbind()
        TableAdapter.unbind()
        Table.transitionDuration = "1ms"
        // let links = []
        // let promises = []

        // // FIXME: the test fails without these styles...

        // for (let path of ["/style/tx-static.css", "/style/tx-dark.css", "/style/tx.css"]) {
        //     const link = document.createElement("link")
        //     link.rel = "stylesheet"
        //     link.type = "text/css"
        //     link.href = path
        //     promises.push(new Promise<void>((resolve, reject) => {
        //         link.onload = () => {
        //             resolve()
        //         }
        //     }))
        //     links.push(link)
        // }
        // document.head.replaceChildren(...links)
        // for (let promise of promises) {
        //     await promise
        // }
        // await sleep(0)
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

    describe("interaction", function () {
        // tab in
        // tab out
        it("click first cell", async function () {
            const model = createModel(2, 2)
            model.showColumnHeaders = true
            model.showRowHeaders = true
            document.body.innerHTML = `<tx-table model="model"></tx-table>`
            await sleep()

            const cell = getByText(document.body, "C0R0")
            click(cell!)
            expect(cell?.classList.contains("selected")).is.true
        })

        it("tab forward into table", async function () {
            const model = createModel(2, 2)
            model.showColumnHeaders = true
            model.showRowHeaders = true
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[0] as HTMLElement).focus()

            tabForward()

            const cell = getByText(document.body, "C0R0")
            expect(cell?.classList.contains("selected")).is.true
        })

        it("tab backward into table", async function () {
            const model = createModel(2, 2)
            model.showColumnHeaders = true
            model.showRowHeaders = true
            document.body.innerHTML = `<input/><tx-table model="model"></tx-table><input/>`
            await sleep();
            (document.body.children[2] as HTMLElement).focus()

            tabBackward()

            const cell = getByText(document.body, "C1R1")
            expect(cell?.classList.contains("selected")).is.true
        })

    })

    describe("edit columns/rows", function () {

        it(`with headers: insertRow with data`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, ["N1", "N2", "N3", "N4"])
            await animationDone

            validateRender(model)
        })

        it(`with headers: insertColumn with data`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, ["N1", "N2", "N3", "N4"])
            await animationDone

            validateRender(model)
        })

        it(`with headers: removeRow`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeRow(2)
            expect(model.rowCount).to.equal(3)
            await animationDone

            validateRender(model)
        })

        it(`with headers: removeColumn`, async function () {
            const model = createModel(4, 4)
            model.showColumnHeaders = true
            model.showRowHeaders = true

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.removeColumn(2)
            expect(model.colCount).to.equal(3)
            await animationDone

            validateRender(model)
        })

        it(`insertRow with data`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertRow(2, ["N1", "N2", "N3", "N4"])
            await animationDone

            validateRender(model)
        })

        it(`insertColumn with data`, async function () {
            const model = createModel(4, 4)

            document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
            const table = getTable(model)
            const animationDone = new Promise<void>((resolve, reject) => {
                table.animationDone = () => {
                    resolve()
                }
            })

            await sleep()
            // also test wrong row size, and multiple rows
            model.insertColumn(2, ["N1", "N2", "N3", "N4"])
            await animationDone

            validateRender(model)
        });

        [0, 2, 4].forEach(row =>
            it(`insertRow ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)
                const animationDone = new Promise<void>((resolve, reject) => {
                    table.animationDone = () => {
                        resolve()
                    }
                })

                await sleep()
                model.insertRow(row)
                await animationDone

                validateRender(model)
            })
        );

        [0, 2, 4].forEach(row =>
            it(`insertColumn ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)
                const animationDone = new Promise<void>((resolve, reject) => {
                    table.animationDone = () => {
                        resolve()
                    }
                })

                await sleep()
                model.insertColumn(row)
                await animationDone

                validateRender(model)
            })
        );

        [0, 2, 3].forEach(row =>
            it(`removeRow ${row + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)
                const animationDone = new Promise<void>((resolve, reject) => {
                    table.animationDone = () => {
                        resolve()
                    }
                })

                await sleep()
                // also test wrong row size, and multiple rows
                model.removeRow(row, 1)
                await animationDone

                validateRender(model)
            })
        );

        [0, 2, 3].forEach(column =>
            it(`removeColumn ${column + 1} out of 4`, async function () {
                const model = createModel(4, 4)

                document.body.innerHTML = `<style>body{background: #888;}</style><tx-table model="model"></tx-table>`
                const table = getTable(model)
                const animationDone = new Promise<void>((resolve, reject) => {
                    table.animationDone = () => {
                        resolve()
                    }
                })

                await sleep()
                // also test wrong row size, and multiple rows
                model.removeColumn(column, 1)
                await animationDone

                validateRender(model)
            })
        )
    })
})

function createModel(cols: number, rows: number) {
    TableAdapter.register(MyAdapter, MyModel, String)
    const model = new MyModel(cols, rows)
    for (let row = 0; row < 4; ++row) {
        for (let col = 0; col < 4; ++col) {
            model.setCell(col, row, `C${col}R${row}`)
        }
    }
    bindModel("model", model)
    return model
}

function getTable(model: MyModel) {
    const table = document.querySelector("tx-table") as Table
    if (table === undefined) {
        throw Error("No <tx-table> found.")
    }
    if (table.getModel() !== model) {
        throw Error("<tx-model> has wrong model")
    }
    return new TableFriend(table)
}

function validateRender(model: MyModel) {

    // console.log(`validateRender: size ${model.colCount} x ${model.rowCount} = ${model.colCount * model.rowCount}`)

    const table = getTable(model)
    const body = table.body
    // console.log(`  body has length ${body.children.length}`)

    const expectCol: { x: number, w: number }[] = []
    let x = 0
    for (let col = 0; col < model.colCount; ++col) {
        const cell = body.children[col] as HTMLSpanElement
        const w = px2int(cell.style.width)
        expectCol.push({ x, w })
        // console.log(`expectCol[${col}] = {x: ${x}, w: ${w}}`)
        x += w + 6 - 1
    }

    const expectRow: { y: number, h: number }[] = []
    let y = 0
    for (let row = 0; row < model.rowCount; ++row) {
        const cell = body.children[row * model.colCount] as HTMLSpanElement
        const h = px2int(cell.style.height)
        expectRow.push({ y, h })
        // console.log(`expectRow[${row}] = {x: ${y}, w: ${h}}`)
        y += h + 2 - 1
    }

    // let idx0 = 0
    // let txt = "cols (x,w): "
    // for (let col = 0; col < model.colCount; ++col) {
    //     txt += `${expectCol[col].x},${expectCol[col].w} `
    // }
    // console.log(txt)

    // txt = "rows (y,h): "
    // for (let row = 0; row < model.rowCount; ++row) {
    //     txt += `${expectRow[row].y},${expectRow[row].h} `
    // }
    // console.log(txt)
    // txt = ""

    // for (let row = 0; row < model.rowCount; ++row) {
    //     for (let col = 0; col < model.colCount; ++col) {
    //         const cell = body.children[idx0++] as HTMLSpanElement
    //         txt = `${txt}[${col},${row}]='${cell.textContent}' (${px2float(cell.style.left)},${px2float(cell.style.top)},${px2float(cell.style.width)},${px2float(cell.style.height)}):(${expectCol[col].x},${expectRow[row].y},${expectCol[col].w},${expectRow[row].h} )  `
    //     }
    //     console.log(txt)
    //     txt = ""
    // }
    
    if (model.showColumnHeaders) {
        const colHeads = table.colHeads!
        const colHandles = table.colResizeHandles!
        expect(colHeads.children.length).to.equal(model.colCount + 1)
        expect(colHandles.children.length).to.equal(model.colCount + 1)
        const height = px2int((colHeads.children[0] as HTMLSpanElement).style.height)
        for (let col = 0; col < model.colCount; ++col) {
            const rowHeader = colHeads.children[col] as HTMLSpanElement
            expect(rowHeader.innerText, `column header ${col}`).to.equal((table.adapter.getColumnHead(col) as Text).data)
            expect(px2int(rowHeader.style.left), `column header ${col} left`).to.equal(expectCol[col].x)
            expect(px2int(rowHeader.style.width), `column header ${col} width`).to.equal(expectCol[col].w)
            expect(px2int(rowHeader.style.top), `column header ${col} top`).to.equal(0)
            expect(px2int(rowHeader.style.height), `column header ${col} height`).to.equal(height)

            const rowHandle = colHandles.children[col] as HTMLSpanElement
            expect(rowHandle.dataset["idx"], `row handle ${col} index`).to.equal(`${col}`)
            if (col + 1 < model.colCount) {
                expect(px2int(rowHandle.style.left), `row handle ${col} left`).to.equal(expectCol[col + 1].x - 3)
            } else {
                expect(px2int(rowHandle.style.left), `row handle last left`).to.equal(expectCol[col].x + expectCol[col].w + 5 - 3)
            }
            expect(px2int(rowHandle.style.width), `row handle ${col} width`).to.equal(5)
            expect(px2int(rowHandle.style.top), `row handle ${col} top`).to.equal(0)
            expect(px2int(rowHandle.style.height), `row handle ${col} height`).to.equal(height + 2)
        }
    }

    if (model.showRowHeaders) {
        const rowHeads = table.rowHeads!
        const rowHandles = table.rowResizeHandles!
        expect(rowHeads.children.length).to.equal(model.rowCount + 1)
        expect(rowHandles.children.length).to.equal(model.rowCount + 1)
        const width = px2int((rowHeads.children[0] as HTMLSpanElement).style.width)
        for (let row = 0; row < model.rowCount; ++row) {
            const cell = rowHeads.children[row] as HTMLSpanElement
            expect(cell.innerText, `row header ${row}`).to.equal((table.adapter.getRowHead(row) as Text).data)
            expect(px2int(cell.style.left), `row header ${row} left`).to.equal(0)
            expect(px2int(cell.style.width), `row header ${row} width`).to.equal(width)
            expect(px2int(cell.style.top), `row header ${row} top`).to.equal(expectRow[row].y)
            expect(px2int(cell.style.height), `row header ${row} height`).to.equal(expectRow[row].h)

            const colHandle = rowHandles.children[row] as HTMLSpanElement
            expect(colHandle.dataset["idx"], `column handle ${row} index`).to.equal(`${row}`)
            expect(px2int(colHandle.style.left), `column handle ${row} left`).to.equal(0)
            expect(px2int(colHandle.style.width), `column handle ${row} width`).to.equal(width + 6)
            if (row + 1 < model.rowCount) {
                expect(px2int(colHandle.style.top), `column handle ${row} top`).to.equal(expectRow[row + 1].y - 3)
            } else {
                expect(px2int(colHandle.style.top), `column handle last top`).to.equal(expectRow[row].y + expectRow[row].h - 2 )
            }
            expect(px2int(colHandle.style.height), `column handle ${row} height`).to.equal(5)
        }
    }

    let idx = 0

    expect(body.children.length).to.equal(model.colCount * model.rowCount)
    for (let row = 0; row < model.rowCount; ++row) {
        for (let col = 0; col < model.colCount; ++col) {
            const cell = body.children[idx++] as HTMLSpanElement
            expect(cell.innerText).to.equal(model.getCell(col, row).valueOf())
            expect(px2int(cell.style.left), `[${col},${row}] left`).to.equal((expectCol[col].x))
            expect(px2int(cell.style.width), `[${col},${row}] width`).to.equal((expectCol[col].w))
            expect(px2int(cell.style.top), `[${col},${row}] top`).to.equal((expectRow[row].y))
            expect(px2int(cell.style.height), `[${col},${row}] height`).to.equal((expectRow[row].h))
        }
    }
}

class MyModel extends GridTableModel<String> {
    showColumnHeaders = false
    showRowHeaders = false

    constructor(cols: number, rows: number) {
        super(String, cols, rows)
    }
}

class MyAdapter extends TableAdapter<MyModel> {
    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.getCell(col, row).valueOf()
        )
    }

    override editCell(pos: TablePos, cell: HTMLSpanElement) {
        console.log("MyAdapter.editCell()")
        cell.tabIndex = -1
        cell.contentEditable = "true"
        cell.focus()
        return undefined
    }

    override getRowHead(row: number): Node | undefined {
        if (this.model!.showRowHeaders) {
            return text(`${row + 1}`)
        }
    }

    override getColumnHead(col: number): Node | undefined {
        if (this.model!.showRowHeaders) {
            let str = ""
            while (true) {
                str = `${String.fromCharCode((col % 26) + 0x41)}${str}`
                col = Math.floor(col / 26)
                if (col === 0) {
                    break
                }
                col -= 1
            }
            return text(str)
        }
    }
}

function sleep(milliseconds: number = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

export function px2int(s: string) {
    return parseInt(s.substring(0, s.length - 2))
}

export function px2float(s: string) {
    return parseFloat(s.substring(0, s.length - 2))
}

// https://testing-library.com/docs/dom-testing-library/cheatsheet
function getByText(node: Node, text: string): Element | undefined {
    if (node instanceof Text) {
        if (text == node.nodeValue) {
            return node.parentNode as Element
        }
    }
    if (node instanceof HTMLElement) {
        if (node.shadowRoot) {
            for (const child of node.shadowRoot.childNodes) {
                const r = getByText(child, text)
                if (r !== undefined) {
                    return r
                }
            }
        }
    }
    for (const child of node.childNodes) {
        const r = getByText(child, text)
        if (r !== undefined) {
            return r
        }
    }
    return undefined
}

function activeElement(): Element | undefined {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active === null ? undefined : active
}

// https://testing-library.com/docs/user-event/intro
function click(node: Element) {
    const bounds = node.getBoundingClientRect()
    const clientX = bounds.x + bounds.width / 2
    const clientY = bounds.y + bounds.height / 2
    const old = activeElement()

    console.log(`click() target=${node}, relatedTarget=${old}`)
    // console.log(node)
    // console.log(old)

    // POINTER DOWN
    node.dispatchEvent(
        new PointerEvent("pointerdown", {
            bubbles: true,
            clientX,
            clientY
        })
    )
    old?.dispatchEvent(
        new FocusEvent("blur", {
            bubbles: true,
            relatedTarget: node
        })
    )
    old?.dispatchEvent(
        new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: node
        })
    )
    node?.dispatchEvent(
        new FocusEvent("focus", {
            bubbles: true,
        })
    )
    node?.dispatchEvent(
        new FocusEvent("focusin", {
            bubbles: true,
            relatedTarget: old
        })
    )

    // POINTER UP
    node.dispatchEvent(
        new PointerEvent("pointerup", {
            bubbles: true, clientX, clientY
        })
    )
}

// tabIndex
//   -1: can receive focus but not navigated to via keyboard(?) (e.g. body, div)
//   0: can receive focus
//   >0: can receive focus and uses a custom tab order (shouldn't be used)

interface CTX {
    currentFocus?: Element
    passedCurrentFocus: boolean
    previousFocusable?: Element
}

function forwardFocus() {
    return moveFocus(true)
}

function backwardFocus() {
    return moveFocus(false)
}

function moveFocus(forward: boolean, element: Element = document.body, ctx: CTX | undefined = undefined): Element | undefined {
    if (ctx === undefined) {
        ctx = {
            currentFocus: activeElement(),
            passedCurrentFocus: false,
            previousFocusable: undefined
        }
    }

    // console.log(`moveFocus(foward=${forward}, node=${element.nodeName}, previous=${ctx.previousFocusable?.nodeName}, found=${ctx.passedCurrentFocus}, active=${ctx.currentFocus?.nodeName})`)

    if (element === ctx.currentFocus) {
        if (!forward) {
            // console.log(`  found the active one, return previous`)
            return ctx.previousFocusable
        }
        ctx.passedCurrentFocus = true
    } else
        if (element instanceof HTMLElement) {
            // console.log(`${element.nodeName} ${element.nodeType} ${element.tabIndex}`)
            if (element.tabIndex >= 0) {
                if (forward && ctx.passedCurrentFocus) {
                    // console.log(`  found tabIndex`)
                    return element
                }
                ctx.previousFocusable = element
            }
        }

    for (let n of element.children) {
        const r = moveFocus(forward, n, ctx)
        if (r !== undefined) {
            return r
        }
    }
    // console.log(`  found nothing`)
    return undefined
}

function tabForward() {
    tab(forwardFocus())
}

function tabBackward() {
    tab(backwardFocus())
}

function tab(node?: Element) {
    // console.log(`tab to ${node?.nodeName}`)
    if (node === undefined) {
        throw Error("can not tab forward")
    }

    const old = activeElement()
    old?.dispatchEvent(
        new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab"
        })
    )
    old?.dispatchEvent(
        new FocusEvent("blur", {
            bubbles: true,
            relatedTarget: node
        })
    )
    old?.dispatchEvent(
        new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: node
        })
    );
    (node as HTMLElement).focus()
    // node.dispatchEvent(
    //     new FocusEvent("focus", {
    //         bubbles: true,
    //         relatedTarget: old
    //     })
    // )
    node.dispatchEvent(
        new FocusEvent("focusin", {
            bubbles: true,
            relatedTarget: old
        })
    )
    old?.dispatchEvent(
        new KeyboardEvent("keyup", {
            bubbles: true,
            key: "Tab"
        })
    )
}
