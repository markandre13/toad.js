import { loadStyle } from "@toad/util/loadStyle"
import { main as buttonMain } from "./button.code"

loadStyle()

window.onload = () => {
    buttonMain()
}
