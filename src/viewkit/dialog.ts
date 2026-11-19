import { popAutorelease, pushAutorelease } from "../reactive/Signal"
import { Fragment, replaceChildren } from "toad.jsx"

const modalDialogStack: HTMLDialogElement[] = []

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
}

export function closeModalDialog() {
    modalDialogStack.pop()?.close()
    popAutorelease()
}
