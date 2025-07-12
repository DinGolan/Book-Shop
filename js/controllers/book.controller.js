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

    renderNavigatePageNumbers();
    onUpdateBooksStats();
}

// Render Books (Table) //
function renderBooksTable(books) {
    let strHTML = `
        <table>
            <colgroup>
                <col style="width: 250px">
                <col style="width: 100px">
                <col style="width: 150px">
                <col style="width: 250px">
            </colgroup>
            <thead>
                <tr>
                    <th onclick="onHeaderSortClick('title')" 
                        class="${gSortBy.field === 'title' ? 'sorted' : EMPTY_STRING}">
                            Title ${renderSortSymbol('title')}
                    </th>
                    <th onclick="onHeaderSortClick('price')" 
                        class="${gSortBy.field === 'price' ? 'sorted' : EMPTY_STRING}">
                            Price ${renderSortSymbol('price')}
                    </th>
                    <th onclick="onHeaderSortClick('rating')" 
                        class="${gSortBy.field === 'rating' ? 'sorted' : EMPTY_STRING}">
                            Rating ${renderSortSymbol('rating')}
                    </th>
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
        strHTML += books.map(renderBooksTableRow).join(EMPTY_STRING);
    }

    strHTML += '</tbody></table>';
    return strHTML;
}

function renderBooksTableRow(book) {
    return `
        <tr>
            <td>${book.title}</td>
            <td>${book.price}</td>
            <td class="book-rating-stars">${renderRatingStars(book.rating)}</td>
            <td class="actions">
                <button class="btn-read" onclick="onShowBookDetails('${book.id}')">Read</button>
                <button class="btn-update" onclick="onOpenModal('${book.id}')">Update</button>
                <button class="btn-delete" onclick="onRemoveBook('${book.id}')">Delete</button>
            </td>
        </tr>
    `;
}

// Render Books (Grid) //
function renderBooksGrid(elContainer, books) {
    let strHTML = '<div class="book-grid">';

    if (!books.length) {
        strHTML += '<p class="no-books-msg">No Matching Books Were Found ...</p>';
        return strHTML;
    }

    strHTML += books.map(renderBookCard).join(EMPTY_STRING);
    strHTML += '</div>';

    return strHTML;
}

function renderBookCard(book) {
    return `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>Price : ${book.price}</p>
            <p class="book-rating-stars">${renderRatingStars(book.rating)}</p>
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
    /**
     * [Description] :
     * - Opens the "Read" modal with detailed information about the selected book.
     * 
     * Steps :
     * 1. Retrieves the book object by its ID.
     * 2. Selects and populates the modal content with the book's JSON data.
     * 3. Stores the current book ID in a global variable for future actions (e.g., rating/editing).
     * 4. Renders the rating controls in "read mode".
     * 5. Displays the modal using the <dialog> API.
     * 6. Updates the URL with the bookId as a query parameter (for deep-linking).
     **/
    const book = getBookById(bookId);
    
    const elModal   = document.querySelector('.show-details-book-modal');
    const elContent = elModal.querySelector('.show-details-book-content');
    
    elContent.innerHTML = JSON.stringify(book, null, 4);

    gCurrReadBookId = bookId;

    renderRatingControls(book.rating, '.read-mode-rating-controls'); 

    elModal.showModal();

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('bookId', bookId);
    window.history.pushState({ }, EMPTY_STRING, newUrl);
}

function onEditBookFromDetails() {
    /**
     * [Description] :
     * 
     * Purpose :
     * - Transitions from "Read" mode (book details view) to "Edit" mode (book form modal).
     * 
     * Steps :
     * 1. Retrieves the currently viewed book ID.
     * 2. Closes the "Read" modal to ensure only one <dialog> is open at a time.
     * 3. Opens the "Edit" modal pre-filled with the selected book's data.
     * 4. Cleans the URL by removing the 'bookId' query parameter to prevent modal auto-open on refresh.
     **/
    const bookId = gCurrReadBookId;
    if (!bookId) return;

    const elModal = document.querySelector('.show-details-book-modal');
    
    /**
     * [Description] :
     * - Close the "Read" modal before opening the "Edit" modal.
     * - This ensures that only one <dialog> is open at a time, which avoids UI glitches and keeps the modal behavior valid.
     **/
    elModal.close()

    onOpenModal(bookId);

    const currUrl = new URL(window.location.href);
    currUrl.searchParams.delete('bookId');
    window.history.pushState({ }, EMPTY_STRING, currUrl);
}

// Filter Books //
function onFilterBy(filterProperty, filterValue) {
    setFilterBy(filterProperty, filterValue);
    setPageIdx(0);
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
    setPageIdx(0);

    onUpdateClearBtnState();
    setQueryParams();
    renderBooks();
}

function onUpdateClearBtnState() {
    const elClearBtn    = document.querySelector('.btn-clear');
    const shouldEnable  = gFilterBy.title || gFilterBy.rating > 0;
    elClearBtn.disabled = !shouldEnable;
}

