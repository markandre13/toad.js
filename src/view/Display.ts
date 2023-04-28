import { TextModel } from "../model/TextModel"
import { HtmlModel } from "../model/HtmlModel"
import { NumberModel } from "../model/NumberModel"
import { ModelView, ModelViewProps } from "../view/ModelView"

/**
 * @category View
 */
export class Display extends ModelView<TextModel|HtmlModel|NumberModel> {

  constructor(init?: ModelViewProps<TextModel|HtmlModel|NumberModel>) {
    super(init)
  }

  override updateView() {
    if (this.model === undefined) {
        this.innerText = ""
        return
    }
    if (this.model instanceof TextModel) {
        this.innerText = this.model.value
        return
    }
    if (this.model instanceof HtmlModel) {
        this.innerHTML = this.model.value
        return
    }
    if (this.model instanceof NumberModel) {
        this.innerText = `${this.model.value}`
        return
    }
  }  
}

Display.define("tx-display", Display)
