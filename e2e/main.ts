
import { main as fooMain } from "./foo.code"

console.log("LOADAED")

window.onload = () => {
    main()
}

export function main(): void {
    console.log("MAIN")
    fooMain()
}