// Reset State //
function onResetState() {
    setFilterBy('title', EMPTY_STRING);
    setFilterBy('rating', 0);
    setSortByField(EMPTY_STRING);
    setSortDirection(1);
    setPageIdx(0);

    const elFilterInput  = document.querySelector('.filter-container input');
    const elFilterSelect = document.querySelector('.filter-container select');
    const elRadioBtns    = document.querySelectorAll(`.sort-container input[type="radio"]`);
    const elSortSelect   = document.querySelector('.sort-container select');

    elFilterInput.value          = EMPTY_STRING;
    elFilterSelect.selectedIndex = 0;
    elSortSelect.selectedIndex   = 0;
    elRadioBtns.forEach(radioBtn => radioBtn.checked = false);
    elRadioBtns.forEach(radioBtn => radioBtn.toggleAttribute('disabled', true));

    onUpdateClearBtnState();
    setQueryParams();
    renderBooks();
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
    /**
     * [Description] :
     * - Updates the footer with the number of expensive, average, and cheap books based on their price ranges.
     **/
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

// Modal (Add Book / Update Book) //
function onOpenModal(bookId = null) {
    /**
     * [Description] :
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
    const elAddBtn         = document.querySelector('.btn-add-book-modal');

    gEditedBookId = bookId;

    if (bookId) {
        const book = getBookById(bookId);
        elBookTitleInput.value = book.title;
        elBookPriceInput.value = book.price;
        gEditedBookRating      = book.rating;
        elAddBtn.innerText     = 'Save Changes';
    } else {
        elBookTitleInput.value = EMPTY_STRING;
        elBookPriceInput.value = EMPTY_STRING;
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
    elBookTitleInput.value = EMPTY_STRING;

    const elBookPriceInput = document.querySelector('.book-price-input');
    elBookPriceInput.value = EMPTY_STRING;

    const elAddBtn    = document.querySelector('.btn-add-book-modal')
    elAddBtn.disabled = true;

    // Remove 'bookId' from URL when modal is closed //
    const currUrl = new URL(window.location.href);
    currUrl.searchParams.delete('bookId');
    window.history.pushState({ }, EMPTY_STRING, currUrl);
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

    const elAddBtn    = document.querySelector('.btn-add-book-modal');
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
function renderRatingStars(rating) {
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
    /**
     * [Description] :
     * 
     * Purpose :
     * - Handles changes to a book's rating, either in "read" mode (details view)
     *   or in "edit" mode (add/update form).
     * 
     * Parameters :
     * - diff (number) - the change in rating (usually +1 or -1).
     * 
     * Behavior :
     * 1. If in "read mode" (a book is being viewed) :
     *    - Updates the rating of the currently viewed book.
     *    - Reflects the new rating visually in the modal and updates the JSON display.
     * 2. If in "edit mode" (no book is being read) :
     *    - Updates the temporary rating value being edited.
     *    - Clamps the value between 0 and 5.
     *    - Updates the rating display in the form.
     *    - Re-triggers form validation to enable/disable the "Add" button accordingly.
     **/
    if (gCurrReadBookId) {
        const book = updateBookRating(gCurrReadBookId, diff);
        if (!book) return;

        const elReadRating     = document.querySelector('.read-mode-rating-controls .book-rating');
        elReadRating.innerText = book.rating;
        
        const elContent     = document.querySelector('.show-details-book-content');
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
    /**
     * [Description] :
     * 
     * Purpose of readQueryParams() :
     * - Reads filter, sort, and pagination parameters from the URL (e.g. ?title=potter&field=price&direction=-1).
     * - Syncs them with global variables : gFilterBy, gSortBy, and gQueryOptions.page.idx.
     * - Updates form fields (input/select/radio) to match the current values.
     * - Opens the book modal automatically if a bookId exists in the URL.
     * 
     * Goal : 
     * - Maintain view state across refreshes and when sharing links.
     **/
    if (!window.location.search) return; // If there are no query parameters, skip parsing //

    const queryParams = new URLSearchParams(window.location.search);
    
    const title     =  queryParams.get('title')     || EMPTY_STRING;
    const rating    = +queryParams.get('rating')    || 0;
    const field     =  queryParams.get('field')     || EMPTY_STRING;
    const direction = +queryParams.get('direction') || 1;
    const pageIdx   = +queryParams.get('pageIdx')   || 0;

    setFilterBy('title', title);
    setFilterBy('rating', rating);
    setSortByField(field);
    setSortDirection(direction);
    setPageIdx(pageIdx);

    const elFilterInput  = document.querySelector('.filter-container input');
    const elFilterSelect = document.querySelector('.filter-container select');
    const elRadioBtn     = document.querySelector(`.sort-container input[value="${direction}"]`);
    const elSortSelect   = document.querySelector('.sort-container select');
    
    elFilterInput.value  = title;
    elFilterSelect.value = rating;
    elRadioBtn.checked   = true;
    elSortSelect.value   = field;

    /**
     * [Description] :
     * - If a bookId exists in the URL (e.g. : ?bookId=abc123), automatically open the book details modal for that book.
     * - This enables bookmarking and deep linking directly to a book.
     **/
    const bookId = queryParams.get('bookId');
    if (bookId) {
        onShowBookDetails(bookId);
    }

    const isDisabled  = (field === EMPTY_STRING);
    const elRadioBtns = document.querySelectorAll('.radio-btn');
    elRadioBtns.forEach(radioBtn => radioBtn.toggleAttribute('disabled', isDisabled));
}

function setQueryParams() {
    /**
     * [Description] :
     * 
     * Purpose :
     * - Updates the browser's URL with the current app state (filters, sorting, pagination)
     *   without reloading the page.
     * 
     * Logic :
     * 1. Creates a URLSearchParams object and adds current filter/sort/page values if they exist.
     * 2. Constructs a new URL string using the current location and the updated parameters.
     * 3. Uses the History API (`pushState`) to update the URL in the address bar.
     * 
     * Notes :
     * - This enables deep linking and bookmarking of the current view state.
     * - Also allows restoring state on refresh or share.
     **/
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
    
    window.history.pushState({ path: newUrl }, EMPTY_STRING, newUrl);
}

// Sort Books //
function onSetSortByField(field) {
    setSortByField(field);

    const isDisabled = (field === EMPTY_STRING);

    // Disable radio buttons if no sort field is selected //
    const elRadioBtns = document.querySelectorAll('.sort-container input[type="radio"]');
    elRadioBtns.forEach(radioBtn => { radioBtn.disabled = isDisabled; });

    setPageIdx(0);
    setQueryParams();
    renderBooks();
}

function onSetSortDirection(direction) {
    const elSortSelect  = document.querySelector('.sort-container select');
    const selectedField = elSortSelect.value;

    if (!selectedField) return;

    setSortByField(selectedField);
    setSortDirection(direction);

    setPageIdx(0);
    setQueryParams();
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
    const shouldDisable = (totalPages <= 1);

    elPrevBtn.disabled  = shouldDisable;
    elNextBtn.disabled  = shouldDisable;

    elPrevBtn.classList.toggle('disabled', shouldDisable);
    elNextBtn.classList.toggle('disabled', shouldDisable);
}

function renderNavigatePageNumbers() {
    /**
     * [Description] :
     *
     * Purpose :
     * - Renders dynamic pagination controls (page numbers and navigation arrows) based on the current book list.
     * 
     * Logic :
     * 1. Calculates the total number of pages based on total filtered books and PAGE_SIZE.
     * 2. If there are no pages (e.g., no books), clears the pagination UI and exits.
     * 3. Creates "Previous" and "Next" buttons, and disables them if there's only one page.
     * 4. Dynamically generates a button for each page number :
     *    - Highlights the button of the current page using the 'active' class.
     *    - Assigns onclick handlers to navigate to the corresponding page.
     * 5. Injects the final HTML into the `.pagination-controls` container.
     * 
     * UI Result :
     * ← [1] [2] [3] →  (with active and disabled states handled correctly).
     **/
    const totalBooks  = getTotalBooksCount();
    const totalPages  = Math.ceil(totalBooks / PAGE_SIZE);
    const currPageIdx = gQueryOptions.page.idx;

    const elPagination = document.querySelector('.pagination-controls');

    if (totalPages === 0) {
        elPagination.innerHTML = EMPTY_STRING;
        return;
    }

    const shouldDisable = (totalPages <= 1);

    let strHTML = `
        <button class="btn-prev" onclick="onChangePage(-1)" ${shouldDisable ? 'disabled' : EMPTY_STRING}>←</button>
    `;

    for (let i = 0; i < totalPages; i++) {
        const isActive = (i === currPageIdx) ? 'active' : EMPTY_STRING;
        strHTML += `
            <button class="btn-page ${isActive}" onclick="onGoToPage(${i})">${i + 1}</button> 
        `;
    }

    strHTML += `
        <button class="btn-next" onclick="onChangePage(1)" ${shouldDisable ? 'disabled' : EMPTY_STRING}>→</button>
    `;

    elPagination.innerHTML = strHTML;
}

function onGoToPage(pageIdx) {
    setPageIdx(pageIdx);
    setQueryParams();
    renderBooks();
}

// Sort Headers //
function renderSortSymbol(field) {
    if (gSortBy.field !== field) return EMPTY_STRING;
    return gSortBy.direction === 1 ? '(+)' : '(─)';
}

function onHeaderSortClick(field) {
    if (gSortBy.field === field) {
        gSortBy.direction *= -1; // Toggle Direction //
    } else {
        gSortBy.field     = field;
        gSortBy.direction = 1;
    }

    const elSortSelect = document.querySelector('.sort-container select');
    elSortSelect.value = gSortBy.field;

    const elDirectionInput = document.querySelector(`.sort-container input[value="${gSortBy.direction}"]`);
    if (elDirectionInput) elDirectionInput.checked = true;

    setPageIdx(0);
    setQueryParams();
    renderBooks();
}