import { HTMLElementProps } from "toad.jsx"
import { ValueModel } from "../model/ValueModel"
import { ModelView, ModelViewProps } from "./ModelView"
import { BooleanModel } from "../model/BooleanModel"

interface IfPropsTrue extends HTMLElementProps {
    isTrue: BooleanModel
}
interface IfPropsFalse extends HTMLElementProps {
    isFalse: BooleanModel
}
interface IfPropsEqual<T> extends HTMLElementProps {
    model: ValueModel<T>
    isEqual: T
}

/**
 * @category View
 *
 * Conditionally views it's children by switching the display style between "" and "none"
 *
 * To keep the view layer free of application behaviour, more complex conditions
 * need to be handled with a Condition model.
 *
 * @example
 *     <If model={myModel} isEqual={"myValue"}>...</If>
 *     <If isTrue={myBoolModel}>...</If>
 *     <If isFalse={myBoolModel}>...</If>
 *
 * @example
 *     // application layer
 *     const myCondition = new Condition(() => {
 *         if myModelA.value < 50 {
 *             return true
 *         }
 *         return myModelB.value < 100
 *     }, [
 *         myModelA, myModelB // models to observe
 *     ])
 *     // view layer
 *     <If isTrue={myCondition}>...</If>
 */
export class If<T> extends ModelView<ValueModel<T>> {
    value: T
    constructor(props: IfPropsTrue | IfPropsFalse | IfPropsEqual<T>) {
        const newProps = props as ModelViewProps<BooleanModel>
        let value: any
        if ("isTrue" in props) {
            value = true
            newProps.model = props.isTrue
        }
        if ("isFalse" in props) {
            value = false
            newProps.model = props.isFalse
        }
        if ("isEqual" in props) {
            value = props.isEqual
        }
        super(props)
        this.value = value
    }

    override updateView() {
        if (this.model) {
            this.show(this.model.value === this.value)
        }
    }
    private show(show: boolean) {
        this.style.display = show ? "" : "none"
    }
}
If.define("tx-enhanced-if", If)