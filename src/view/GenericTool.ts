/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2021 Mark-André Hopf <mhopf@mark13.org>
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

import { Model } from "../model/Model"
import { View } from "./View"

export abstract class GenericTool<T extends Model> extends View {
    static allTools = new Set<GenericTool<any>>()
    static activeTool: GenericTool<any> | undefined
    static activeView: View | undefined

    // this doesn't handle the tool type yet
    static focusIn(view: View) {
        // console.log(`focusIn ${view.nodeName}`)
        const viewParents = new Map<Element, number>()
        for(let parent = view.parentElement, distance=0; parent !== null; parent = parent.parentElement, ++distance) {
            viewParents.set(parent, distance)
        }
        let closestToolDistance = Number.MAX_SAFE_INTEGER
        let closetTool: GenericTool<any> | undefined
        for(const tool of this.allTools.values()) {
            for(let toolParent = tool.parentElement, depth=0; toolParent !== null; toolParent = toolParent.parentElement, ++depth) {
                const toolDistance = viewParents.get(toolParent)
                // console.log(`focusIn: view has a tool parent ${toolParent.nodeName} at ${toolDistance}`)
                if (toolDistance === undefined)
                    continue
                if (closestToolDistance < toolDistance)
                    continue
                // console.log(`update tool distance to ${toolDistance}`)
                closestToolDistance = toolDistance
                closetTool = tool
            } 
        }
        // console.log(`found closest tool ${closetTool?.nodeName}`)
        if (closetTool === undefined)
            return
        this.activeTool = closetTool
        this.activeView = view
    }

    static focusOut(view: View) {
        if (this.activeView === view) {
            this.activeTool = undefined
            this.activeView = undefined
        }
    }

    connectedCallback() {
        super.connectedCallback()
        // console.log("GenericTool: connected")
        GenericTool.allTools.add(this)
    }

    disconnectedCallback() {
        if (GenericTool.activeTool === this) {
            GenericTool.activeTool = undefined
            GenericTool.activeView = undefined
        }
        GenericTool.allTools.delete(this)
        super.disconnectedCallback()
        // console.log("GenericTool: disconnected")
    }
}

window.addEventListener("focusin", (event: FocusEvent) => {
    if (event.relatedTarget instanceof View) {
        GenericTool.focusOut(event.relatedTarget)
    }
    if (event.target instanceof View) {
        GenericTool.focusIn(event.target)
    }
})