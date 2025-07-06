/*************************************/
/* Exercise - Book Shop (Part 1 + 2) */
/*************************************/
'use strict';

/* Global Variables (Const) */
const MILLI_SECONDS = 2000;

/* Global Variables (Time) */
var gMsgTimeoutId = null;

/* Global Variables (Generals) */
var gCurrReadBookId   = null;
var gDisplayMode      = null;
var gEditedBookId     = null;
var gEditedBookRating = 0;

// --- //

/* Function Implementations */

// Initializes App //
function onInit() {
    setDefaultDisplayMode();
    readQueryParams();
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

    onUpdatePaginationButtons();
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
                    <button class="btn-update" onclick="onOpenModal('${book.id}')">Update</button>
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
                <button class="btn-update" onclick="onOpenModal('${book.id}')">Update</button>
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

// Show Book Details //
function onShowBookDetails(bookId) {
    const book = getBookById(bookId);
    
    const elModal   = document.querySelector('.book-details-modal');
    const elContent = elModal.querySelector('.book-details-content');
    
    elContent.innerHTML = JSON.stringify(book, null, 4);

    gCurrReadBookId = bookId;

    renderRatingControls(book.rating, '.read-mode-rating-controls'); 

    elModal.showModal();
}

// Filter Books //
function onFilterBy(filterProperty, filterValue) {
    setFilterBy(filterProperty, filterValue);
    onUpdateClearBtnState();
    setQueryParams();
    renderBooks();
}

function onClearFilter() {
    const elFilterInput  = document.querySelector('.filter-container input');
    const elFilterSelect = document.querySelector('.filter-container select');

    elFilterInput.value          = EMPTY_STRING;
    elFilterSelect.selectedIndex = 0;

    setFilterBy('title', EMPTY_STRING);
    setFilterBy('rating', 0);

    onUpdateClearBtnState();
    setQueryParams();
    renderBooks();
}

function onUpdateClearBtnState() {
    const elClearBtn   = document.querySelector('.clear-btn');
    const shouldEnable = gFilterBy.title || gFilterBy.rating > 0;
    
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
function onOpenModal(bookId = null) {
    /**
     * [Notes] :
     * - Reset read mode state when opening the Add/Update modal.
     * - This ensures the rating controls behave in "edit mode".
     * - Without this, the onChangeRating() function will mistakenly
     *   treat it as "read mode" and try to update an existing book instead.
     **/
    gCurrReadBookId = null;

    const elModal = document.querySelector('.add-update-book-modal');

    const elModalTitle = elModal.querySelector('h2');
    elModalTitle.innerText = (bookId) ? 'Update Book' : 'Add New Book';

    const elBookTitleInput = document.querySelector('.book-title-input');
    const elBookPriceInput = document.querySelector('.book-price-input');
    const elAddBtn         = document.querySelector('.btn-add');

    gEditedBookId = bookId;

    if (bookId) {
        const book = getBookById(bookId);
        elBookTitleInput.value = book.title;
        elBookPriceInput.value = book.price;
        gEditedBookRating      = book.rating;
        elAddBtn.innerText     = 'Save Changes';
    } else {
        elBookTitleInput.value = '';
        elBookPriceInput.value = '';
        gEditedBookRating      = 0;
        elAddBtn.innerText     = 'Add';
    }

    renderRatingControls(gEditedBookRating, '.edit-mode-rating-controls');
    elAddBtn.disabled = true;
    elModal.showModal();
}

function onCloseModal() {
    const elModal = document.querySelector('.add-update-book-modal');
    elModal.close();

    const elBookTitleInput = document.querySelector('.book-title-input');
    elBookTitleInput.value = '';

    const elBookPriceInput = document.querySelector('.book-price-input');
    elBookPriceInput.value = '';

    const elAddBtn    = document.querySelector('.btn-add')
    elAddBtn.disabled = true;
}

function onSubmitBookForm(event) {
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

    if (gEditedBookId) {
        updateBook(gEditedBookId, title, price, gEditedBookRating);
        showMsg(`[Success] Book updated successfully.`, 'success');
    } else {
        addBook(title, price, gEditedBookRating);
        showMsg(`[Success] Book added successfully.`, 'success');
    }
    
    renderBooks();
    onCloseModal();
}

// Modal (Add Book) (Listener) //
const elBookModalInputs = document.querySelectorAll('.add-update-book-modal input');
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

function renderRatingControls(rating, containerSelector) {
    const elRatingControls = document.querySelector(containerSelector);

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
    if (gCurrReadBookId) {
        const book = updateBookRating(gCurrReadBookId, diff);
        if (!book) return;

        const elReadRating     = document.querySelector('.read-mode-rating-controls .book-rating');
        elReadRating.innerText = book.rating;
        
        const elContent     = document.querySelector('.book-details-content');
        elContent.innerHTML = JSON.stringify(book, null, 4);

        renderRatingControls(book.rating, '.read-mode-rating-controls');
    } else {
        gEditedBookRating += diff;

        if (gEditedBookRating < 0) gEditedBookRating = 0;
        if (gEditedBookRating > 5) gEditedBookRating = 5;

        const elEditRating     = document.querySelector('.edit-mode-rating-controls .book-rating');
        elEditRating.innerText = gEditedBookRating;

        onModalInputChange();
    }
}

// Query Params //
function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search);
    
    const title     =  queryParams.get('title')     || EMPTY_STRING;
    const rating    = +queryParams.get('rating')    || 0;
    const field     = queryParams.get('field')      || '';
    const direction = +queryParams.get('direction') || 1;
    const pageIdx   = +queryParams.get('pageIdx')   || 0;

    setFilterBy('title', title);
    setFilterBy('rating', rating);
    setSortByField(field);
    setSortDirection(direction);
    gQueryOptions.page.idx = pageIdx;

    const elFilterInput  = document.querySelector('.filter-container input');
    const elFilterSelect = document.querySelector('.filter-container select');
    const elSortInput    = document.querySelector(`.sort-container input[value="${direction}"]`);
    const elSortSelect   = document.querySelector('.sort-container select');
    
    elFilterInput.value  = title;
    elFilterSelect.value = rating;
    elSortInput.checked  = true;
    elSortSelect.value   = field;
}

