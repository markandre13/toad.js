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

import { Model, InferModelParameter, ModelEvent, ALL } from "../model/Model"
import { View } from "./View"
import { HTMLElementProps } from "toad.jsx"

export interface ModelViewProps<M> extends HTMLElementProps {
    model?: M
}

/**
 * @category View
 */
export class ModelView<M extends Model<E>, E = InferModelParameter<M>> extends View {
    model?: M = undefined

    constructor(init?: ModelViewProps<M>) {
        super(init)
        if (init?.model !== undefined) {
            this.setModel(init.model)
        }
    }

    // NOTE: these were 'abstract' but then the 'override' did not work
    updateModel(): void {}
    updateView(event: E | ModelEvent): void {}

    override setModel(model?: M): void {
        if (model === this.model) return

        const view = this

        if (this.model) {
            this.model.modified.remove(view)
        }

        if (model) {
            model.modified.add((event) => view.updateView(event), view)
        }

        this.model = model
        if (this.isConnected) {
            this.updateView({ type: ALL })
        }
    }

    override connectedCallback() {
        super.connectedCallback()
        if (this.model) {
            this.updateView({ type: ALL })
        }
    }
}
