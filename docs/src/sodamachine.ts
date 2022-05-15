
import { NumberModel } from "@toad/model/NumberModel"
import { EnumModel } from "@toad/model/EnumModel"
import { bindModel as bind, action } from "@toad/controller/globalController"

export function initializeSodaMachine() {

    const defaultSize = 330
    enum Flavour {
        CLASSIC, CHERRY, VANILLA
    }

    const soda = document.getElementById("soda")!
    soda.onanimationend = () => {
        soda.classList.remove("animated")
    }

    const flavour = new EnumModel<Flavour>(Flavour)
    flavour.value = Flavour.CLASSIC
    bind("flavour", flavour)

    const quantity = new NumberModel(defaultSize, { min: 0, max: 1500 })
    bind("quantity", quantity)

    action("fill", () => {
        const height = quantity.value / quantity.max!
        document.documentElement.style.setProperty("--soda-height", `${height}`)
        switch (flavour.value) {
            case Flavour.CLASSIC:
                document.documentElement.style.setProperty("--soda-color", "#420")
                break
            case Flavour.CHERRY:
                document.documentElement.style.setProperty("--soda-color", "#d44")
                break
            case Flavour.VANILLA:
                document.documentElement.style.setProperty("--soda-color", "#d80")
                break
        }
        soda.classList.add("animated")
    })

}
