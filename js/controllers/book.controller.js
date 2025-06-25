/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Function Implementations */
function onInit() {
    updateClearBtnState(EMPTY_VALUE);
    renderBooks();
}

function renderBooks() {
    const books    = getBooks();
    const ellTable = document.querySelector('table'); 

    let strHTML = `
        <thead>
            <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    strHTML += books.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.price}</td>
            <td class="actions">
                <button class="btn-read" onclick="onShowBookDetails('${book.id}')">Read</button>
                <button class="btn-update" onclick="onUpdateBook('${book.id}')">Update</button>
                <button class="btn-delete" onclick="onRemoveBook('${book.id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    strHTML += '</tbody>';

    ellTable.innerHTML = strHTML;
    
    lockTitleColumnWidth();
}

function onRemoveBook(bookId) {
    removeBook(bookId);
    renderBooks();
}

function onUpdateBook(bookId) {
    const newPrice = +prompt('Enter a New Price : ');
    if (!newPrice || newPrice < 0) return;

    updateBookPrice(bookId, newPrice);
    renderBooks();
}

function onAddBook() {
    const title = prompt('Enter Book Title  : ');
    if (!title) return;

    const price = +prompt('Enter Book Price : ');
    if (!price || price < 0) return;

    addBook(title, price);
    renderBooks();
}

function onShowBookDetails(bookId) {
    const book = getBookById(bookId);
    
    const elModal   = document.querySelector('.book-details-modal');
    const elContent = elModal.querySelector('.book-details-content');
    
    elContent.innerText = JSON.stringify(book, null, 4);
    elModal.showModal();
}

function onFilterByTitle(filterValue) {
    setFilterBy(filterValue);
    updateClearBtnState(filterValue);
    renderBooks();
}

function onClearFilter() {
    const elInput = document.querySelector('.filter-container input');
    elInput.value = EMPTY_VALUE;
    setFilterBy(EMPTY_VALUE);
    updateClearBtnState(elInput.value);
    renderBooks();
}

function updateClearBtnState(filterValue) {
    const elClearBtn    = document.querySelector('.clear-btn');
    elClearBtn.disabled = filterValue === EMPTY_VALUE;
}

function lockTitleColumnWidth() {
    const elTitleCells = document.querySelectorAll('td:first-child');
    if (!elTitleCells.length) return;

    let maxWidth = 0;

    elTitleCells.forEach(titleCell => {
        const width = titleCell.offsetWidth;
        if (width > maxWidth) maxWidth = width;
    })

    // [Debug] //
    console.log(maxWidth);

    const header = document.querySelector('th:first-child');
    if (header) header.style.width = maxWidth + 'px';

    elTitleCells.forEach(titleCell => {
        titleCell.style.width = maxWidth + 'px';
    });
}