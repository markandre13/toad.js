/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018, 2021 Mark-André Hopf <mhopf@mark13.org>
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

export { Point, MatrixStruct, Matrix } from "./matrix"
export { Signal } from "./signal"
export { Action } from "./action"
export { Model, GenericModel, TextModel, HtmlModel, NumberModel, BooleanModel, OptionModel, OptionModelBase } from "./model"

export { View, GenericView, ActionView, SlotView } from "./view"
export { ButtonView } from "./view/ButtonView"
export { ToolButton } from "./view/ToolButton"	// FIXME: no View in name?
export { CheckboxView } from "./view/CheckboxView"
export { MenuButton } from "./menu/MenuButton"	// FIXME: no View in name?
export { SliderView } from "./view/SliderView"
export { TextView } from "./view/TextView"
export { TextArea } from "./view/TextArea"
export { TextTool } from "./view/TextTool"
export { ToadIf } from "./view/ToadIf"

export { TableView } from "./table/TableView"
export { TableAdapter } from "./table/TableAdapter"
export { TypedTableAdapter } from "./table/TypedTableAdapter"
export { TableModel } from "./table/TableModel"
export { TypedTableModel } from "./table/TypedTableModel"
export { SelectionModel } from "./table/SelectionModel"
export { TableEditMode, registerTableModelLocator, createTableModel } from "./table/table"
export { TableEventType } from "./table/TableEventType"
export { TableEvent } from "./table/TableEvent"
export { TreeModel } from "./table/TreeModel"
export { TreeAdapter } from "./table/TreeAdapter"
export { TreeNode } from "./table/TreeNode"
export { TreeNodeModel } from "./table/TreeNodeModel"

export { Controller, Template, Dialog, bind, action, unbind, globalController, boolean } from "./controller"
