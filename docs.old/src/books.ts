
import { ArrayModel } from "@toad/table/model/ArrayModel"
import { TableAdapter } from "@toad/table/adapter/TableAdapter"
import { ArrayAdapter } from "@toad/table/adapter/ArrayAdapter"

import { bindModel as bind } from "@toad/controller/globalController"
import { refs } from "toad.jsx/lib/jsx-runtime"

class Book {
    title: string = ""
    author: string = ""
    year: number = 1970
}

const bookList = [
    { title: "The Moon Is A Harsh Mistress", author: "Robert A. Heinlein", year: 1966 },
    { title: "Stranger In A Strange Land", author: "Robert A. Heinlein", year: 1961 },
    { title: "The Fountains of Paradise", author: "Arthur C. Clarke", year: 1979 },
    { title: "Rendezvous with Rama", author: "Arthur C. Clarke", year: 1973 },
    { title: "2001: A Space Odyssey", author: "Arthur C. Clarke", year: 1968 },
    { title: "Do Androids Dream of Electric Sheep?", author: "Philip K. Dick", year: 1968 },
    { title: "A Scanner Darkly", author: "Philip K. Dick", year: 1977 },
    { title: "Second Variety", author: "Philip K. Dick", year: 1953 },
]

class BookAdapter extends ArrayAdapter<ArrayModel<Book>> {
    override getColumnHeads() { return ["Title", "Author", "Year"] }
    override getRow(book: Book) { return refs(book, "title", "author", "year") }
}

export function initializeBooks() {
    TableAdapter.register(BookAdapter, ArrayModel, Book)
    const model = new ArrayModel<Book>(bookList, Book)
    bind("books", model)
}
