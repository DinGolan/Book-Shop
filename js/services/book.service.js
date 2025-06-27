/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Global Variables (Const) */
const STORAGE_KEY = 'bookDB';
const EMPTY_VALUE = '';

/* Global Variables (Generals) */
let gBooks    = [];
let gFilterBy = EMPTY_VALUE;

/* Function Calls (Main) */
_createBooks();

/* Function Implementations */
function getBooks() {
    if (!gFilterBy) return gBooks;

    return gBooks.filter(book => {
        return book.title.toLowerCase()
                         .includes(gFilterBy.toLowerCase());
    });
    if (!gFilterBy) return gBooks;

    return gBooks.filter(book => {
        return book.title.toLowerCase()
                         .includes(gFilterBy.toLowerCase());
    });
}

function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId);
    if (bookIdx !== -1) gBooks.splice(bookIdx, 1);
    _saveBooks();
}

function updateBookPrice(bookId, newPrice) {
    /* Option (1) */
    const book = getBookById(bookId);
    if (!book) return;
    
    book.price = newPrice;
    _saveBooks();

    /* Option (2) */
    /**
     * const bookIdx = gBooks.findIndex(book => book.id === bookId);
     * if (bookIdx === -1) return;
     * 
     * gBooks[bookIdx].price = newPrice;
     * _saveBooks();
     **/
}

function getBookById(bookId) {
    return gBooks.find(book => book.id === bookId);
}

function addBook(title, price) {
    const newBook = _createBook(title, price);
    gBooks.push(newBook);
    _saveBooks();
}

function generateRandomId() {
    const SIZE = 5;

    const digits       = '0123456789';
    const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
    const chars        = upperLetters + lowerLetters + digits;
    
    let newId   = '';
    let randIdx = null;
    for (let i = 0; i < SIZE; i++) {
        randIdx = Math.floor(Math.random() * chars.length);
        newId  += chars.charAt(randIdx);
    }

    return newId;
}

function generateImageUrl(title) {
    if (!title) return 'img/default.jpg' 

    const fileName = title.toLowerCase()
                          .split(' ')
                          .join('-');
    
    return `img/${fileName}.jpg`;
}

function setFilterBy(filterValue) {
    gFilterBy = filterValue;
}

function getBookTitle(bookId) {
    const book      = getBookById(bookId);
    const bookTitle = book ? book.title : 'Unknown';
    return bookTitle;
}

function clearMsgTimeout() {
    if (gMsgTimeoutId) {
        clearTimeout(gMsgTimeoutId);
        gMsgTimeoutId = null;
    }   
}

function _createBooks() {
    const books = loadFromStorage(STORAGE_KEY);

    if (!books || books.length === 0) {
        gBooks = _generateDefaultBooks();
        _saveBooks();
    } else {
        gBooks = books;
    }
}

function _createBook(title, price) {
    return {
        id: generateRandomId(),
        title,
        price,
        imgUrl: generateImageUrl(title)
    };
}

function _generateDefaultBooks() {
    return [
        _createBook('The Adventures of Lori Ipsi', 120),
        _createBook('World Atlas', 300),
        _createBook('Zorba the Greek', 87)
    ];
}

function _saveBooks() {
    saveToStorage(STORAGE_KEY, gBooks);
}