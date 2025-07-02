/*************************************/
/* Exercise - Book Shop (Part 1 + 2) */
/*************************************/
'use strict';

/* Global Variables (Const) */
const MILLI_SECONDS = 2000;

/* Global Variables (Time) */
let gMsgTimeoutId = null;

/* Global Variables (Generals) */
var gCurrReadBookId = null;
var gDisplayMode    = null;

// --- //

/* Function Implementations */

// Initializes App //
function onInit() {
    setDefaultDisplayMode();
    clearMsgTimeout();
    onUpdateClearBtnState();
    renderBooks();
}

// Render Books (Generals) //
function renderBooks() {
    const books       = getBooks();
    const elContainer = document.querySelector('.books-view-container');

    if (gDisplayMode === 'table') {
        const tableHTML       = renderBooksTable(books);
        elContainer.innerHTML = tableHTML;
    } else {
        const gridHTML        = renderBooksGrid(elContainer, books);
        elContainer.innerHTML = gridHTML; 
    }

    onUpdateBooksStats();
}

// Render Books Table //
function renderBooksTable(books) {
    let strHTML = `
        <table>
            <colgroup>
                <col style="width: 50%">
                <col style="width: 15%">
                <col style="width: 25%">
                <col style="width: 55%">
            </colgroup>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (!books.length) {
        strHTML += `
            <tr>
                <td colspan="4" class="no-books-msg">
                    No Matching Books Were Found ...
                </td>
            </tr>
        `;
    } else {
        strHTML += books.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.price}</td>
                <td class="book-rating-stars">${renderStars(book.rating)}</td>
                <td class="actions">
                    <button class="btn-read" onclick="onShowBookDetails('${book.id}')">Read</button>
                    <button class="btn-update" onclick="onUpdateBook('${book.id}')">Update</button>
                    <button class="btn-delete" onclick="onRemoveBook('${book.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    strHTML += '</tbody></table>';
    return strHTML;
}

// Render Books (Grid) //
function renderBooksGrid(elContainer, books) {
    let strHTML = '<div class="book-grid">';

    if (!books.length) {
        strHTML += '<p class="no-books-msg">No Matching Books Were Found ...</p>';
        return strHTML;
    }

    strHTML += books.map(renderBookCard).join('');
    strHTML += '</div>';

    return strHTML;
}

function renderBookCard(book) {
    return `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>Price : ${book.price}</p>
            <p class="book-rating-stars">${renderStars(book.rating)}</p>
            <div class="actions">
                <button class="btn-read" onclick="onShowBookDetails('${book.id}')">Read</button>
                <button class="btn-update" onclick="onUpdateBook('${book.id}')">Update</button>
                <button class="btn-delete" onclick="onRemoveBook('${book.id}')">Delete</button>
            </div>
        </div>
    `;
}

// Remove Book //
function onRemoveBook(bookId) {
    const bookTitle = getBookTitle(bookId);

    removeBook(bookId);
    renderBooks();

    showMsg(`[Success] Book ["${bookTitle}"] - Removed Successfully.`, 'success');
}

// Update Book //
function onUpdateBook(bookId) {
    const book         = getBookById(bookId);
    const currentPrice = book.price;

    const newPrice = +prompt('Enter a New Price : ');
    if (!(isValidPrice(newPrice))) {
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

// Show Book Details //
function onShowBookDetails(bookId) {
    const book = getBookById(bookId);
    
    const elModal   = document.querySelector('.book-details-modal');
    const elContent = elModal.querySelector('.book-details-content');
    
    elContent.innerHTML = JSON.stringify(book, null, 4);

    gCurrReadBookId = bookId;

    renderRatingControls(book.rating); 

    elModal.showModal();
}

function renderRatingControls(rating) {
    const elRatingControls = document.querySelector('.book-rating-controls');

    elRatingControls.innerHTML = `
        <button type="button" onclick="onChangeRating(-1)">
            <div class="circle-icon">─</div>
        </button>
        <span class="book-rating">${rating ?? 0}</span>
        <button type="button" onclick="onChangeRating(1)">
            <div class="circle-icon">+</div>
        </button>
    `;
}

function onChangeRating(diff) {
    if (!gCurrReadBookId) return;

    const book = updateBookRating(gCurrReadBookId, diff);
    if (!book) return;

    const elRating     = document.querySelector('.book-rating');
    elRating.innerText = book.rating;
    
    const elContent     = document.querySelector('.book-details-content');
    elContent.innerHTML = JSON.stringify(book, null, 4);

    renderRatingControls(book.rating); 
}

// Filter Books //
function onFilterBy(filterProperty, filterValue) {
    setFilterBy(filterProperty, filterValue);
    onUpdateClearBtnState();
    renderBooks();
}

function onClearFilter() {
    const elInput  = document.querySelector('.filter-container input');
    const elSelect = document.querySelector('.filter-container select');

    elInput.value          = EMPTY_VALUE;
    elSelect.selectedIndex = 0;

    setFilterBy('title', EMPTY_VALUE);
    setFilterBy('minRating', 0);

    onUpdateClearBtnState();
    renderBooks();
}

function onUpdateClearBtnState() {
    const elClearBtn   = document.querySelector('.clear-btn');
    const shouldEnable = gFilterBy.title || gFilterBy.minRating > 0;
    
    elClearBtn.disabled = !shouldEnable;
}

// Show Message //
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

// Show Stats //
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

// Modal (Add Book) //
function onOpenModal() {
    const elModal = document.querySelector('.add-book-modal');
    elModal.showModal();
}

function onCloseModal() {
    const elModal = document.querySelector('.add-book-modal');
    elModal.close();

    const elBookTitleInput = document.querySelector('.book-title-input');
    elBookTitleInput.value = '';

    const elBookPriceInput = document.querySelector('.book-price-input');
    elBookPriceInput.value = '';

    const elAddBtn    = document.querySelector('.btn-add')
    elAddBtn.disabled = true;
}

function onAddBookFromModal(event) {
    event.preventDefault();

    const elBookTitleInput = document.querySelector('.book-title-input');
    const title = elBookTitleInput.value.trim();
    if (!isValidTitle(title)) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Title.', 'error');   
        return;
    }

    const elBookPriceInput = document.querySelector('.book-price-input');
    const price = +elBookPriceInput.value;
    if (!isValidPrice(price)) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Price.', 'error')
        return;
    }

    addBook(title, price);
    
    renderBooks();

    onCloseModal();
}

// Modal (Add Book) (Listener) //
const elBookModalInputs = document.querySelectorAll('.add-book-modal input');
elBookModalInputs.forEach(input => {
    input.addEventListener('input', onModalInputChange);
});

function onModalInputChange() {
    const elBookTitleInput = document.querySelector('.book-title-input');
    const elBookPriceInput = document.querySelector('.book-price-input');
    
    const title = elBookTitleInput.value.trim();
    const price = +elBookPriceInput.value;

    const elAddBtn    = document.querySelector('.btn-add');
    elAddBtn.disabled = !(isValidTitle(title) && isValidPrice(price));

    const elCancelBtn    = document.querySelector('.btn-cancel');
    elCancelBtn.disabled = false;
}

// Toggle View //
function onToggleDisplayMode() {
    gDisplayMode = (gDisplayMode === 'table') ? 'grid' : 'table';
    saveToStorage('displayMode', gDisplayMode);
    renderBooks();
}

// Book Rating //
function renderStars(rating) {
    const fullStars  = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return fullStars + emptyStars;
}

/*********************************************************/

/* Not Used */
function onAddBook() {
    /**
     * [Notes] :
     * - This function is no longer used since we replaced the functionality.
     * - We now use a modal dialog to add a new book instead of using prompt dialogs.
     **/
    const title = prompt('Enter Book Title  : ');
    if (!isValidTitle(title)) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Title.', 'error');   
        return;
    }

    const price = +prompt('Enter Book Price : ');
    if (!isValidPrice(price)) {
        showMsg('[Error] Invalid Input. Please Enter a Valid Price.', 'error')
        return;
    }

    addBook(title, price);
    renderBooks();
    
    showMsg(`[Success] Book ["${title}"] - Added Successfully.`, 'success');
}

/* Not Used */
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
