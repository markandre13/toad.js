import { expect } from '@esm-bundle/chai'
import { TableModel, TableAdapter, bindModel, unbind, text, TableEvent, TableEventType } from "@toad"

// TODO:
// [X] send modified-events
// [X] render table
// [X] declare (insert/remove)(Row/Column) in a superclass for use by TableTool
// [ ] add tests for row/column insert/remove animations
// [ ] display error
// [ ] edit cells
function sleep(milliseconds: number = 500) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

describe("table", function () {
    beforeEach(function () {
        unbind()
        TableAdapter.unbind()
        document.body.innerHTML = ""
    })

    it("can render the 1st cell", async function () {
        register(MyAdapter, MyModel)
        const model = new MyModel()
        bindModel("model", model)
        document.body.innerHTML = `<style>body{background: #888;}</style><tx-table2 model="model"></tx-table2>`
        await sleep(1)
        const body = document.body.children[1].shadowRoot!.children[1].children[0]
        const cell00 = body.children[0] as HTMLElement
        expect(cell00.innerText).to.equal("C0:R0")
        expect(cell00.style.top).to.equal("0px")
        expect(cell00.style.left).to.equal("0px")
    })
    //     describe("initialize view from model", function () {
    //         describe("does so when the model is defined before the view", function () {
    //             it("true", function () {
    //                 const model = new BooleanModel(true)
    //                 bindModel("bool", model)
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 expect(isChecked()).to.equal(true)
    //             })

    //             it("false", function () {
    //                 const model = new BooleanModel(false)
    //                 bindModel("bool", model)
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 expect(isChecked()).to.equal(false)
    //             })
    //         })

    //         describe("does so when the view is defined before the model", function () {
    //             it("true", function () {
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 const model = new BooleanModel(true)
    //                 bindModel("bool", model)
    //                 expect(isChecked()).to.equal(true)
    //             })

    //             it("false", function () {
    //                 document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //                 const model = new BooleanModel(false)
    //                 bindModel("bool", model)
    //                 expect(isChecked()).to.equal(false)
    //             })
    //         })
    //     })

    //     describe("on change sync data between model and view", function () {

    //         it("updates the html element when the model changes", function () {
    //             const model = new BooleanModel(true)
    //             bindModel("bool", model)
    //             document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"
    //             expect(isChecked()).to.equal(true)

    //             model.value = false
    //             expect(isChecked()).to.equal(false)
    //         })

    //         it("updates the model when the html element changes", function () {
    //             let model = new BooleanModel(false)
    //             bindModel("bool", model)
    //             document.body.innerHTML = "<tx-checkbox model='bool'></tx-checkbox>"

    //             setChecked(true)
    //             expect(model.value).to.equal(true)
    //         })
    //     })
})

class MyModel extends TableModel {
    constructor() {
        super()
    }
    get colCount() {
        return 4
    }
    get rowCount() {
        return 3
    }
    get(col: number, row: number) {
        return `C${col}:R${row}`
    }
}

class MyAdapter extends TableAdapter<MyModel> {

    // constructor(model: MyModel) {
    //     super(model)
    // }

    override getDisplayCell(col: number, row: number) {
        return text(
            this.model!.get(col, row)
        )
    }
}

// TODO: something else to redesign:
// static register<T, A extends TypedTableAdapter<TypedTableModel<T>>, C extends TypedTableModel<T>>(adapter: new(...args: any[]) => A, model: new(...args: any[]) => C, data: new(...args: any[]) => T): void
function register<T extends TableModel>(adapter: new (model: T) => TableAdapter<any>, model: new (...args: any[]) => T): void
// static register(adapter: new() => TableAdapter<any>, model: new(...args: any[])=>TableModel, data?: any): void
{
    TableAdapter.register(adapter as any, model)
}

