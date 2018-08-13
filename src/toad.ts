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
import { Model, GenericModel, TextModel, HtmlModel, NumberModel, BooleanModel } from "./model"
import { GenericView } from "./view"
import { Controller, globalController } from "./controller"

export { Point, MatrixStruct, Matrix } from "./matrix"
export { Signal } from "./signal"
export { Action } from "./action"
export { Model, GenericModel, TextModel, HtmlModel, NumberModel, BooleanModel, OptionModel, OptionModelBase } from "./model"

export { View, GenericView, ActionView, SlotView } from "./view"
export { ButtonView } from "./view/button"
export { ToolButton } from "./view/toolbutton"	// FIXME: no View in name?
export { CheckboxView } from "./view/checkbox"
export { MenuButton } from "./view/menu"	// FIXME: no View in name?
export { SliderView } from "./view/slider"
export { TableView, TableModel, TableEditMode, SelectionModel, registerTableModelLocator, createTableModel } from "./view/table"
export { TextView } from "./view/text"

export { Controller, Template, Dialog, bind, action, unbind, globalController, boolean } from "./controller"

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
