// FIXME: generate this file

import { loadComponents } from "@toad/util/loadComponents"
import { loadStyle } from "@toad/util/loadStyle"
import { main as buttonMain } from "./button.code"
import { main as sliderMain } from "./slider.code"
import { main as textMain } from "./text.code"

loadStyle()
loadComponents()

window.onload = () => {
    buttonMain()
    sliderMain()
    textMain()
}
