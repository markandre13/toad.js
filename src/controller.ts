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

import * as dom from "./dom"
import { Model, TextModel, HtmlModel, BooleanModel, NumberModel } from "./model"
import { View } from "./view"
import { Action } from "./action"
import { Signal } from "./signal"

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
    let action = new Action(undefined, actionId)
    action.signal.add(callback)
    this._registerModel("A:"+actionId, action)
    return action
  }
  
  registerModel(modelId: string, model: Model): void {
    this._registerModel("M:"+modelId, model)
  }
  
  _registerModel(modelId: string, model: Model): void {
    let models = this.modelId2Models.get(modelId)
    if (!models) {
      models = new Set<Model>()
      this.modelId2Models.set(modelId, models)
    }
    models.add(model)
    
    let views = this.modelId2Views.get(modelId)
    if (!views)
      return
    for(let view of views) {
      view.setModel(model)
    }
  }

  registerView(modelId: string, view: View): void {
    if (view.controller && view.controller!==this) {
      console.log("error: attempt to register view more than once at different controllers")
      return
    }
    view.controller = this
  
    let modelIds = this.view2ModelIds.get(view)
    if (!modelIds) {
      modelIds = new Set<string>()
      this.view2ModelIds.set(view, modelIds)
    }
    modelIds.add(modelId)
  
    let views = this.modelId2Views.get(modelId)
    if (!views) {
      views = new Set<View>()
      this.modelId2Views.set(modelId, views)
    }
    views.add(view)
    
    let models = this.modelId2Models.get(modelId)
    if (models)
      for(let model of models)
        view.setModel(model)
  }
  
  unregisterView(view: View): void {
    if (!view.controller)
      return
    if (view.controller !== this)
      throw Error("attempt to unregister view from wrong controller")
  
    let modelIds = this.view2ModelIds.get(view)
    if (!modelIds)
      return

    for(let modelId of modelIds) {
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
    for(let entry of this.view2ModelIds) {
      entry[0].setModel(undefined)
    }
    this.modelId2Models.clear()
    this.modelId2Views.clear()
    this.view2ModelIds.clear()
  }
  
  bind(modelId: string, model: Model): void {
    this.registerModel(modelId, model)
  }
  
  action(actionId: string, callback: () => void): Action {
    return this.registerAction(actionId, callback)
  }
  
  text(modelId: string, value: string): TextModel {
    let model = new TextModel(value)
    this.bind(modelId, model)
    return model
  }

  html(modelId: string, value: string): HtmlModel {
    let model = new HtmlModel(value)
    this.bind(modelId, model)
    return model
  }

  boolean(modelId: string, value: boolean): BooleanModel {
    let model = new BooleanModel(value)
    this.bind(modelId, model)
    return model
  }
  
  number(modelId: string, value: number, options: any): NumberModel {
    let model = new NumberModel(value, options)
    this.bind(modelId, model)
    return model
  }
}

export class Template extends Controller {
  root: DocumentFragment

  constructor(template: string) {
    super()
    this.root = dom.instantiateTemplate(template)
    this.registerViews()
  }
  
  registerViews() {
    let views = this.root.querySelectorAll("[model]")
    for(let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      try {
        this.registerView(view.getModelId(), view)
      }
      catch(e) {
      }
    }
    
    views = this.root.querySelectorAll("[action]")
    for(let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
//      view.controller = this
      try {
        this.registerView(view.getActionId(), view)
      }
      catch(e) {
      }
    }
    
  }
  
  openHref(href: string) {
  }
}

export class Dialog extends Controller {
  root?: DocumentFragment
  shadow?: HTMLElement
  frame?: HTMLElement
  
  constructor() {
    super()
  }

  open(href: string): void {
    let shadow = document.createElement("div")
    shadow.style.position = "absolute"
    shadow.style.left = "0"
    shadow.style.top = "0"
    shadow.style.right = "0"
    shadow.style.bottom = "0"
    shadow.style.backgroundColor = "#aaa"
    shadow.style.opacity = "0.5"
    this.shadow = shadow
    document.body.appendChild(shadow)
  
    let linkList = document.head.querySelectorAll("link[rel=import]")
    let link
    for(let availableLink of linkList) {
      if ((availableLink as HTMLLinkElement).href === href) {
        link = availableLink
        break
      }
    }

    if (!link) {
      let link = document.createElement("link")
      link.rel = "import"
      link.href = href
      link.onload = (event) => {
        let template = link.import!.querySelector("template")
        if (!template)
          throw Error("toad.openDialog: failed to find template in '"+href+"'")
          
        let content = document.importNode(template.content, true)
        this.registerViews(content)
        
        let frame = document.createElement("div")
        frame.style.position = "absolute"
        frame.style.left = "5%"
        frame.style.top = "5%"
        frame.style.right = "5%"
        frame.style.bottom = "5%"
        frame.style.backgroundColor = "#fff"
        frame.style.border = "solid 2px #000"
        
        frame.appendChild(content)
        document.body.appendChild(frame)
        this.frame = frame
      }
      document.head.appendChild(link)
    } else {
      link.dispatchEvent(new Event("load"))
    }
  }
  
  close(): void {
    if (this.frame)
      document.body.removeChild(this.frame)
    if (this.shadow)
      document.body.removeChild(this.shadow)
  }

  registerViews(root: DocumentFragment) {
    let views = root.querySelectorAll("[model]")
    for(let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
      try {
        this.registerView(view.getModelId(), view)
      }
      catch(e) {
      }
    }
    
    views = root.querySelectorAll("[action]")
    for(let element of views) {
      //if (element.nodeName.toUpperCase().substring(0,4)!=="TOAD-")
      //  continue
      let view = element as View
      if (!view)
        continue
//      view.controller = this
      try {
        this.registerView(view.getActionId(), view)
      }
      catch(e) {
      }
    }
    
  }
}

export let globalController = new Controller()

export function bind(modelId: string, model: Model) {
  globalController.bind(modelId, model)
}

export function action(actionId: string, action: () => void): Action { // FIXME: deprecated
  return globalController.registerAction(actionId, action)
}

export function unbind() {
  globalController.clear()
}

export function text(modelId: string, value: string): TextModel {
  return globalController.text(modelId, value)
}

export function boolean(modelId: string, value: boolean): BooleanModel {
  return globalController.boolean(modelId, value)
}
