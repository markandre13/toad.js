/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Model, ModelOptions } from "./Model"
import { Signal } from "../reactive/Signal"
import { View } from "../viewkit/View"

/**
 * @category Application Model
 */
export class Action extends Model {
    private action = new Signal<any>()

    constructor(callback: () => void, options?: ModelOptions) {
        super(options)
        this.action.add(callback)
    }

    set value(_: any) {
        throw Error("Action.value can not be assigned a value")
    }

    get value(): any {
        throw Error("Action.value can not return a value")
    }

    trigger(data?: any): void {
        if (!this.enabled) {
            return
        }
        this.action.emit(data)
    }
}

export class Controller {
    modelId2Models: Map<string, Set<Model>>
    modelId2Views: Map<string, Set<View>>
    view2ModelIds: Map<View, Set<string>>

    sigChanged: Signal

    constructor() {
        this.modelId2Models = new Map<string, Set<Model>>()
        this.modelId2Views = new Map<string, Set<View>>()
        this.view2ModelIds = new Map<View, Set<string>>()
        this.sigChanged = new Signal()
    }

    registerAction(actionId: string, callback: () => void): Action {
        // console.log(`registerAction("${actionId}", <callback>)`)
        let action = new Action(callback)
        this._registerModel("A:" + actionId, action)
        return action
    }

    registerModel(modelId: string, model: Model): void {
        this._registerModel("M:" + modelId, model)
    }

    _registerModel(modelId: string, model: Model): void {
        let modelsForModelId = this.modelId2Models.get(modelId)
        if (!modelsForModelId) {
            modelsForModelId = new Set<Model>()
            this.modelId2Models.set(modelId, modelsForModelId)
        }

        modelsForModelId.add(model)

        let viewsForModelId = this.modelId2Views.get(modelId)
        if (!viewsForModelId)
            return

        for (let view of viewsForModelId) {
            view.setModel(model)
        }
    }

    registerView(modelId: string, view: View): void {
        // if (view.controller && view.controller !== this) {
        //     console.log("error: attempt to register view more than once at different controllers")
        //     return
        // }
        // view.controller = this

        let modelIdsForView = this.view2ModelIds.get(view)
        if (!modelIdsForView) {
            modelIdsForView = new Set<string>()
            this.view2ModelIds.set(view, modelIdsForView)
        }
        modelIdsForView.add(modelId)

        let viewsForModelId = this.modelId2Views.get(modelId)
        if (!viewsForModelId) {
            viewsForModelId = new Set<View>()
            this.modelId2Views.set(modelId, viewsForModelId)
        }
        viewsForModelId.add(view)

        let modelsForView = this.modelId2Models.get(modelId)
        if (!modelsForView)
            return

        for (let model of modelsForView) {
            view.setModel(model)
        }
    }

    unregisterView(view: View): void {
        // if (!view.controller)
        //     return
        // if (view.controller !== this)
        //     throw Error("attempt to unregister view from wrong controller")

        let modelIds = this.view2ModelIds.get(view)
        if (!modelIds)
            return

        for (let modelId of modelIds) {
            let views = this.modelId2Views.get(modelId)
            if (!views)
                continue
            views.delete(view)
            if (views.size === 0) {
                this.modelId2Views.delete(modelId)
            }
            view.setModel(undefined)
        }
    }

    clear(): void {
        for (let entry of this.view2ModelIds) {
            entry[0].setModel(undefined)
        }
        this.modelId2Models.clear()
        this.modelId2Views.clear()
        this.view2ModelIds.clear()
    }

    // bind<T>(modelId: string, model: Model<T>): void {
    //     this.registerModel(modelId, model as any)
    // }

    // action(actionId: string, callback: () => void): Action {
    //     return this.registerAction(actionId, callback)
    // }

    // text(modelId: string, value: string): TextModel {
    //     let model = new TextModel(value)
    //     this.bind(modelId, model)
    //     return model
    // }

    // html(modelId: string, value: string): HtmlModel {
    //     let model = new HtmlModel(value)
    //     this.bind(modelId, model)
    //     return model
    // }

    // boolean(modelId: string, value: boolean): BooleanModel {
    //     let model = new BooleanModel(value)
    //     this.bind(modelId, model)
    //     return model
    // }

    // number(modelId: string, value: number, options: any): NumberModel {
    //     let model = new NumberModel(value, options)
    //     this.bind(modelId, model)
    //     return model
    // }
}

export let globalController = new Controller()

export function action(actionId: string, action: () => void): Action { // FIXME: deprecated
  return globalController.registerAction(actionId, action)
}
