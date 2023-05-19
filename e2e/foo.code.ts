import { Button } from "@toad/view/Button"
Button

import { bindModel, action } from "@toad/controller/globalController"

export function main() {
    console.log("FOO::MAIN()")
    action("button-enabled", () => {
        console.log("HELLO")
    })
    const b = action("button-disabled", () => {
        console.log("HELLO")
    })
    b.enabled = false
}
