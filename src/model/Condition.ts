import { BooleanModel } from "./BooleanModel"
import { Model } from "./Model"

/**
 * @category Application Model
 *
 * This is an application layer support class for the &lt;If&gt; view.
 *
 * As a subclass of BooleanModel, it sets itself by evaluating the
 * provided _condition_ whenever on of the provided _dependencies_ changes.
 *
 *
 * @see If
 */
export class Condition extends BooleanModel {
    condition: () => boolean
    constructor(condition: () => boolean, dependencies: Model<any, any>[]) {
        super(condition())
        this.condition = condition
        this.evaluate = this.evaluate.bind(this)
        for (const model of dependencies) {
            model.modified.add(this.evaluate)
        }
    }
    evaluate() {
        this.value = this.condition()
    }
}
