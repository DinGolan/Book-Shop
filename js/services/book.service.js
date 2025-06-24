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