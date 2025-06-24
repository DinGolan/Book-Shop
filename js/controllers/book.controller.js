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
                <button class="btn-update">Update</button>
                <button class="btn-delete">Delete</button>
            </td>
        </tr>
    `).join('');

    strHTML += '</tbody>';

    ellTable.innerHTML = strHTML;
}