function setQueryParams() {
    const queryParams = new URLSearchParams();

    if (gFilterBy.title) {
        queryParams.set('title', gFilterBy.title);
    }

    if (gFilterBy.rating) {
        queryParams.set('rating', gFilterBy.rating);
    }

    if (gSortBy.field) {
        queryParams.set('field', gSortBy.field);
        queryParams.set('direction', gSortBy.direction);
    }

    queryParams.set('pageIdx', gQueryOptions.page.idx);

    const newUrl = window.location.protocol + '//' +
                   window.location.host     +
                   window.location.pathname + '?' + queryParams.toString();
    
    window.history.pushState({ path: newUrl }, '', newUrl);
}

// Sort Books //
function onSetSortByField(field) {
    setSortByField(field);
    renderBooks();
}

function onSetSortDirection(direction) {
    setSortDirection(direction);

    if (!gSortBy.field) {
        const elSortSelect         = document.querySelector('.sort-container select');
        elSortSelect.selectedIndex = 0;
    }

    renderBooks();
}

// Pagination //
function onChangePage(diff) {
    const totalBooks = getTotalBooksCount();
    const totalPages = Math.ceil(totalBooks / PAGE_SIZE);

    gQueryOptions.page.idx += diff;

    if (gQueryOptions.page.idx >= totalPages) gQueryOptions.page.idx = 0;
    if (gQueryOptions.page.idx < 0)           gQueryOptions.page.idx = totalPages - 1;

    setQueryParams();
    renderBooks();
}

function onUpdatePaginationButtons() {
    const totalBooks = getTotalBooksCount();
    const totalPages = Math.ceil(totalBooks / PAGE_SIZE);

    const elPrevBtn     = document.querySelector('.btn-prev');
    const elNextBtn     = document.querySelector('.btn-next');
    const shouldDisable = totalPages <= 1;

    elPrevBtn.disabled  = shouldDisable;
    elNextBtn.disabled  = shouldDisable;

    elPrevBtn.classList.toggle('disabled', shouldDisable);
    elNextBtn.classList.toggle('disabled', shouldDisable);
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

/* Not Used */
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