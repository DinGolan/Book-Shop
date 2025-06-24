/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Function Implementations */
function onInit() {
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
                <button class="btn-read">Read</button>
                <button class="btn-update" onclick="onUpdateBook('${book.id}')">Update</button>
                <button class="btn-delete" onclick="onRemoveBook('${book.id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    strHTML += '</tbody>';

    ellTable.innerHTML = strHTML;
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
    const price = +prompt('Enter Book Price : ');

    if (!title || !price || price < 0) return;

    addBook(title, price);
    renderBooks();
}