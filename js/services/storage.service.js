/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Function Implementations */
function loadFromStorage(key) {
    const jsonContent = localStorage.getItem(key);
    return JSON.parse(jsonContent);
}

function saveToStorage(key, content) {
    localStorage.setItem(key, JSON.stringify(content));
}