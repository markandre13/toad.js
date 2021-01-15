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

import { BooleanModel } from "../model/BooleanModel"
import { TextModel } from "../model/TextModel"
import { Model } from "../model/Model"
import { Action } from "../action"
import { Controller } from "./Controller"

export let globalController = new Controller()

export function bind<T>(modelId: string, model: Model<T>): void {
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
