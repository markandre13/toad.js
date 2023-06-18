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

import { Model } from "../model/Model"
import { globalController } from "../controller/globalController"
import { Controller } from "../controller/Controller"
import { HTMLElementProps, setInitialProperties } from "toad.jsx"

// TODO: do we use this directly or is GenericView it's only subclass?

/**
 * @category View
 */
export class View extends HTMLElement {

    public static define(name: string, view: CustomElementConstructor, options?: ElementDefinitionOptions) {
        const element = window.customElements.get(name)
        if (element === undefined) {
            window.customElements.define(name, view, options)
        } else {
            if (element !== view) {
                for(let i = 0; i<255; ++i) {
                    const dname = `${name}-duplicate-${i}`
                    if (window.customElements.get(dname) === undefined) {
                        console.log(`View::define(${name}, ...) with different constructor, using ${dname} instead (known issue on Safari and Edge)`)
                        window.customElements.define(dname, view, options)
                        return
                    }
                }
                console.error(`View::define(${name}, ...): attempt to redefine view with different constructor (known issue on Safari and Edge), giving up after 255 times`)
            }
        }
    }

    constructor(props?: HTMLElementProps) {
        super()
        setInitialProperties(this, props)
    }

    controller?: Controller

    setModel(model?: Model<any>): void {
        console.trace(`Please note that View.setModel(model) has no implementation.`)
    }

    getModelId(): string {
        if (!this.hasAttribute("model"))
            throw Error("no 'model' attribute")
        let modelId = this.getAttribute("model") // FIXME: both hasAttribute & getAttribute? really?
        if (!modelId)
            throw Error("no model id")
        return "M:" + modelId
    }

    getActionId(): string {
        if (!this.hasAttribute("action"))
            throw Error("no 'action' attribute")
        let actionId = this.getAttribute("action") // FIXME: both hasAttribute & getAttribute? really?
        if (!actionId)
            throw Error("no action id")
        return "A:" + actionId
    }

    connectedCallback() {
        if (this.controller)
            return
        let modelId = ""
        try {
            modelId = this.getModelId()
        } catch (error) {
        }
        if (modelId != "")
            globalController.registerView(modelId, this)
    }

    disconnectedCallback() {
        if (this.controller)
            this.controller.unregisterView(this)
    }
}
