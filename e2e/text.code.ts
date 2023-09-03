import { action } from "@toad/controller/globalController"

export function main() {
    action("button-enabled", () => {
        console.log("HELLO")
    })
    const b = action("button-disabled", () => {
        console.log("HELLO")
    })
    b.enabled = false
}
