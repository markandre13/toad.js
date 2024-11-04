import { expect } from "chai"
import {
    TableAdapter, TypedTableAdapter, TableModel, TreeNodeModel, TreeNode
} from "@toad"

describe("view", function () {
    describe("table", function () {
        describe("class TableAdapter is used by Table to render cells for TableModel", function () {
            describe("Table requires a TableAdapter to be registered for a TableModel type", function() {
                it("TableAdapter.register(adapter: new()=>TableAdapter, model: new()=>TableModel)", function () {
                    class FubarTableModel extends TableModel {
                        get colCount(): number { return 1 }
                        get rowCount(): number { return 1 }
                    }
                    class FubarTableAdapter extends TableAdapter<FoobarTableModel> { }
                    TableAdapter.register(FubarTableAdapter as any, FubarTableModel)

                    // works when the table model is exactly the type being registered
                    const model0 = new FubarTableModel()
                    const adapter0 = TableAdapter.lookup(model0)
                    expect(adapter0).equals(FubarTableAdapter)

                    // works also when the table model is subclassed
                    class FoobarTableModel extends FubarTableModel { }
                    const model1 = new FoobarTableModel()
                    const adapter1 = TableAdapter.lookup(model1)
                    expect(adapter1).equals(FubarTableAdapter)
                })

                it("TableAdapter.register(adapter: new()=>TypedTableAdapter<T>, model: new()=>TypedTableModel<T>, data: new()=>T)", function () {
                    class Node0 implements TreeNode {
                        label?: string
                        next?: Node0
                        down?: Node0
                    }
                    class Adapter0 extends TypedTableAdapter<TreeNodeModel<Node0>> { }
                    // class Adapter0 extends TypedTableAdapter<TreeNodeModel<Node0>> { }
                    TableAdapter.register(Adapter0, TreeNodeModel, Node0)

                    class Node1 implements TreeNode {
                        name?: string
                        next?: Node1
                        down?: Node1
                    }
                    class Adapter1 extends TypedTableAdapter<TreeNodeModel<Node1>> { }
                    TableAdapter.register(Adapter1, TreeNodeModel, Node1)

                    // works when the table model's data type is exactly the type being registered
                    const tree0 = new TreeNodeModel(Node0)
                    const adapter0 = TableAdapter.lookup(tree0)
                    expect(adapter0).equals(Adapter0)

                    const tree1 = new TreeNodeModel(Node1)
                    const adapter1 = TableAdapter.lookup(tree1)
                    expect(adapter1).equals(Adapter1)

                    // works also when the table model's data type is subclassed
                    // TODO: TBD
                })

                it.skip("one can register multiple TableAdapters per TableModel and let Table choose one using an identifier", function() {})
            })
        })
    })
})
