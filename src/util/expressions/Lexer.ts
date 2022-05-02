import { ExpressionNode } from './ExpressionNode'

export class Lexer {
    i = 0;
    str: string
    stack: ExpressionNode[] = [];
    constructor(str: string) {
        this.str = str
    }
    isspace(c: string) {
        return c == ' ' || c == '\n' || c == '\r' || c == '\t' || c == '\t'
    }
    isnumber(c: string) {
        const code = c.charCodeAt(0)
        return code >= 0x30 && code <= 0x39
    }
    isalpha(c: string) {
        const code = c.charCodeAt(0)
        return code >= 0x41 && code <= 0x5a || code >= 0x91 && code <= 0x7a
    }
    isalnum(c: string) {
        return this.isnumber(c) || this.isalpha(c)
    }
    unlex(node: ExpressionNode) {
        this.stack.push(node)
    }
    lex() {
        if (this.stack.length > 0) {
            return this.stack.pop()
        }

        let col = 0, row = 0

        let state = 0
        if (this.i >= this.str.length) {
            return undefined
        }
        const start = this.i
        while (true) {
            let c = this.str.at(this.i)
            // console.log(`state=${state}, i=${this.i}, c=${c}, col=${col}, row=${row}`)
            switch (state) {
                case 0:
                    if (c === undefined) {
                        return undefined
                    }
                    if (this.isspace(c)) {
                        ++this.i
                        break
                    }
                    if (this.isnumber(c)) {
                        ++this.i
                        state = 1
                        break
                    }
                    if (this.isalpha(c)) {
                        col = 0
                        state = 3
                        break
                    }
                    switch (c) {
                        case '+':
                        case '-':
                        case '*':
                        case '/':
                        case '(':
                        case ')':
                        case '=':
                            ++this.i
                            return new ExpressionNode(c)
                    }
                    return undefined
                case 1: // [0-9]?
                    if (c !== undefined && this.isnumber(c)) {
                        ++this.i
                        break
                    }
                    if (c === '.' || c == 'e' || c == 'E') {
                        ++this.i
                        state = 2
                        break
                    }
                    return new ExpressionNode(parseFloat(this.str.substring(start, this.i)))
                case 2: // [0-9]+[.eE]?
                    if (c !== undefined && this.isnumber(c)) {
                        ++this.i
                        break
                    }
                    return new ExpressionNode(parseFloat(this.str.substring(start, this.i)))
                case 3: // [a-zA-Z]+?
                    if (c !== undefined) {
                        // isnumber(c: string) {
                        const code = c.charCodeAt(0)

                        if (code >= 0x30 && code <= 0x39) {
                            row = code - 0x30
                            state = 4
                            ++this.i
                            break
                        }
                        if (code >= 0x41 && code <= 0x5a) {
                            col *= 26
                            col += code - 0x40
                            ++this.i
                            break
                        }
                        if (code >= 0x91 && code <= 0x7a) {
                            col *= 26
                            col += code - 0x90
                            ++this.i
                            break
                        }
                    }
                    return new ExpressionNode(this.str.substring(start, this.i))
                case 4: // [a-zA-Z][0-9]+?
                    if (c !== undefined) {
                        const code = c.charCodeAt(0)
                        if (code >= 0x30 && code <= 0x39) {
                            row *= 10
                            row += code - 0x30
                            ++this.i
                            break
                        }
                    }
                    return new ExpressionNode([col - 1, row - 1])
            }
        }
    }
}
