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

import { NumberModel, NumberModelEvent } from "../model/NumberModel"
import { style as txSlider } from "../style/tx-slider"
import { div, input, span } from "../util/lsx"
import { parseColor, RGBA } from "../util/color"
import { HTMLElementProps } from "toad.jsx/lib/jsx-runtime"
import { View } from "./View"
import { ALL, Model } from "../model/Model"

/**
 * @category View
 */

interface SliderProps extends HTMLElementProps {
    model?: NumberModel | NumberModel[]
    orientation?: "horizontal" | "vertical"
    minColor?: string
    maxColor?: string
}

interface Knob {
    model: NumberModel
    slider: HTMLInputElement
    thumb: HTMLSpanElement
}

export class Slider extends View {
    private knob: Knob[] = []
    private container: HTMLDivElement
    private rail: HTMLSpanElement
    private track: HTMLSpanElement
    private vertical: boolean
    private minColor?: RGBA
    private maxColor?: RGBA

    constructor(init?: SliderProps) {
        super(init)

        // this.knob.push({} as any)

        this.vertical = init ? init.orientation === "vertical" : this.getAttribute("orientation") === "vertical"

        let container, rail: HTMLSpanElement, track: HTMLSpanElement
        this.container = container = div((rail = span()), (track = span()))
        container.classList.add("tx-space")
        rail.classList.add("tx-rail")
        track.classList.add("tx-track")

        if (init?.model !== undefined) {
            if (init.model instanceof NumberModel) {
                this.addModel(init.model)
            } else {
                for (const m of init.model) {
                    this.addModel(m)
                }
            }
        }

        // this will create a 2nd slider!!!
        // const n = new NumberModel(0, {min: 0, max: 100, step: 1})
        // this.addModel(n)

        this.rail = rail
        this.track = track

        const minColor = init ? init.minColor : this.getAttribute("minColor")
        const maxColor = init ? init.maxColor : this.getAttribute("maxColor")
        if (minColor) {
            this.minColor = parseColor(minColor)
        }
        if (maxColor) {
            this.maxColor = parseColor(maxColor)
        }

        // this.setGradient()

        this.updateView({ type: ALL })

        this.attachShadow({ mode: "open", delegatesFocus: true })
        this.shadowRoot!.adoptedStyleSheets = [txSlider]
        this.shadowRoot!.replaceChildren(container)
    }

    override setModel(model?: Model<any>): void {
        // console.trace(`Please note that View.setModel(model) has no implementation.`)
    }

    addModel(model: NumberModel): void {
        let thumb: HTMLSpanElement, slider: HTMLInputElement

        thumb = span((slider = input()))

        thumb.classList.add("tx-thumb")
        slider.type = "range"

        this.container.appendChild(thumb)

        this.knob.push({ model, thumb, slider })

        const view = this

        model.signal.add((event) => view.updateView(event), view)

        if (this.isConnected) {
            this.updateView({ type: ALL })
        }

        slider.onfocus = () => {
            thumb.classList.add("tx-focus")
        }
        slider.onblur = () => {
            thumb.classList.remove("tx-focus")
        }
        slider.oninput = () => {
            if (model) {
                model.value = parseFloat(slider.value)
            }
            // this.updateView()
        }
        let skew: number | undefined = undefined
        thumb.onpointerdown = (ev: PointerEvent) => {
            if (model.enabled !== true) {
                return
            }
            thumb.setPointerCapture(ev.pointerId)
            const value = parseFloat(slider.value)
            const b = this.getBoundingClientRect()
            const min = parseFloat(slider.min)
            const max = parseFloat(slider.max)
            if (this.vertical) {
                const v = max - ((ev.clientY - b.y) / b.height) * (max - min)
                skew = value - v
            } else {
                const v = ((ev.clientX - b.x) / b.width) * (max - min) + min
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
                v = max - ((ev.clientY - b.y) / b.height) * (max - min)
            } else {
                v = ((ev.clientX - b.x) / b.width) * (max - min) + min + skew
            }
            if (v < min) {
                v = min
            }
            if (v > max) {
                v = max
            }

            if (this.knob.length > 1) {
                const first = this.knob[0]
                const last = this.knob[1]
                if (model === first.model) {
                    if (v > last.model.value) {
                        v = last.model.value
                    }
                }
                if (model == last.model) {
                    if (v < first.model.value) {
                        v = first.model.value
                    }
                }
            }


            if (model) {
                model.value = v
            }
        }
        thumb.onpointerup = (ev: PointerEvent) => {
            if (skew === undefined) {
                return
            }
            thumb.onpointermove!(ev)
            skew = undefined
        }
    }

    override connectedCallback() {
        super.connectedCallback()
        if (this.knob.length > 0) {
            this.updateView({ type: ALL })
        }
    }

    protected setGradient() {
        if (this.minColor && this.maxColor) {
            if (this.knob[0].model.enabled === true) {
                const rot = this.vertical ? "0deg" : "90deg"
                const a = this.minColor
                const b = this.maxColor
                this.rail.style.backgroundImage = `linear-gradient(${rot}, rgb(${a.r},${a.g},${a.b}), rgb(${b.r},${b.g},${b.b}))`
            } else {
                this.rail.style.backgroundImage = ""
            }
            this.track.style.display = "none"
        }
    }

    updateModel() {
        for (const { model, slider, thumb } of this.knob) {
            if (model) {
                model.value = Number.parseFloat(slider.value)
            }
        }
    }

    updateView(event: NumberModelEvent): void {
        let index = -1
        const va: number[] = []
        for (const { model, slider, thumb } of this.knob) {
            ++index
            this.setGradient()

            if (!model) {
                this.setAttribute("disabled", "disabled")
                return
            }
            if (model.enabled) {
                this.removeAttribute("disabled")
            } else {
                this.setAttribute("disabled", "disabled")
            }
            if (model.step === undefined && model.min !== undefined && model.max !== undefined) {
                slider.step = `${(model.max - model.min) / 100}`
            } else {
                slider.step = String(model.step)
            }
            slider.min = String(model.min)
            slider.max = String(model.max)
            slider.value = String(model.value)

            const min = model.min!
            const max = model.max!
            const value = model.value
            let v = (value - min) / (max - min)

            // gradient
            if (this.minColor && this.maxColor) {
                if (model?.enabled !== true) {
                    thumb.style.backgroundColor = ""
                } else {
                    const f = `rgb(${(this.maxColor.r - this.minColor.r) * v + this.minColor.r},${
                        (this.maxColor.g - this.minColor.g) * v + this.minColor.g
                    },${(this.maxColor.b - this.minColor.b) * v + this.minColor.b})`
                    thumb.style.backgroundColor = f
                }
            }

            v *= 100
            va.push(v)
            if (this.vertical) {
                thumb.style.top = `${100 - v}%`
            } else {
                thumb.style.left = `${v}%`
            }
        }

        if (this.knob.length === 1) {
            const v = va[0]
            if (this.vertical) {
                this.track.style.top = `${100 - v}%`
                this.track.style.height = `${v}%`
            } else {
                this.track.style.left = `0%`
                this.track.style.width = `${v}%`
            }
        } else {
            const v0 = va[0]
            const v1 = va[va.length -1]

            if (this.vertical) {
                this.track.style.top = `${100 - v0}%`
                this.track.style.height = `${v1-v0}%`
            } else {
                this.track.style.left = `${v0}%`
                this.track.style.width = `${v1-v0}%`
            }
        }

    }
}
Slider.define("tx-slider", Slider)
