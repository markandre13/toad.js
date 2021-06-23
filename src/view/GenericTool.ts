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
import { View } from "./View"

// TODO: GenericTool<T> doesn't use T yet, the is to activate not just the tool for the view with the focus, but all tools with those view's model
export abstract class GenericTool<T extends Model> extends View {
    static allTools = new Set<GenericTool<any>>()
    static activeTool: GenericTool<any> | undefined
    static activeView: View | undefined

    abstract canHandle(view: View): boolean
    abstract activate(): void
    abstract deactivate(): void

    setModel(model?: Model): void { }

    static focusIn(view: View) {
        // console.log(`GenericView.focusIn(${view.nodeName})`)
        const viewParents = new Map<Element, number>()
        for(let parent = view.parentElement, distance=0; parent !== null; parent = parent.parentElement, ++distance) {
            viewParents.set(parent, distance)
        }

        // find view's closest parent that has tool children
        let closestToolDistance = Number.MAX_SAFE_INTEGER
        let closestParent: Element | undefined
        let closestToolList = new Array<GenericTool<any>>()
        for(const tool of this.allTools.values()) {
            if (!tool.canHandle(view))
                continue
            for(let toolParent = tool.parentElement, depth=0; toolParent !== null; toolParent = toolParent.parentElement, ++depth) {
                const toolDistance = viewParents.get(toolParent)
                // console.log(`focusIn: view has a tool parent ${toolParent.nodeName} at ${toolDistance}`)
                if (toolDistance === undefined)
                    continue
                if (closestToolDistance < toolDistance)
                    continue
                if (closestToolDistance > toolDistance) {
                    closestToolList.length = 0
                }
                // console.log(`update tool distance to ${toolDistance}`)
                closestToolDistance = toolDistance
                closestParent = toolParent
                closestToolList.push(tool)
            } 
        }
        if (!closestParent) {
            console.log(`GenericView.focusIn(${view.nodeName}): couldn't find a parent with GenericTool children`)
            return
        }

        // within that parent find the tool which follows after the view
        let closestTool: GenericTool<any> | undefined
        const viewIndex = GenericTool.getIndex(view, closestParent)
        // console.log(`view has index ${viewIndex}`)
        let closestNextSiblingIndex = Number.MIN_SAFE_INTEGER
        for(let tool of closestToolList) {
            const toolIndex = GenericTool.getIndex(tool, closestParent!)
            // console.log(`tool ${tool?.nodeName} ${tool?.id} has index ${toolIndex}`)
            if (toolIndex < viewIndex && toolIndex > closestNextSiblingIndex) {
                closestNextSiblingIndex = toolIndex
                closestTool = tool
            }
        }

        // console.log(`found closest tool ${closestTool?.nodeName} ${closestTool?.id} out of ${closestToolList.length}`)
        this.setActive(closestTool, view)
    }

    static getIndex(view: Element, parent: Element): number {
        if (parent === undefined) {
            console.trace(`GenericTool.getIndex(${view}, ${parent})`)
        }

        let element = view
        while(element.parentElement !== parent)
            element = element.parentElement!
        return Array.from(parent.childNodes).indexOf(element)
    }

    static setActive(tool?: GenericTool<any>, view?: View) {
        if (this.activeTool)
            this.activeTool.deactivate()
        this.activeTool = tool
        this.activeView = view
        // console.log(`setActiveTool`)
        // console.log(tool)
        if (tool)
            tool.activate()
    }

    static focusOut(view: View) {
        if (this.activeView === view) {
            this.setActive(undefined, undefined)
        }
    }

    override connectedCallback() {
        super.connectedCallback()
        // console.log("GenericTool: connected")
        GenericTool.allTools.add(this)
    }

    override disconnectedCallback() {
        if (GenericTool.activeTool === this) {
            GenericTool.setActive(undefined, undefined)
        }
        GenericTool.allTools.delete(this)
        super.disconnectedCallback()
        // console.log("GenericTool: disconnected")
    }
}

window.addEventListener("focusin", (event: FocusEvent) => {
    if (event.target instanceof GenericTool)
        return
    
    if (event.relatedTarget instanceof View) {
        GenericTool.focusOut(event.relatedTarget)
    }
    if (event.target instanceof View) {
        GenericTool.focusIn(event.target)
    }
})