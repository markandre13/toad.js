import { expect } from 'chai'
import { ref } from '@toad'

class Book {
    title: string
    author: string
    year: number
    constructor(title: string, author: string, year: number) {
        this.title = title
        this.author = author
        this.year = year
    }
}

describe("jsx", function() {
    describe("reference", function() {
        it("get()/set() can get/set the referenced value if it's of type string or number", function() {
            const book = new Book("The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966)
            const title = ref(book, "title")
            const year = ref(book, "year")

            expect(title.get()).equals("The Moon Is A Harsh Mistress")
            title.set("Stranger In A Strange Land")
            expect(title.get()).equals("Stranger In A Strange Land")
            expect(book.title).equals("Stranger In A Strange Land")

            expect(year.get()).equals(1966)
            year.set(1961)
            expect(year.get()).equals(1961)
            expect(book.year).equals(1961)
        })
        it("toString()/fromString() can get/set the referenced value as a string if it's of type string or number", function() {
            const book = new Book("The Moon Is A Harsh Mistress", "Robert A. Heinlein", 1966)
            const title = ref(book, "title")
            const year = ref(book, "year")

            expect(title.toString()).equals("The Moon Is A Harsh Mistress")
            title.fromString("Stranger In A Strange Land")
            expect(title.get()).equals("Stranger In A Strange Land")
            expect(book.title).equals("Stranger In A Strange Land")

            expect(year.toString()).equals("1966")
            year.fromString("1961")
            expect(year.get()).equals(1961)
            expect(book.year).equals(1961)
        })
    })
})