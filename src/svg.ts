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

// utility functions to easy working with SVG

export function line(x1: number, y1: number, x2: number, y2: number): SVGLineElement {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "line")
    node.setAttributeNS("", "stroke", "#000")
    node.setAttributeNS("", "x1", `${x1}`)
    node.setAttributeNS("", "y1", `${y1}`)
    node.setAttributeNS("", "x2", `${x2}`)
    node.setAttributeNS("", "y2", `${y2}`)
    return node
}

export function rectangle(x: number, y: number, width: number, height: number): SVGRectElement {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    node.setAttributeNS("", "stroke", "#000")
    node.setAttributeNS("", "fill", "none")
    node.setAttributeNS("", "x", `${x}`)
    node.setAttributeNS("", "y", `${y}`)
    node.setAttributeNS("", "width", `${width}`)
    node.setAttributeNS("", "height", `${height}`)
    return node
}

export function circle(cx: number, cy: number, r: number): SVGCircleElement {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    node.setAttributeNS("", "stroke", "#000")
    node.setAttributeNS("", "cx", `${cx}`)
    node.setAttributeNS("", "cy", `${cy}`)
    node.setAttributeNS("", "r", `${r}`)
    return node
}

export function text(x: number, y: number, text: string): SVGTextElement {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "text")
    node.setAttributeNS("", "fill", "#000")
    node.setAttributeNS("", "x", `${x}`)
    node.setAttributeNS("", "y", `${y}`)
    node.appendChild(document.createTextNode(text))
    node.style.pointerEvents = "none"
    return node
}