import { popAutorelease, pushAutorelease } from "@toad/reactive/Signal"
import { Fragment } from "toad.jsx"

const modalDialogStack: HTMLDialogElement[] = []

export function openModalDialog(createContent: () => Element | Fragment) {
    const dialog = document.createElement("dialog")
    dialog.addEventListener("close", (event) => {
        document.body.removeChild(dialog)
    })
    pushAutorelease()

    const content = createContent()
    if (content instanceof Element) {
        dialog.replaceChildren(content)
    } else {
        dialog.replaceChildren(...content)
    }

    document.body.appendChild(dialog)
    modalDialogStack.push(dialog)
    dialog.showModal()
}

export function closeModalDialog() {
    modalDialogStack.pop()?.close()
    popAutorelease()
}
