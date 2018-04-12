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

import { Signal } from "./signal"
import { Model, GenericModel, TextModel, HtmlModel, NumberModel, BooleanModel, RadioStateModel } from "./model"
import { GenericView } from "./view"
import { Controller, globalController } from "./controller"

export { Signal } from "./signal"
export { Action } from "./action"
export { Model, GenericModel, TextModel, HtmlModel, NumberModel, BooleanModel, RadioStateModel } from "./model"

export { View, GenericView, SlotView } from "./view"
export { ButtonView } from "./view/button"
export { CheckboxView } from "./view/checkbox"
export { MenuButton } from "./view/menu"
export { SliderView } from "./view/slider"
export { TableView, TableModel, TableEditMode, SelectionModel, registerTableModelLocator, createTableModel } from "./view/table"
export { TextView } from "./view/text"

export { Controller, Template, bind, action, unbind, globalController, boolean, text } from "./controller"

// <toad-if> requires correct HTML otherwise <toad-if> and it's content might
// be separated by stuff like an </p> inserted automatically by the browser
// so one should use stuff like htmltidy or htmlhint
class ToadIf extends GenericView<BooleanModel> {
  updateModel() {
  }

  updateView() {
    if (this.model) {
      this.style.display = this.model.value ? "" : "none"
    }
  }
}
customElements.define('toad-if', ToadIf)

/*
 * OLD STUFF I MIGHT WANT TO GET RID OF
 */
 
export class Window {
  window?: HTMLElement;
  parent?: Window;
  title: string;
  
  constructor(p: any, t: string) {
    // p can either be of type Window or a DOM object
    if (p instanceof Window) {
      this.window = undefined;
      this.parent = p;
    } else {
      this.window = p;
      this.parent = undefined;
    }
    this.title = t;
  }
}

export class RadioButtonBase extends Window
{
  clicked: Signal
  
  constructor(p: any, t: string) {
    super(p, t)
    this.clicked = new Signal
  }
}

export class FatRadioButton<T> extends RadioButtonBase {
  model: RadioStateModel<T>
  value: T
  
  constructor(parent: any, title: string, model: RadioStateModel<T>, value: T) {
    super(parent, title)
    let button = this
    this.model = model
    this.value = value
    
    button.window = dom.tag("div")
    button.window.classList.add("fatradiobutton")
    if (!model.hasValue())
      model.setValue(value)
    if (model.getValue()==value)
      button.window.classList.add("fatradiobutton-selected")

    button.window.onmousedown = function(e) {
      button.model.setValue(value)
      return false
    }
    
    model.modified.add(function() {
      if (!button.window)
        throw Error("fuck")
      if (button.model.getValue()==value) {
        button.window.classList.add("fatradiobutton-selected")
      } else {
        button.window.classList.remove("fatradiobutton-selected")
      }
    })
    
    let img = dom.img('img/'+title+'.svg')
    dom.add(button.window, img)
    dom.add(parent.window, button.window)
  }
}
