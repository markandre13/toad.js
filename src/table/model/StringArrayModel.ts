import { TableModel } from "./TableModel"

export class StringArrayModel extends TableModel {
    protected data: string[]
    constructor(data: string[]) {
        super()
        this.data = data
    }
    override get colCount() {
        return 1
    }
    override get rowCount() {
        return this.data.length
    }
    get(row: number) {
        return this.data[row]
    }
}
