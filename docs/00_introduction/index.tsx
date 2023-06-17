import { OptionModel } from "@toad/model/OptionModel"
import { parseColor, rgb2hsl } from "@toad/util/color"

import { Select } from "@toad/view/Select"
import { code } from "./index.source"

//
// APPLICATION LAYER
//

enum MacColor {
    BONDI = "#0095b6",
    BLUEBERRY = "#4169e1",
    GRAPE = "#421c52",
    STRAWBERRY = "#fe2c54",
    TANGERINE = "#f28500",
    LIME = "#32cd32",
}

const macColor = new OptionModel(MacColor.BONDI, [
    [MacColor.BONDI, <div style={{ color: "#ffffff", background: MacColor.BONDI }}>Bondi</div>],
    [MacColor.BLUEBERRY, <div style={{ color: "#ffffff", background: MacColor.BLUEBERRY }}>Blueberry</div>],
    [MacColor.GRAPE, <div style={{ color: "ffffff", background: MacColor.GRAPE }}>Grape</div>],
    [MacColor.STRAWBERRY, <div style={{ color: "#000000", background: MacColor.STRAWBERRY }}>Strawberry</div>],
    [MacColor.TANGERINE, <div style={{ color: "#000000", background: MacColor.TANGERINE }}>Tangerine</div>],
    [MacColor.LIME, <div style={{ color: "#000000", background: MacColor.LIME }}>Lime</div>],
])
macColor.modified.add((color) => applyMacColor(color))

function applyMacColor(value: MacColor) {
    const rgb = parseColor(value)!
    const hsl = rgb2hsl(rgb)

    hsl.s *= 100
    hsl.l *= 100

    const obj = document.getElementById("macimg") as HTMLObjectElement
    if (obj === null) {
        return
    }
    const content = obj.contentDocument
    if (content === null) {
        return
    }
    content
        .querySelectorAll(".mac-light")
        .forEach((e) => ((e as SVGElement).style.fill = `hsl(${hsl.h} ${hsl.s}% ${hsl.l + 5}%)`))
    content
        .querySelectorAll(".mac-shadow")
        .forEach((e) => ((e as SVGElement).style.fill = `hsl(${hsl.h} ${hsl.s}% ${hsl.l - 5}%)`))
}

//
// VIEW LAYER
//

export default () => (
    <>
        <div style={{ textAlign: "center" }}>
            <object
                id="macimg"
                type="image/svg+xml"
                width="305"
                height="300"
                data="static/non-beige-pc.svg"
                onload={() => applyMacColor(macColor.value)}
            >
                Illustration of an iMac G3
            </object>
            <br />
            <Select model={macColor} />
        </div>
        {code}
    </>
)
