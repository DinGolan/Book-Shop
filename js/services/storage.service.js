/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Function Implementations */
function setDefaultDisplayMode() {
    /**
     * [Description] :
     * - Initializes the display mode to 'table' by default.
     * - If a different mode (e.g. : 'grid') is stored in localStorage, it overrides it and forces 'table' as the default view on app load.
     **/
    gDisplayMode = loadFromStorage('displayMode') || 'table';

    if (gDisplayMode !== 'table') {
        gDisplayMode = 'table';
        saveToStorage('displayMode', gDisplayMode);
    }
}

function loadFromStorage(key) {
    const jsonContent = localStorage.getItem(key);
    const jsonData    = JSON.parse(jsonContent);

    if (Array.isArray(jsonData)) {
        jsonData.forEach(book => {
            if (book.rating === undefined || book.rating === null || book.rating === 0) {
                book.rating = getRandomRating();
            }
        });
    }

    return jsonData;
}

function saveToStorage(key, content) {
    localStorage.setItem(key, JSON.stringify(content));
}