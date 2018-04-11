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

/**
 *
 * Utility functions to work with the DOM.
 *
 */

export function instantiateTemplate(name: string): DocumentFragment {
  return tmpl(name);
}
export function tmpl(name: string): DocumentFragment {
  let t = document.querySelector('template[id="'+name+'"]');
  if (!t) {
    throw new Error("failed to find template '"+name+"'");
  }
  let x = t as HTMLTemplateElement;
  let z: DocumentFragment = x.content;
  let y = document.importNode(z, true);
  return y;
}
export function find(node: Element|DocumentFragment, selector: string): Element|null {
  return node.querySelector(selector);
}
export function tag(name: string): HTMLElement { return document.createElement(name); }
export function txt(txt: string): Text { return document.createTextNode(txt); }
export function img(src: string): HTMLImageElement {
  let img = document.createElement("img") as HTMLImageElement
  img.src = src
  return img
}
export function add(n0: Node, n1: Node): void { n0.appendChild(n1); }
export function remove(n: Node): void { 
  if (!n.parentNode)
    throw Error("element has no parent");
  n.parentNode.removeChild(n);
}
export function erase(n: Element): void { while(n.firstChild) n.removeChild(n.firstChild); }

export function grabMouse(event: MouseEvent) {
/*
  let target = event.target as HTMLElement
//  console.log(event)
    
  let documentMouseMove = function(event: MouseEvent) {
//  console.log("document.moveMove", target)
//  target.dispatchEvent(new MouseEvent("mousemove", {}))
    // srcElement, target, toElement, offsetX, offsetY, ...?
    target.onmousemove(event)
    event.stopPropagation()
  }

  let documentMouseUp = function(event: MouseEvent) {
//  console.log("document.mouseUp", target)
//  target.dispatchEvent(new MouseEvent("mouseup", {}))
    target.onmouseup(event)
    document.removeEventListener("mousemove", documentMouseMove, {capture: true})
    document.removeEventListener("mouseup", documentMouseUp, {capture: true})
    document.body.style.pointerEvents = "auto"
    event.stopPropagation()
  }

  document.addEventListener("mousemove", documentMouseMove, {capture: true})
  document.addEventListener("mouseup", documentMouseUp, {capture: true})
  document.body.style.pointerEvents = "none"
  event.preventDefault()
  event.stopPropagation()
*/
}

export function attribute(element: Element, name: string): string {
  let attribute = element.getAttribute(name)
  if (attribute === null) {
    console.log("missing attribute '"+name+"' in ", element)
    throw Error("missing attribute '"+name+"' in "+element.nodeName)
  }
  return attribute
}

export function attributeOrUndefined(element: Element, name: string): string|undefined {
  let attribute = element.getAttribute(name)
  return attribute === null ? undefined : attribute
}

export function order(first: Node, second: Node): boolean {
  let parentsOfFirstNode = new Map<Node, Node>()
  let node: Node|null
  
  let firstPrevious = first
  node = first
  while(true) {
    firstPrevious = node
    node = node.parentNode
    if (!node)
      break
    parentsOfFirstNode.set(node, firstPrevious)
  }

  let secondPrevious = second
  node = second
  while(node) {
    secondPrevious = node
    node = node.parentNode
    if (!node)
      throw Error("fuck")
    let lookup = parentsOfFirstNode.get(node)
    if (lookup) {
      firstPrevious = lookup
      break
    }
    node = node.parentNode
  }
  if (!node)
    throw Error("fuck")
  
  for(let child of node!.childNodes) {
    if (child === firstPrevious)
      return true
    if (child === secondPrevious)
      return false
  }
  throw Error("fuck")
}
