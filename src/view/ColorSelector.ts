import { FixedNumberModel } from "@toad/model/FixedNumberModel"
import { div, span, text } from "@toad/util/lsx"
import { hsv2rgb, rgb2hsv } from "@toad/util/color"
import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { Slider } from "./Slider"
import { Text } from "./Text"
import { style } from "@toad/style/tx-colorselector"

// i know, this implementation is a mess. i just wanted to get it done.

export class ColorSelector extends View {
    constructor(init?: HTMLElementProps) {
        super(init)
        this.attachShadow({ mode: 'open' })
        const canvas = document.createElement("canvas")
        canvas.id = "canvas"
        canvas.width = 256
        canvas.height = 256

        const ctx = canvas.getContext("2d")!
        const myImageData = ctx.createImageData(256, 256)

        for (let iy = 0, y = -1.0; iy < 256; ++iy, y += 2.0 / 255.0) {
            for (let ix = 0, x = -1.0; ix < 256; ++ix, x += 2.0 / 255.0) {
                let s = Math.hypot(x, y)
                if (s <= 1.0) {
                    const { r, g, b } = hsv2rgb(
                        (Math.atan2(y, x) + Math.PI) / (2.0 * Math.PI) * 360.0,
                        s,
                        1.0)
                    const ptr = (ix + iy * myImageData.width) * 4
                    myImageData.data[ptr] = Math.round(r * 255)
                    myImageData.data[ptr + 1] = Math.round(g * 255)
                    myImageData.data[ptr + 2] = Math.round(b * 255)
                    myImageData.data[ptr + 3] = 255
                }
            }
        }

        ctx.putImageData(myImageData, 0, 0)

        const h = new FixedNumberModel(0, { min: 0, max: 360, step: 1 })
        const s = new FixedNumberModel(0, { min: 0, max: 100, step: 1 })
        const v = new FixedNumberModel(0, { min: 0, max: 100, step: 1 })

        const r = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })
        const g = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })
        const b = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })

        const hsCaret = span()
        hsCaret.id = "hsv"
        hsCaret.style.left = `60px`
        hsCaret.style.top = `160px`

        let block = false

        const placeHSV = () => {
            const hue = h.value / 360.0 * 2 * Math.PI - Math.PI
            const saturation = s.value / 100.0 * 128.0
            let x = Math.round(saturation * Math.cos(hue)) + 8 + 128
            let y = Math.round(saturation * Math.sin(hue)) + 8 + 128
            hsCaret.style.left = `${x}px`
            hsCaret.style.top = `${y}px`

            const color = hsv2rgb(h.value, s.value / 100, 1)
            hsCaret.style.backgroundColor = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`

            newColor.style.backgroundColor = `rgb(${r.value}, ${g.value}, ${b.value})`
        }

        const hsvChanged = () => {
            if (block) {
                return
            }
            placeHSV()

            const rgb = hsv2rgb(h.value, s.value / 100, v.value / 100)
            block = true
            r.value = rgb.r * 255
            g.value = rgb.g * 255
            b.value = rgb.b * 255
            block = false
        }
        const rgbChanged = () => {
            if (block) {
                return
            }
            const hsv = rgb2hsv(r.value / 255, g.value / 255, b.value / 255)
            block = true
            h.value = hsv.h
            s.value = hsv.s * 100
            v.value = hsv.v * 100
            placeHSV()
            block = false
        }
        s.modified.add(hsvChanged)
        h.modified.add(hsvChanged)
        v.modified.add(hsvChanged)
        r.modified.add(rgbChanged)
        g.modified.add(rgbChanged)
        b.modified.add(rgbChanged)

        let skew: number | undefined
        hsCaret.onpointerdown = (ev: PointerEvent) => {
            skew = 1
            hsCaret.setPointerCapture(ev.pointerId)
            ev.preventDefault()
        }
        hsCaret.onpointermove = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            ev.preventDefault()
            const b = canvas.getBoundingClientRect()

            let x = ev.clientX - b.x
            let y = ev.clientY - b.y

            x -= 128
            y -= 128
            if (x <= -128) {
                x = -128
            }
            if (x > 128) {
                x = 128
            }
            if (y <= -128) {
                y = -128
            }
            if (y > 128) {
                y = 128
            }

            let saturation = Math.hypot(x, y)
            if (saturation > 128.0) {
                saturation = 128.0
            }
            const hue = (Math.atan2(y, x) + Math.PI) / (2 * Math.PI) * 360.0

            h.value = Math.round(hue)
            s.value = Math.round(saturation * 100 / 128)
        }
        hsCaret.onpointerup = () => {
            skew = undefined
        }

        const oldColor = div()
        const newColor = div()
        oldColor.id = "oc"
        newColor.id = "nc"

        const labelH = div(text("H"))
        const labelS = div(text("S"))
        const labelV = div(text("V"))
        const labelR = div(text("R"))
        const labelG = div(text("G"))
        const labelB = div(text("B"))
        labelH.id = "lh"
        labelS.id = "ls"
        labelV.id = "lv"
        labelR.id = "lr"
        labelG.id = "lg"
        labelB.id = "lb"

        const textH = new Text({ model: h, id: "th" })
        const textS = new Text({ model: s, id: "ts" })
        const textV = new Text({ model: v, id: "tv" })
        const textR = new Text({ model: r, id: "tr" })
        const textG = new Text({ model: g, id: "tg" })
        const textB = new Text({ model: b, id: "tb" })

        const sliderV = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#fff", id: "sv", model: v })
        const sliderR = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#f00", id: "sr", model: r })
        const sliderG = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#0f0", id: "sg", model: g })
        const sliderB = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#00f", id: "sb", model: b })

        const root = div()
        root.id = "root"
        this.shadowRoot!.adoptedStyleSheets = [style]
        root.replaceChildren(
            canvas,
            sliderV,
            sliderR, sliderG, sliderB,
            labelH, labelS, labelV, labelR, labelG, labelB,
            textH, textS, textV, textR, textG, textB,
            oldColor, newColor,
            hsCaret
        )
        this.shadowRoot!.appendChild(root)
    }
}
ColorSelector.define("tx-color", ColorSelector)
