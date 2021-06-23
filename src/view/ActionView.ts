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

import { TextModel } from "../model/TextModel"
import { Model } from "../model/Model"
import { globalController } from "../controller/globalController"
import { Action } from "../model/Action"
import { GenericView } from "./GenericView"

// FIXME: ActionView should also be a template instead of having a fixed TextModel

export abstract class ActionView extends GenericView<TextModel> {
  action?: Action

  constructor() {
    super()
  }

  override connectedCallback() {
    if (this.controller) {
      this.updateView()
      return
    }

    try {
      globalController.registerView(this.getActionId(), this) // FIXME: don't register always on globalController
    }
    catch (e) {
    }

    try {
      globalController.registerView(this.getModelId(), this) // FIXME: don't register always on globalController
    }
    catch (e) {
    }

    this.updateView()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    if (this.controller)
      this.controller.unregisterView(this)
  }

  override setModel(model?: Model): void {
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
    }
    else if (model instanceof TextModel) {
      // FIXME: what if this.model is already set?
      this.model = model
      this.model.modified.add(() => {
        this.updateView()
      }, this)
    } else {
      throw Error("unexpected model of type " + model.constructor.name)
    }

    this.updateView()
  }

  isEnabled(): boolean {
    return this.action !== undefined && this.action.enabled
  }
}
