type GConstructor<T = {}> = new (...args: any[]) => T;

export class FormField {
    _label?: string
    _description?: string
    _error?: string

    set label(label: string | undefined) { this._label = label }
    get label(): string | undefined { return this._label }

    set description(description: string | undefined) { this._description = description }
    get description(): string | undefined { return this._description }

    set error(error: string | undefined) { this._error = error }
    get error(): string | undefined { return this._error }
}

export function applyMixins(derivedCtor: any, constructors: any[]) {
    constructors.forEach((baseCtor) => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
            Object.defineProperty(
                derivedCtor.prototype,
                name,
                Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                Object.create(null)
            )
        })
    })
}

export function FieldMixin<TBase extends GConstructor>(Base: TBase) {
    return class Field extends Base {
        // Mixins may not declare private/protected properties
        // however, we can use ES2022 private fields
        #label?: string
        #description?: string
        #error?: string

        set label(label: string | undefined) { this.#label = label }
        get label(): string | undefined { return this.#label }

        set description(description: string | undefined) { this.#description = description }
        get description(): string | undefined { return this.#description }

        set error(error: string | undefined) { this.#error = error }
        get error(): string | undefined { return this.#error }
    }
}