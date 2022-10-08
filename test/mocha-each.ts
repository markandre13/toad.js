// replacement for mocha-each, which isn't esm compatible

import { AsyncFunc, Context, Done, Func, TestFunction } from 'mocha'

export function forEach(param: ReadonlyArray<any>) {
    return {
        it: function (title: string, body?: Function) {
            param.forEach((parameters) => {
                let parsedTitle = title
                parameters.forEach((v: any) => {
                    parsedTitle = parsedTitle.replace("{}", `${v}`)
                })
                if (body === undefined) {
                    window.it(parsedTitle)
                } else {
                    if (body.constructor.name === "AsyncFunction") {
                        window.it(parsedTitle, function (this: Context, done: Done) {
                            ((body.apply(this, parameters) as unknown) as Promise<void>)
                                .then(() => done())
                                .catch((e: any) => { done(e) })
                        })
                    } else {
                        window.it(parsedTitle, function (this: Context, done: Done) {
                            body.apply(this, parameters)
                            done()
                        })
                    }
                }
            })
        }
    }
}
