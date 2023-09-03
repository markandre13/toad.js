import { TableAdapter } from "./TableAdapter"
import { TablePos } from "../TablePos"
import { StringArrayModel } from "../model/StringArrayModel"
import { text } from "@toad/util/lsx"

export class StringArrayAdapter extends TableAdapter<StringArrayModel> {
    override showCell(pos: TablePos, cell: HTMLSpanElement): void {
        cell.replaceChildren(text(this.model!.get(pos.row)))
    }
}
