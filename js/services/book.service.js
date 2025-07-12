/*************************************/
/* Exercise - Book Shop (Part 1 + 2) */
/*************************************/
'use strict';

/* Global Variables (Const) */
const STORAGE_KEY  = 'bookDB';
const EMPTY_STRING = '';
const IS_DEV_MODE  = false;
const PAGE_SIZE    = 5;

/* Global Variables (Generals) */
var gBooks        = [];
var gQueryOptions = {
    page: {
        idx: 0
    },

    filterBy: {
        title: EMPTY_STRING,
        rating: 0
    },

    sortBy: {
        field: EMPTY_STRING,
        direction: 1
    }
};
var gFilterBy = gQueryOptions.filterBy;
var gSortBy   = gQueryOptions.sortBy;

// --- //

/* Function Calls (Main) */
if (IS_DEV_MODE) {
    localStorage.removeItem(STORAGE_KEY);
}

_createBooks();

// --- //

/* Function Implementations */

// Book Data Utilities //
function getBooks() {
    /**
     * [Description] :
     * 
     * Purpose :
     * - Returns the list of books to display after applying filter, pagination, and sorting.
     * 
     * Process :
     * 1. Filters the full books array based on title and rating.
     * 2. Calculates the total number of pages based on PAGE_SIZE.
     *    - If the current page index is out of bounds (e.g. after deletion), it resets to 0.
     * 3. Slices the filtered books array to get only the books for the current page.
     * 4. If a sort field is selected, applies sorting to the current page's books.
     * 
     * Returns :
     * - An array of books ready to be rendered on the current page.
     **/
    let filteredBooks = filterBooks(gBooks);

    const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
    if (gQueryOptions.page.idx >= totalPages) {
        gQueryOptions.page.idx = 0;
    }

    const startIdx = gQueryOptions.page.idx * PAGE_SIZE;
    let books      = filteredBooks.slice(startIdx, startIdx + PAGE_SIZE);

    if (gSortBy.field) sortBooks(books);

    return books;
}

function getBookById(bookId) {
    return gBooks.find(book => book.id === bookId);
}

function getBookTitle(bookId) {
    const book      = getBookById(bookId);
    const bookTitle = book ? book.title : 'Unknown';
    return bookTitle;
}

// Remove Book //
function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId);
    if (bookIdx !== -1) gBooks.splice(bookIdx, 1);
    _saveBooks();
}

// Update Book //
function updateBook(bookId, newTitle, newPrice, newRating) {
    const book = getBookById(bookId);
    if (!book) return null;

    if (book.title === newTitle && book.price === newPrice) return book;

    book.title  = newTitle;
    book.price  = newPrice;
    book.rating = newRating;

    _saveBooks();
    return book;
}

// Read Book //
function updateBookRating(bookId, diff) {
    const book = getBookById(bookId);
    if (!book) return null;

    const newRating = book.rating + diff;
    if (newRating < 0 || newRating > 5) return book;

    book.rating = newRating;
    _saveBooks();

    return book;
}

// Add Book //
function addBook(title, price, rating = getRandomRating()) {
    const newBook = _createBook(title, price, rating);
    gBooks.push(newBook);
    _saveBooks();
}

// Filter Books //
function filterBooks(books) {
    return books.filter(book => {
        const matchTitles = book.title.toLowerCase().includes(gFilterBy.title.toLowerCase());

        /**
         * [Description] :
         * - If no rating is selected (e.g. : gFilterBy.rating === 0), we don't want to filter out any books, so always return true.
         **/
        const matchRating = (gFilterBy.rating > 0) ? book.rating == gFilterBy.rating : true;
        return matchTitles && matchRating;
    });
}

function setFilterBy(filterProperty, filterValue) {
    gFilterBy[filterProperty] = filterValue;
}

// Show Message //
function clearMsgTimeout() {
    if (gMsgTimeoutId) {
        clearTimeout(gMsgTimeoutId);
        gMsgTimeoutId = null;
    }   
}

// Validation Functions //
function isValidTitle(title) {
    return typeof title === 'string' && title.trim() !== EMPTY_STRING;
}

function isValidPrice(price) {
    return typeof price === 'number' && !isNaN(price) && price > 0;
}

// Sort Functions //
function sortBooks(books) {
    books.sort((book_1, book_2) => {
        if (gSortBy.field === 'title') {
            return book_1.title.localeCompare(book_2.title) * gSortBy.direction;
        } else {
            return (book_1[gSortBy.field] - book_2[gSortBy.field]) * gSortBy.direction;
        }
    });
}

function setSortByField(field) {
    gSortBy.field = field;
}

function setSortDirection(direction) {
    gSortBy.direction = direction;
}

// Pagination //
function getTotalBooksCount() {
    return filterBooks(gBooks).length;
}

function setPageIdx(pageIdx) {
    gQueryOptions.page.idx = pageIdx;
}

// Internal Functions //
function _createBooks() {
    const books = loadFromStorage(STORAGE_KEY);

    if (!books || books.length === 0) {
        gBooks = _generateDefaultBooks();
        _saveBooks();
    } else {
        gBooks = books;
    }
}

function _createBook(title, price, rating = getRandomRating()) {
    return {
        id: generateRandomId(),
        title,
        price,
        imgUrl: generateImageUrl(title),
        rating
    };
}

function _generateDefaultBooks() {
    return [
        _createBook('The Adventures of Lori Ipsi', 120),
        _createBook('World Atlas'                , 300),
        _createBook('Zorba the Greek'            ,  87),
        _createBook('To Kill a Mockingbird'      ,  95),
        _createBook('Sorcerers Stone'            , 110),
        _createBook('The Great Gatsby'           , 150),
        _createBook('Pride and Prejudice'        ,  80),
        _createBook('The Hobbit'                 , 130),
        _createBook('Harry Potter'               , 200),
        _createBook('Fahrenheit 451'             , 140),
        _createBook('The Catcher in the Rye'     , 105),
        _createBook('The Little Prince'          ,  65),
        _createBook('History of Humankind'       , 185),
        _createBook('Brave New World'            , 145),
        _createBook('The Alchemist'              , 115)
    ];
}

function _saveBooks() {
    saveToStorage(STORAGE_KEY, gBooks);
}