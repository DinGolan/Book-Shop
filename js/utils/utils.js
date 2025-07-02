/*************************************/
/* Exercise - Book Shop (Part 1 + 2) */
/*************************************/
'use strict';

/* Function Implementations */

// Generate Rating //
function getRandomRating(min = 0, max = 5) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate Random Id //
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

// Generate Image URL //
function generateImageUrl(title) {
    if (!title) return 'img/default.jpg' 

    const fileName = title.toLowerCase()
                          .split(' ')
                          .join('-');
    
    return `img/${fileName}.jpg`;
}
