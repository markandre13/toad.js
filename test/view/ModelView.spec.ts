import { expect } from '@esm-bundle/chai'
import { Model, View, ModelView } from "@toad"

describe("view", function() {
    describe("ModelView<Model<MSG>>", function() {
        it("ModelView<Model<MSG>>.updateView() is called when the model is modified, added or removed", function() {
            class MyModel extends Model {
            }
            class MyView extends ModelView<MyModel> {
                log: {method: string, model: MyModel | undefined}[] = []
                override updateModel() {
                    this.log.push({method: "updateModel()", model: this.model})
                }
                override updateView() {
                    this.log.push({method: "updateView()", model: this.model})
                }
            }
            View.define("test-modelview001", MyView)
            const model = new MyModel()
            const view = new MyView()
            document.body.appendChild(view)
            expect(model.modified.callbacks).to.be.undefined
            expect(view.log.length).equals(0)

            view.setModel(model)
            expect(model.modified.callbacks?.length).equals(1)
            expect(view.log.length).equals(1)

            expect(view.log[0].method).equals("updateView()")
            expect(view.log[0].model).equals(model)

            model.modified.trigger()
            expect(view.log.length).equals(2)
            expect(view.log[1].method).equals("updateView()")
            expect(view.log[1].model).equals(model)

            view.setModel(undefined)
            expect(model.modified.callbacks?.length).equals(0)
            expect(view.log.length).equals(3)
            expect(view.log[2].method).equals("updateView()")
            expect(view.log[2].model).equals(undefined)
        })
        it("ModelView<Model<MSG>>.updateView(msg: MSG) is called when the model is modified", function() {
            interface MyMessage {
                message: string
            }
            class MyModel extends Model<MyMessage> {
            }
            class MyView extends ModelView<MyModel> {
                log: {method: string, model: MyModel | undefined}[] = []
                override updateModel() {
                    this.log.push({method: "updateModel()", model: this.model})
                }
                override updateView(data?: MyMessage) {
                    this.log.push({method: `updateView(${data?.message})`, model: this.model})
                }
            }
            View.define("test-modelview002", MyView)
            const model = new MyModel()
            const view = new MyView()
            document.body.appendChild(view)

            expect(model.modified.callbacks).to.be.undefined
            expect(view.log.length).equals(0)

            view.setModel(model)
            expect(model.modified.callbacks?.length).equals(1)
            expect(view.log.length).equals(1)
            expect(view.log[0].method).equals("updateView(undefined)")
            expect(view.log[0].model).equals(model)

            model.modified.trigger({message: "message"})
            expect(view.log.length).equals(2)
            expect(view.log[1].method).equals("updateView(message)")
            expect(view.log[1].model).equals(model)

            view.setModel(undefined)
            expect(model.modified.callbacks?.length).equals(0)
            expect(view.log.length).equals(3)
            expect(view.log[2].method).equals("updateView(undefined)")
            expect(view.log[2].model).equals(undefined)
        })
    })
})
