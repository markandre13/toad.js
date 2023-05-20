import { loadComponents } from "@toad/util/loadComponents"
import { loadStyle } from "@toad/util/loadStyle"
import { main as buttonMain } from "./button.code"

loadStyle()
loadComponents()

window.onload = () => {
    buttonMain()
}
