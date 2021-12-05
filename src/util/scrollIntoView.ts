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

let animationFrameCount = 468

export function setAnimationFrameCount(frames: number) {
    animationFrameCount = frames
}

// FIXME: handle concurrent smoothScroll within the same scrollableParent
export function scrollIntoView(element: Element | undefined): void {
    if (element === undefined)
        return
    // console.log(`scrollIntoView(${element})`)
    const scrollableParent = findScrollableParent(element)
    if (scrollableParent === undefined)
        return
    const parentRect = scrollableParent.getBoundingClientRect()
    const clientRect = element.getBoundingClientRect()

    if (scrollableParent !== document.body) {       
        const {x, y} = calculateScrollGoal(scrollableParent, parentRect, clientRect)
        // console.log(`  scroll from (${scrollableParent.scrollLeft}, ${scrollableParent.scrollTop}) to (${x}, ${y})`)
        smoothScroll(scrollableParent, x, y)
        if (window.getComputedStyle(scrollableParent).position !== 'fixed') {
            window.scrollBy({
                left: parentRect.left,
                top: parentRect.top,
                behavior: 'smooth'
            })
        }
    } else {
        window.scrollBy({
            left: clientRect.left,
            top: clientRect.top,
            behavior: 'smooth'
        })
    }
}

function calculateScrollGoal(scrollableParent: Element, parentRect: DOMRect, clientRect: DOMRect): {x: number, y: number} {
    const GAP = 16
    const clientLeft   = clientRect.left   + scrollableParent.scrollLeft - parentRect.left - GAP
    const clientRight  = clientRect.right  + scrollableParent.scrollLeft - parentRect.left + GAP
    const clientTop    = clientRect.top    + scrollableParent.scrollTop  - parentRect.top  - GAP
    const clientBottom = clientRect.bottom + scrollableParent.scrollTop  - parentRect.top  + GAP
    const parentWidth = scrollableParent.clientWidth
    const parentHeight = scrollableParent.clientHeight

    var x = scrollableParent.scrollLeft
    var y = scrollableParent.scrollTop

    // @ts-ignore
    // console.log(`calculateScrollGoal() className=${scrollableParent.className} ${scrollableParent.foo} client=(${clientLeft}, ${clientRight}, ${clientTop}, ${clientBottom}), parent=(${parentWidth}, ${parentHeight}), scroll=(${x}, ${y})`)

    if (clientRight - clientLeft - 2*GAP > parentWidth)
        x = clientLeft
    else if (clientRight > scrollableParent.scrollLeft + parentWidth)
        x = clientRight - parentWidth
    else if (clientLeft < scrollableParent.scrollLeft)
        x = clientLeft

    if (clientBottom - clientTop - 2*GAP > parentHeight)
        y = clientTop
    else if (clientBottom > scrollableParent.scrollTop + parentHeight)
        y = clientBottom - parentHeight
    else if (clientTop < scrollableParent.scrollTop)
        y = clientTop

    x = Math.max(0, x)
    y = Math.max(0, y)

    // console.log(`scroll goal = (${x}, ${y})`)

    return { x, y }
}

const concurrentScroll = new Map<Element, {x:number, y:number}>()

function smoothScroll(scrollable: Element, x: number, y: number): void {

    let activeGoal = concurrentScroll.get(scrollable)
    if (activeGoal === undefined) {
        activeGoal = {x: x, y: y}
        concurrentScroll.set(scrollable, activeGoal)
        // console.log(`initial goal ${x}, ${y}`)
    } else {
        // console.log(`update goal from ${activeGoal.x}, ${activeGoal.y} to ${x}, ${y}`)
        activeGoal.x = x
        activeGoal.y = y
    }

    let startX:number, startY: number
    if (scrollable === document.body) {
        startX = window.scrollX || window.pageXOffset
        startY = window.scrollY || window.pageYOffset
    } else {
        startX = scrollable.scrollLeft
        startY = scrollable.scrollTop
    }
    const deltaX = x - startX
    const deltaY = y - startY
    if (deltaX === 0 && deltaY === 0) {
        // console.log(`no delta, abort smoothScroll from ${startX}, ${startY} to ${x}, ${y}`)
        // console.log(`delete goal`)
        concurrentScroll.delete(scrollable)
        return
    }

    animate( (value: number): boolean => {
        // console.log(`animate active ${activeGoal!.x}, ${activeGoal!.y}, local ${x}, ${y}`)
        if (activeGoal!.x !== x || activeGoal!.y !== y) {
            // console.log("  skip")
            return false
        }

        const nx = startX + value * deltaX
        const ny = startY + value * deltaY

        if (scrollable === document.body) {
            window.scrollTo(nx, ny)
        } else {
            // const ox = scrollable.scrollLeft
            // const oy = scrollable.scrollTop

            scrollable.scrollLeft = nx
            scrollable.scrollTop  = ny
            // @ts-ignore
            // scrollable.foo = `scroll=${nx}, ${ny}`
            // console.log(`set scrollable className=${scrollable.className} from (${ox}, ${oy}) to (${nx}, ${ny}) (now: ${scrollable.scrollLeft}, ${scrollable.scrollTop})`)
        }
        if (value === 1) {
            // console.log(`delete goal`)
            concurrentScroll.delete(scrollable)
        }
        return true
    })
}

let idSource = 0

export function animate(callback: (value: number) => boolean) {
    setTimeout( ()=> { window.requestAnimationFrame(animateStep.bind(window, callback, undefined, undefined)) } , 0)
}

function animateStep(callback: (value: number) => boolean, startTime?: number, id?: number) {
    if (startTime === undefined) {
        startTime = Date.now()
        id = ++idSource
    }

    const time = Date.now()
    let elapsed = animationFrameCount > 0 ? (time - startTime) / animationFrameCount : 1

    elapsed = elapsed > 1 ? 1 : elapsed

    const value = ease(elapsed)
    // console.log(`animate: id=${id}, value=${elapsed}`)
    if (callback(value) === false)
        return
    if (value < 1.0) {
        window.requestAnimationFrame(animateStep.bind(window, callback, startTime, id))
    }
}

function ease(k: number): number {
    return 0.5 * (1 - Math.cos(Math.PI * k))
}

var ROUNDING_TOLERANCE = isMicrosoftBrowser(window.navigator.userAgent) ? 1 : 0

function isMicrosoftBrowser(userAgent: string): boolean {
    const userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/']
    return new RegExp(userAgentPatterns.join('|')).test(userAgent)
}

export function findScrollableParent(el: Element): Element | undefined {
    while (el !== document.body && isScrollable(el) === false) {
        if (el.parentElement === null)
            return undefined
        el = el.parentElement
    }
    return el
}

export function isScrollable(el: Element): boolean {
    const isScrollableY = hasScrollableSpace(el, "Y") && canOverflow(el, "Y")
    const isScrollableX = hasScrollableSpace(el, "X") && canOverflow(el, "X")
    return isScrollableY || isScrollableX
}

function hasScrollableSpace(el: Element, axis: "X"|"Y"): boolean {
    if (axis === 'X')
        return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth
    else
        return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight
}

function canOverflow(el: Element, axis: "X"|"Y"): boolean {
    const style = window.getComputedStyle(el, null) as any
    const overflowValue = style['overflow' + axis]
    return overflowValue === 'auto' || overflowValue === 'scroll'
}