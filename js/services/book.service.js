/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Global Variables */
const gBooks = [
    {
        id: 'b101',
        title: 'The Adventures of Lori Ipsi',
        price: 120,
        imgUrl: 'img/lori-ipsi.jpg'
    },
    {
        id: 'b102',
        title: 'World Atlas',
        price: 300,
        imgUrl: 'img/world-atlas.jpg'
    },
    {
        id: 'b103',
        title: 'Zorba the Greek',
        price: 87,
        imgUrl: 'img/zorba.jpg'
    }
]

/* Function Implementations */
function getBooks() {
    return gBooks;
}

function removeBook(bookId) {
    const bookIdx = gBooks.findIndex(book => book.id === bookId);
    if (bookIdx !== -1) gBooks.splice(bookIdx, 1);
}

function updateBookPrice(bookId, newPrice) {
    /* Option (1) */
    const book = gBooks.find(book => book.id === bookId);
    if (book) book.price = newPrice;

    /* Option (2) */
    /**
     * const bookIdx = gBooks.findIndex(book => book.id === bookId);
     * if (bookIdx === -1) return;
     * 
     * gBooks[bookIdx].price = newPrice;
     **/
}

function addBook(title, price) {
    const newBook = createBook(title, price);
    gBooks.push(newBook);
}

function createBook(title, price) {
    return {
        id: generateRandomId(),
        title,
        price,
        imgUrl: generateImageUrl()
    };
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
    const fileName = title.toLowerCase()
                          .split(' ')
                          .join('-');
    
    return `img/${fileName}.jpg`;
}