import { popAutorelease, pushAutorelease } from "../reactive/Signal"
import { Fragment, replaceChildren } from "toad.jsx"

const modalDialogStack: HTMLDialogElement[] = []

function firstTabbable(root: Element | ShadowRoot): HTMLElement | undefined {
    for (const element of root.querySelectorAll<HTMLElement>("*")) {
        if (element.tabIndex >= 0 && !(element as HTMLInputElement).disabled) {
            return element
        }
        if (element.shadowRoot) {
            const found = firstTabbable(element.shadowRoot)
            if (found) {
                return found
            }
        }
    }
    return undefined
}

export function openModalDialog(createContent: () => Element | Fragment) {
    const dialog = document.createElement("dialog")
    dialog.addEventListener("close", (_event) => {
        document.body.removeChild(dialog)
    })
    pushAutorelease()
    replaceChildren(dialog, createContent())
    document.body.appendChild(dialog)
    modalDialogStack.push(dialog)
    dialog.showModal()
    firstTabbable(dialog)?.focus()
}

export function closeModalDialog() {
    modalDialogStack.pop()?.close()
    popAutorelease()
}
