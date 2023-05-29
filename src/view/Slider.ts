/*
 *  The TOAD JavaScript/TypeScript GUI Library
 *  Copyright (C) 2018-2021 Mark-André Hopf <mhopf@mark13.org>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NumberModel } from "../model/NumberModel"
import { ModelView, ModelViewProps } from "./ModelView"
import { style as txSlider } from "../style/tx-slider"
import { input, span } from "@toad/util/lsx"
import { parseColor, RGBA } from "@toad/util/color"

/**
 * @category View
 */

interface SliderProps extends ModelViewProps<NumberModel> {
    orientation?: "horizontal" | "vertical"
    minColor?: string
    maxColor?: string
}

export class Slider extends ModelView<NumberModel> {
    input: HTMLInputElement
    thumb: HTMLSpanElement
    track: HTMLSpanElement
    vertical: boolean
    minColor?: RGBA
    maxColor?: RGBA

    constructor(init?: SliderProps) {
        super(init)

        this.vertical = init ? init.orientation === "vertical" : this.getAttribute("orientation") === "vertical"

        let container, rail: HTMLSpanElement, track: HTMLSpanElement, thumb: HTMLSpanElement, slider: HTMLInputElement
        container = [
            rail = span(),
            track = span(),
            thumb = span(
                slider = input()
            )
        ]
        rail.classList.add('tx-rail')
        track.classList.add('tx-track')
        thumb.classList.add('tx-thumb')
        slider.type = "range"
        this.input = slider
        this.track = track
        this.thumb = thumb

        const minColor = init ? init.minColor : this.getAttribute("minColor")
        const maxColor = init ? init.maxColor : this.getAttribute("maxColor")
        if (minColor && maxColor) {
            if (this.vertical) {
                rail.style.backgroundImage = `linear-gradient(0deg, ${minColor}, ${maxColor})`
            } else {
                rail.style.backgroundImage = `linear-gradient(90deg, ${minColor}, ${maxColor})`
            }
            track.style.display = "none"
            this.minColor = parseColor(minColor)
            this.maxColor = parseColor(maxColor)
        }

        this.updateView()

        slider.onfocus = () => {
            thumb.classList.add("tx-focus")
        }
        slider.onblur = () => {
            thumb.classList.remove("tx-focus")
        }
        slider.oninput = () => {
            if (this.model) {
                this.model.value = parseFloat(slider.value)
            }
            // this.updateView()
        }
        let skew: number | undefined = undefined
        thumb.onpointerdown = (ev: PointerEvent) => {
            thumb.setPointerCapture(ev.pointerId)
            const value = parseFloat(slider.value)
            const b = this.getBoundingClientRect()
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)
            if (this.vertical) {
                const v = max - (ev.clientY - b.y) / b.height * (max - min)
                skew = value - v
            } else {
                const v = (ev.clientX - b.x) / b.width * (max - min) + min
                skew = value - v
            }
        }
        thumb.onpointermove = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            ev.preventDefault()

            const b = this.getBoundingClientRect()
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)

            let v
            if (this.vertical) {
                v = max - (ev.clientY - b.y) / b.height * (max - min)
            } else {
                v = (ev.clientX - b.x) / b.width * (max - min) + min + skew
            }
            if (v < min) {
                v = min
            }
            if (v > max) {
                v = max
            }
            if (this.model) {
                this.model!.value = v
            }
        }
        thumb.onpointerup = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            thumb.onpointermove!(ev)
            skew = undefined
        }
        this.attachShadow({ mode: 'open', delegatesFocus: true })
        this.shadowRoot!.adoptedStyleSheets = [txSlider]
        this.shadowRoot!.replaceChildren(...container)
    }

    override updateModel() {
        if (this.model) {
            this.model.value = Number.parseFloat(this.input.value)
        }
    }

    override updateView() {
        if (!this.model)
            return
        if (this.model.step === undefined && this.model.min !== undefined && this.model.max !== undefined) {
            this.input.step = `${(this.model.max - this.model.min) / 100}`
        } else {
            this.input.step = String(this.model.step)
        }
        this.input.min = String(this.model.min)
        this.input.max = String(this.model.max)
        this.input.value = String(this.model.value)

        const min = this.model.min!
        const max = this.model.max!
        const value = this.model.value
        let v = (value - min) / (max - min)
        if (this.minColor && this.maxColor) {
            const f = `rgb(${(this.maxColor.r - this.minColor.r) * v + this.minColor.r},${(this.maxColor.g - this.minColor.g) * v + this.minColor.g},${(this.maxColor.b - this.minColor.b) * v + this.minColor.b})`
            this.thumb.style.backgroundColor = f
        }
        v *= 100

        if (this.vertical) {
            this.track.style.top = `${100 - v}%`
            this.track.style.height = `${v}%`
            this.thumb.style.top = `${100 - v}%`
        } else {
            this.track.style.left = `0%`
            this.track.style.width = `${v}%`
            this.thumb.style.left = `${v}%`
        }
    }
}
Slider.define("tx-slider", Slider)