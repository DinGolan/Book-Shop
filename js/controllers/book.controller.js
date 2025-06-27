/*********************************/
/* Exercise - Book Shop (Part 1) */
/*********************************/
'use strict';

/* Global Variables (Const) */
const MILLI_SECONDS = 2000;

/* Global Variables (Time) */
let gMsgTimeoutId = null;

/* Function Implementations */
function onInit() {
    clearMsgTimeout();
    onUpdateClearBtnState(EMPTY_VALUE);
    renderBooks();
}

function renderBooks() {
    const books    = getBooks();
    const ellTable = document.querySelector('table'); 

    let strHTML = `
        <colgroup>
            <col style="width: 50%">
            <col style="width: 15%">
            <col style="width: 55%">
        </colgroup>
        <thead>
            <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;

    if (books.length === 0) {
        strHTML += `
            <tr>
                <td colspan="3" class="no-books-msg">
                    No Matching Books Were Found ...
                </td>
            </tr>
        `;
    } else {
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
    }

    strHTML += '</tbody>';

    ellTable.innerHTML = strHTML;

    onUpdateBooksStats();
}

function onRemoveBook(bookId) {
    const bookTitle = getBookTitle(bookId);

    removeBook(bookId);
    renderBooks();

    showMsg(`[Success] Book ["${bookTitle}"] - Removed Successfully.`, 'success');
}

function onUpdateBook(bookId) {
    const book         = getBookById(bookId);
    const currentPrice = book.price;

    const newPrice = +prompt('Enter a New Price : ');
    if (isNaN(newPrice) || !newPrice || newPrice < 0) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Price.', 'error')   
        return;
    }

    if (newPrice === currentPrice) {
        showMsg(`[Warning] The price is already set to ${newPrice} - Nothing to Update.`, 'warn');
        return;
    }

    updateBookPrice(bookId, newPrice);
    renderBooks();

    const bookTitle = getBookTitle(bookId);
    showMsg(`[Success] Book ["${bookTitle}"] - Updated Successfully.`, 'success');
}

function onAddBook() {
    const title = prompt('Enter Book Title  : ');
    if (!title || !title.trim()) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Title.', 'error');   
        return;
    }

    const price = +prompt('Enter Book Price : ');
    if (isNaN(price) || !price || price < 0) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Price.', 'error')
        return;
    }

    addBook(title, price);
    renderBooks();
    
    showMsg(`[Success] Book ["${title}"] - Added Successfully.`, 'success');
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
    onUpdateClearBtnState(filterValue);
    renderBooks();
}

function onClearFilter() {
    const elInput = document.querySelector('.filter-container input');
    elInput.value = EMPTY_VALUE;
    setFilterBy(EMPTY_VALUE);
    onUpdateClearBtnState(elInput.value);
    renderBooks();
}

function onUpdateClearBtnState(filterValue) {
    const elClearBtn    = document.querySelector('.clear-btn');
    elClearBtn.disabled = filterValue === EMPTY_VALUE;
}

/* [Not Used] */
function lockTitleColumnWidth() {
    /**
     * [Notes] :
     * - This function is currently unused.
     * - It dynamically sets the width of the "Title" column.
     * - based on the widest content among the title cells.
     * - However, column widths are now controlled via <colgroup> and CSS so this function is no longer necessary.
     **/
    const elTitleCells = document.querySelectorAll('td:first-child');
    if (!elTitleCells.length) return;

    let maxWidth = 0;

    elTitleCells.forEach(titleCell => {
        const width = titleCell.offsetWidth;
        if (width > maxWidth) maxWidth = width;
    })

    const header = document.querySelector('th:first-child');
    if (header) header.style.width = maxWidth + 'px';

    elTitleCells.forEach(titleCell => {
        titleCell.style.width = maxWidth + 'px';
    });
}

function showMsg(txt, type) {
    const elMsg = document.querySelector('.user-msg');

    elMsg.className = 'user-msg';
    elMsg.classList.add(type);

    elMsg.innerText     = txt;
    elMsg.style.display = 'block';

    clearMsgTimeout();
    gMsgTimeoutId = setTimeout(() => {
        elMsg.style.display = 'none';
    }, MILLI_SECONDS);
}

function onUpdateBooksStats() {
    const books = getBooks();

    const expensiveCount = books.filter(book => book.price > 200).length;
    const averageCount   = books.filter(book => book.price >= 80 && book.price <= 200).length;
    const cheapCount     = books.filter(book => book.price < 80).length;

    const elExpensiveCount = document.querySelector('.exp-count');
    const elAverageCount   = document.querySelector('.avg-count');
    const elCheapCount     = document.querySelector('.cheap-count');

    elExpensiveCount.innerText = expensiveCount;
    elAverageCount.innerText   = averageCount;
    elCheapCount.innerText     = cheapCount;
}