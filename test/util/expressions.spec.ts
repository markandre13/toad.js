import { expect } from 'chai'
import { Lexer } from 'src/util/expressions/Lexer'
import { assignmentExpression } from 'src/util/expressions/expression'

describe("expressions", function () {
    describe("lexer", function () {
        describe("single token", function () {
            it("1", function () {
                const lexer = new Lexer("1")
                expect(lexer.lex()?.value).to.equal(1)
            })
            it("1.9", function () {
                const lexer = new Lexer("1.9")
                expect(lexer.lex()?.value).to.equal(1.9)
            })
            it("1e9", function () {
                const lexer = new Lexer("1e9")
                expect(lexer.lex()?.value).to.equal(1e9)
            })
            it("1E9", function () {
                const lexer = new Lexer("1E9")
                expect(lexer.lex()?.value).to.equal(1e9)
            })
            it("+", function () {
                const lexer = new Lexer("+")
                expect(lexer.lex()?.value).to.equal('+')
            })
            it("-", function () {
                const lexer = new Lexer("-")
                expect(lexer.lex()?.value).to.equal('-')
            })
            it("*", function () {
                const lexer = new Lexer("*")
                expect(lexer.lex()?.value).to.equal('*')
            })
            it("/", function () {
                const lexer = new Lexer("/")
                expect(lexer.lex()?.value).to.equal('/')
            })
            it("(", function () {
                const lexer = new Lexer("(")
                expect(lexer.lex()?.value).to.equal('(')
            })
            it(")", function () {
                const lexer = new Lexer(")")
                expect(lexer.lex()?.value).to.equal(')')
            })
            it("A1", function () {
                const lexer = new Lexer("A1")
                expect(lexer.lex()?.value).to.deep.equal([0, 0])
            })
            it("Z9", function () {
                const lexer = new Lexer("Z9")
                expect(lexer.lex()?.value).to.deep.equal([25, 8])
            })
            it("AA10", function () {
                const lexer = new Lexer("AA10")
                expect(lexer.lex()?.value).to.deep.equal([26, 9])
            })
            it("AB13", function () {
                const lexer = new Lexer("AB11")
                expect(lexer.lex()?.value).to.deep.equal([27, 10])
            })
            xit("SUM(<cell>, ...)", function () {
                const lexer = new Lexer(")")
                expect(lexer.lex()?.value).to.equal(')')
            })
            it("? is illegal", function () {
                const lexer = new Lexer("?")
                expect(lexer.lex()).to.be.undefined
            })
        })
        describe("multiple tokens", function () {
            it("1+2", function () {
                const lexer = new Lexer("1+2")
                expect(lexer.lex()?.value).to.equal(1)
                expect(lexer.lex()?.value).to.equal('+')
                expect(lexer.lex()?.value).to.equal(2)
                expect(lexer.lex()).to.be.undefined
            })
            it(" 1 + 2 ", function () {
                const lexer = new Lexer(" 1 + 2 ")
                expect(lexer.lex()?.value).to.equal(1)
                expect(lexer.lex()?.value).to.equal('+')
                expect(lexer.lex()?.value).to.equal(2)
                expect(lexer.lex()).to.be.undefined
            })
        })
    })
    describe("parser", function () {
        it("1", function () {
            const tree = assignmentExpression("=1")
            expect(tree?.value).to.equal(1)
        })
        it("1+2", function () {
            const tree = assignmentExpression("=1+2")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal(2)
        })
        it("1*2", function () {
            const tree = assignmentExpression("=1*2")
            expect(tree?.value).to.equal('*')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal(2)
        })
        it("1+2*3", function () {
            const tree = assignmentExpression("=1+2*3")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal('*')
            expect(tree?.down?.next?.down?.value).to.equal(2)
            expect(tree?.down?.next?.down?.next?.value).to.equal(3)
        })
        it("1*2+3", function () {
            const tree = assignmentExpression("=1*2+3")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal('*')
            expect(tree?.down?.down?.value).to.equal(1)
            expect(tree?.down?.down?.next?.value).to.equal(2)
            expect(tree?.down?.next?.value).to.equal(3)
        })
        it("(1)", function () {
            const tree = assignmentExpression("=(1)")
            expect(tree?.value).to.equal(1)
        })
        it("(1+2)", function () {
            const tree = assignmentExpression("=(1+2)")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal(2)
        })
        it("((1+2))", function () {
            const tree = assignmentExpression("=((1+2))")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal(2)
        })
        it("(1+2)*3", function () {
            const tree = assignmentExpression("=(1+2)*3")
            expect(tree?.value).to.equal('*')
            expect(tree?.down?.value).to.equal('+')
            expect(tree?.down?.down?.value).to.equal(1)
            expect(tree?.down?.down?.next?.value).to.equal(2)
            expect(tree?.down?.next?.value).to.equal(3)
        })
        it("-1", function () {
            const tree = assignmentExpression("=-1")
            expect(tree?.value).to.equal('-')
            expect(tree?.down?.value).to.equal(1)
        })
        it("-1", function () {
            const tree = assignmentExpression("=1+-2")
            expect(tree?.value).to.equal('+')
            expect(tree?.down?.value).to.equal(1)
            expect(tree?.down?.next?.value).to.equal('-')
            expect(tree?.down?.next?.down?.value).to.equal(2)
        })
    })
    describe("eval", function () {
        it("1+2", function () {
            expect(assignmentExpression("=1+2")?.eval()).to.equal(3)
        })
        it("3-2", function () {
            expect(assignmentExpression("=3-2")?.eval()).to.equal(1)
        })
        it("2*3", function () {
            expect(assignmentExpression("=2*3")?.eval()).to.equal(6)
        })
        it("6/2", function () {
            expect(assignmentExpression("=6/2")?.eval()).to.equal(3)
        })
        it("-1", function () {
            expect(assignmentExpression("=-1")!.eval()).to.equal(-1)
        })
        it("1+-4", function () {
            expect(assignmentExpression("=1+-4")!.eval()).to.equal(-3)
        })
        it("6*2+14/7-3", function () {
            expect(assignmentExpression("=6*2+14/7-3")?.eval()).to.equal(11)
        })
    })
    describe("dependencies", function () {
        it("A2 + 2 * C4", function () {
            const t = assignmentExpression("=A2+2*C4")
            expect(t?.dependencies()).to.deep.equal([[0, 1], [2, 3]])
        })
    })
})