import { FixedNumberModel } from "@toad/model/FixedNumberModel"
import { div, span, text } from "@toad/util/lsx"
import { hsv2rgb, rgb2hsv } from "@toad/util/color"
import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { Slider } from "./Slider"
import { Text } from "./Text"
import { style } from "@toad/style/tx-colorselector"
import { RGBModel } from "@toad/model/RGBModel"
import { ModelView } from "./ModelView"

// i know, this implementation is a mess. i just wanted to get it done.

export class ColorSelector extends ModelView<RGBModel> {
    h = new FixedNumberModel(0, { min: 0, max: 360, step: 1 })
    s = new FixedNumberModel(0, { min: 0, max: 100, step: 1 })
    v = new FixedNumberModel(0, { min: 0, max: 100, step: 1 })

    r = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })
    g = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })
    b = new FixedNumberModel(0, { min: 0, max: 255, step: 1 })

    block = false
    hsCaret = span()
    oldColor = div()
    newColor = div()

    constructor(init?: HTMLElementProps) {
        super(init)
        this.rgbChanged = this.rgbChanged.bind(this)
        this.hsvChanged = this.hsvChanged.bind(this)

        this.attachShadow({ mode: 'open' })
        const canvas = document.createElement("canvas")
        canvas.id = "canvas"
        canvas.width = 256
        canvas.height = 256

        this.drawHueSaturation(canvas)

        this.hsCaret.id = "hsv"

        this.s.modified.add(this.hsvChanged)
        this.h.modified.add(this.hsvChanged)
        this.v.modified.add(this.hsvChanged)
        this.r.modified.add(this.rgbChanged)
        this.g.modified.add(this.rgbChanged)
        this.b.modified.add(this.rgbChanged)

        let skew: number | undefined
        this.hsCaret.onpointerdown = (ev: PointerEvent) => {
            skew = 1
            this.hsCaret.setPointerCapture(ev.pointerId)
            ev.preventDefault()
        }
        this.hsCaret.onpointermove = (ev: PointerEvent) => {
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

            this.h.value = hue
            this.s.value = saturation * 100 / 128
        }
        this.hsCaret.onpointerup = () => {
            skew = undefined
        }

        this.oldColor.id = "oc"
        this.newColor.id = "nc"

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

        const textH = new Text({ model: this.h, id: "th" })
        const textS = new Text({ model: this.s, id: "ts" })
        const textV = new Text({ model: this.v, id: "tv" })
        const textR = new Text({ model: this.r, id: "tr" })
        const textG = new Text({ model: this.g, id: "tg" })
        const textB = new Text({ model: this.b, id: "tb" })

        const sliderV = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#fff", id: "sv", model: this.v })
        const sliderR = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#f00", id: "sr", model: this.r })
        const sliderG = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#0f0", id: "sg", model: this.g })
        const sliderB = new Slider({ orientation: "vertical", minColor: "#000", maxColor: "#00f", id: "sb", model: this.b })

        const root = div()
        root.id = "root"
        this.shadowRoot!.adoptedStyleSheets = [style]
        root.replaceChildren(
            canvas,
            sliderV,
            sliderR, sliderG, sliderB,
            labelH, labelS, labelV, labelR, labelG, labelB,
            textH, textS, textV, textR, textG, textB,
            this.oldColor, this.newColor,
            this.hsCaret
        )
        this.shadowRoot!.appendChild(root)
    }

    override updateModel() {
        if (!this.model) {
            return
        }
        const rgb = {r: this.r.value, g: this.g.value, b: this.b.value}
        this.model.value = rgb
    }

    override updateView() {
        if (!this.model) {
            return
        }
        this.block = true
        const rgb = this.model.value
        if (this.oldColor.style.backgroundColor === "") {
            this.oldColor.style.backgroundColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`
        }

        this.r.value = rgb.r
        this.g.value = rgb.g
        this.b.value = rgb.b
        this.block = false
        this.rgbChanged()
    }

    hsvChanged() {
        if (this.block) {
            return
        }
        const rgb = hsv2rgb(this.h.value, this.s.value / 100, this.v.value / 100)
        this.block = true
        this.r.value = rgb.r * 255
        this.g.value = rgb.g * 255
        this.b.value = rgb.b * 255
        this.placeHSV()
        this.updateModel()
        this.block = false
    }
    rgbChanged() {
        if (this.block) {
            return
        }
        const hsv = rgb2hsv(this.r.value / 255, this.g.value / 255, this.b.value / 255)
        this.block = true
        this.h.value = hsv.h
        this.s.value = hsv.s * 100
        this.v.value = hsv.v * 100
        this.placeHSV()
        this.updateModel()
        this.block = false
    }
    placeHSV() {
        const hue = this.h.value / 360.0 * 2 * Math.PI - Math.PI
        const saturation = this.s.value / 100.0 * 128.0
        let x = Math.round(saturation * Math.cos(hue)) + 8 + 128
        let y = Math.round(saturation * Math.sin(hue)) + 8 + 128
        this.hsCaret.style.left = `${x}px`
        this.hsCaret.style.top = `${y}px`

        const color = hsv2rgb(this.h.value, this.s.value / 100, 1)
        this.hsCaret.style.backgroundColor = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`

        this.newColor.style.backgroundColor = `rgb(${this.r.value}, ${this.g.value}, ${this.b.value})`
    }
    drawHueSaturation(canvas: HTMLCanvasElement) {
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
    }
}
ColorSelector.define("tx-color", ColorSelector)
