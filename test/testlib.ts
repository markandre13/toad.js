// @testing-library/dom replacement, whose esm included some babel file via require()
// https://testing-library.com/docs/dom-testing-library/cheatsheet
// https://testing-library.com/docs/user-event/intro

export function sleep(milliseconds: number = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success')
        }, milliseconds)
    })
}

export function px2int(s: string) {
    return parseInt(s.substring(0, s.length - 2))
}

export function px2float(s: string) {
    return parseFloat(s.substring(0, s.length - 2))
}

export function getById(id: string) {
    return document.getElementById(id)
}

export function getByText(text: string, node: Node = document): Element | undefined {
    if (node instanceof Text) {
        if (text == node.nodeValue) {
            return node.parentNode as Element
        }
    }
    if (node instanceof HTMLElement) {
        if (node.shadowRoot) {
            for (const child of node.shadowRoot.childNodes) {
                const r = getByText(text, child)
                if (r !== undefined) {
                    return r
                }
            }
        }
    }
    for (const child of node.childNodes) {
        const r = getByText(text, child)
        if (r !== undefined) {
            return r
        }
    }
    return undefined
}

export function activeElement(): Element | undefined {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement
    }
    return active === null ? undefined : active
}

export function keyboard(init: KeyboardEventInit) {
    const old = activeElement()
    old?.dispatchEvent(new KeyboardEvent("keydown", init))
    old?.dispatchEvent(new KeyboardEvent("keyup", init))
}

export function click(node: Element) {
    const bounds = node.getBoundingClientRect()
    const clientX = bounds.x + bounds.width / 2
    const clientY = bounds.y + bounds.height / 2
    const old = activeElement()

    // console.log(`click() target=${node}, relatedTarget=${old}`)
    // console.log(node)
    // console.log(old)

    // POINTER DOWN
    node.dispatchEvent(
        new PointerEvent("pointerdown", {
            bubbles: true,
            clientX,
            clientY
        })
    )
    old?.dispatchEvent(
        new FocusEvent("blur", {
            bubbles: true,
            relatedTarget: node
        })
    )
    old?.dispatchEvent(
        new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: node
        })
    )
    node?.dispatchEvent(
        new FocusEvent("focus", {
            bubbles: true,
        })
    )
    node?.dispatchEvent(
        new FocusEvent("focusin", {
            bubbles: true,
            relatedTarget: old
        })
    )

    // POINTER UP
    node.dispatchEvent(
        new PointerEvent("pointerup", {
            bubbles: true, clientX, clientY
        })
    )
}

// tabIndex
//   -1: can receive focus but not navigated to via keyboard(?) (e.g. body, div)
//   0: can receive focus
//   >0: can receive focus and uses a custom tab order (shouldn't be used)

interface CTX {
    currentFocus?: Element
    passedCurrentFocus: boolean
    previousFocusable?: Element
}

function forwardFocus() {
    return moveFocus(true)
}

function backwardFocus() {
    return moveFocus(false)
}

function moveFocus(forward: boolean, element: Element = document.body, ctx: CTX | undefined = undefined): Element | undefined {
    if (ctx === undefined) {
        ctx = {
            currentFocus: activeElement(),
            passedCurrentFocus: false,
            previousFocusable: undefined
        }
    }

    // console.log(`moveFocus(foward=${forward}, node=${element.nodeName}, previous=${ctx.previousFocusable?.nodeName}, found=${ctx.passedCurrentFocus}, active=${ctx.currentFocus?.nodeName})`)

    if (element === ctx.currentFocus) {
        if (!forward) {
            // console.log(`  found the active one, return previous`)
            return ctx.previousFocusable
        }
        ctx.passedCurrentFocus = true
    } else
        if (element instanceof HTMLElement) {
            // console.log(`${element.nodeName} ${element.nodeType} ${element.tabIndex}`)
            if (element.tabIndex >= 0) {
                if (forward && ctx.passedCurrentFocus) {
                    // console.log(`  found tabIndex`)
                    return element
                }
                ctx.previousFocusable = element
            }
        }

    for (let n of element.children) {
        const r = moveFocus(forward, n, ctx)
        if (r !== undefined) {
            return r
        }
    }
    // console.log(`  found nothing`)
    return undefined
}

export function tabForward() {
    tab(forwardFocus(), false)
}

export function tabBackward() {
    tab(backwardFocus(), true)
}

function tab(next: Element | undefined, shiftKey: boolean) {
    // console.log(`tab to ${node?.nodeName}`)

    const old = activeElement()
    if (!old) {
        throw Error("tab: no active element")
    }
    if (!old.dispatchEvent(
        new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            shiftKey: shiftKey,
            key: "Tab"
        })
    )) {
        return
    }

    if (next === undefined) {
        throw Error("tab: no next element")
    }

    old?.dispatchEvent(
        new FocusEvent("blur", {
            bubbles: true,
            relatedTarget: next
        })
    )
    old?.dispatchEvent(
        new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: next
        })
    );
    (next as HTMLElement).focus()
    // node.dispatchEvent(
    //     new FocusEvent("focus", {
    //         bubbles: true,
    //         relatedTarget: old
    //     })
    // )
    next.dispatchEvent(
        new FocusEvent("focusin", {
            bubbles: true,
            relatedTarget: old
        })
    )
    old?.dispatchEvent(
        new KeyboardEvent("keyup", {
            bubbles: true,
            key: "Tab"
        })
    )
}
