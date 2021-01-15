/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { HtmlModel } from "./model/HtmlModel"
import { TextModel } from "./model/TextModel"
import { Model } from "./model/Model"
import { Controller, globalController } from "./controller"
import { Action } from "./action"

export abstract class View extends HTMLElement {
  controller?: Controller

  abstract setModel(model?: Model): void

  getModelId(): string {
    if (!this.hasAttribute("model")) 
      throw Error("no 'model' attribute")
    let modelId = this.getAttribute("model") // FIXME: both hasAttribute & getAttribute? really?
    if (!modelId)
      throw Error("no model id")
    return "M:"+modelId
  }

  getActionId(): string {
    if (!this.hasAttribute("action")) 
      throw Error("no 'action' attribute")
    let actionId = this.getAttribute("action") // FIXME: both hasAttribute & getAttribute? really?
    if (!actionId)
      throw Error("no action id")
    return "A:"+actionId
  }

  connectedCallback() {
    if (this.controller)
      return
    let modelId = ""
    try {
      modelId = this.getModelId()
    } catch(error) {
    }
    if (modelId!="")
      globalController.registerView(modelId, this)
  }
  
  disconnectedCallback() {
    if (this.controller)
      this.controller.unregisterView(this)
  }
}

export abstract class GenericView<T extends Model> extends View {
  model?: T

  constructor() {
    super()
  }

  abstract updateModel(): void
  abstract updateView(): void
  
  setModel(model?: T): void {
    if (model === this.model)
      return

    let view = this
    
    if (this.model)
      this.model.modified.remove(view)
    
    if (model)
      model.modified.add(() => { view.updateView() }, view)

    this.model = model
    this.updateView()
  }
}

// FIXME: ActionView should also be a template instead of having a fixed TextModel
export abstract class ActionView extends GenericView<TextModel> {
  action?: Action

  constructor() {
    super()
  }

  connectedCallback() {
    if (this.controller) {
      this.updateView()
      return
    }

    try {
      globalController.registerView(this.getActionId(), this) // FIXME: don't register always on globalController
    }
    catch(e) {
    }
    
    try {
      globalController.registerView(this.getModelId(), this) // FIXME: don't register always on globalController
    }
    catch (e) {
    }

    this.updateView()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.controller)
      this.controller.unregisterView(this)
  }
  
  setModel(model?: Model): void {
    if (!model) {
      if (this.model)
        this.model.modified.remove(this)
      if (this.action)
        this.action.modified.remove(this)
      this.model = undefined
      this.action = undefined
      this.updateView()
      return
    }

    if (model instanceof Action) {
      // FIXME: what if this.action is already set?
      this.action = model
      this.action.modified.add(() => {
        this.updateView()
      }, this)
    } else
    if (model instanceof TextModel) {
      // FIXME: what if this.model is already set?
      this.model = model
      this.model.modified.add(() => {
        this.updateView()
      }, this)
    } else {
      throw Error("unexpected model of type "+model.constructor.name)
    }

    this.updateView()
  }

  isEnabled(): boolean {
    return this.action!==undefined && this.action.enabled
  }
}


export class SlotView extends GenericView<TextModel> {
  constructor() { super() }
  updateModel() { }
  updateView() {
    if (!this.model)
      return
      
    let value = this.model.value === undefined ? "" : this.model.value
    if (this.model instanceof HtmlModel)
      this.innerHTML = value
    else
      this.innerText = value
  }
}
window.customElements.define("toad-slot", SlotView)
