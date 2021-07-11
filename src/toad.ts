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

export { Point, MatrixStruct, Matrix } from "./Matrix"
export { Signal } from "./Signal"

export { Controller } from "./controller/Controller"
export { Template } from "./controller/Template"
export { Dialog } from "./controller/Dialog"
export { bind, action, unbind, globalController, boolean } from "./controller/globalController"
export * from "./util/animation"
export * from "./jsx-runtime"

export { Model, InferModelParameter } from "./model/Model"
export { Action } from "./model/Action"
export { GenericModel } from "./model/GenericModel"
export { TextModel } from "./model/TextModel"
export { HtmlModel } from "./model/HtmlModel"
export { NumberModel } from "./model/NumberModel"
export { BooleanModel } from "./model/BooleanModel"
export { OptionModel } from "./model/OptionModel"
export { OptionModelBase } from "./model/OptionModelBase"

export { View } from "./view/View"
export { ModelView } from "./view/ModelView"
export { GenericTool } from "./view/GenericTool"
export { ActionView } from "./view/ActionView"
export { SlotView } from "./view/SlotView"
export { Button } from "./view/Button"
export { ToolButton } from "./view/ToolButton"
export { CheckboxView } from "./view/CheckboxView"
export { SliderView } from "./view/SliderView"
export { TextView } from "./view/TextView"
export { TextArea } from "./view/TextArea"
export { TextTool } from "./view/TextTool"
export { ToadIf } from "./view/ToadIf"

export { Menu } from "./menu/Menu"
export { MenuButton } from "./menu/MenuButton"
export { MenuSpacer } from "./menu/MenuSpacer"
export { PopupMenu } from "./menu/PopupMenu"

export { TableView } from "./table/TableView"
export { TableTool } from "./table/TableTool"
export { TableAdapter } from "./table/TableAdapter"
export { TypedTableAdapter } from "./table/TypedTableAdapter"
export { TableModel } from "./table/TableModel"
export { ArrayTableModel } from "./table/ArrayTableModel"
export { TypedTableModel } from "./table/TypedTableModel"
export { SelectionModel } from "./table/SelectionModel"
export { TableEditMode } from "./table/TableEditMode"
export { TablePos } from "./table/TablePos"
export { TableEventType } from "./table/TableEventType"
export { TableEvent } from "./table/TableEvent"
export { TreeModel } from "./table/TreeModel"
export { TreeAdapter } from "./table/TreeAdapter"
export { TreeNode } from "./table/TreeNode"
export { TreeNodeModel } from "./table/TreeNodeModel"

export { ArrayModel } from "./table/ArrayModel"
export { ArrayAdapter } from "./table/ArrayAdapter"

// FIXME: For the JSX stuff, drop the View suffix
import { View } from "./view/View"
import { Button } from "./view/Button"
import { CheckboxView } from "./view/CheckboxView"
import { SliderView } from "./view/SliderView"
import { SlotView } from "./view/SlotView"
import { TextArea } from "./view/TextArea"
import { TextTool } from "./view/TextTool"
import { TextView } from "./view/TextView"
import { ToadIf } from "./view/ToadIf"
import { ToolButton } from "./view/ToolButton"

import { Menu } from "./menu/Menu"
import { MenuButton } from "./menu/MenuButton"
import { MenuEntry } from "./menu/MenuEntry"
import { MenuSpacer } from "./menu/MenuSpacer"

import { TableView } from "./table/TableView"
import { TableTool } from "./table/TableTool"
import { TreeNodeCell } from "./table/TreeAdapter"

let _isInitialized = false

export function initialize() {
    _isInitialized = true

    View.define("toad-button", Button)
    View.define("toad-checkbox", CheckboxView)
    View.define("toad-slider", SliderView)
    View.define("toad-slot", SlotView)
    View.define("toad-textarea", TextArea)
    View.define("toad-texttool", TextTool)
    View.define("toad-text", TextView)
    View.define("toad-if", ToadIf)
    View.define("toad-toolbutton", ToolButton)

    View.define("toad-menu", Menu)
    View.define("toad-menubutton", MenuButton)
    View.define("toad-menuentry", MenuEntry)
    View.define("toad-menuspacer", MenuSpacer)

    View.define("toad-table", TableView)
    View.define("toad-tabletool", TableTool)
    View.define("toad-treenodecell", TreeNodeCell)
}

export function isInitialized() {
    return _isInitialized
}

initialize()
