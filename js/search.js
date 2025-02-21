/**
 * Tracks the current page number for pagination in the article search.
 * @type {number}
 */
let currentPage = 0;

/**
 * Stores the JWT token for authentication, initialized from localStorage or set to null if not present.
 * @type {string|null}
 */
let jwtToken = localStorage.getItem('jwtToken') || null;

/**
 * Asynchronously searches for articles based on a user-provided query and page number,
 * then updates the DOM with the search results.
 *
 * @async
 * @function searchArticles
 * @param {number} [page=0] - The page number for pagination (defaults to 0).
 * @returns {Promise<void>} Resolves when the search results are rendered in the DOM.
 */
async function searchArticles(page = 0) {
    // Retrieve the search query from the input element with ID "searchQuery"
    const query = document.getElementById("searchQuery").value;
    // Get the DOM element with ID "articles" where results will be displayed
    const resultsDiv = document.getElementById("articles");

    // Check if the query is empty or only whitespace
    if (!query.trim()) {
        // Display an error message in red if no query is provided
        resultsDiv.innerHTML = `<p class="text-danger">Please enter a search query.</p>`;
        return;
    }

    // Fetch article data from the API using the query and page number
    const data = await fetchArticles(query, page);
    // Update pagination controls based on the API metadata
    updatePagination(data.meta);

    // Render the articles as Bootstrap cards in the resultsDiv
    resultsDiv.innerHTML = data.articles.map(article => `
        <div class="col-md-4">
            <div class="card mb-3">
                <div class="card-body">
                    <h5>${article.title}</h5>
                    <p>${article.abstract}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary">Read More</a>
                    <button class="btn btn-sm btn-success" onclick='handleFavorite("${article.id}", "${article.title}", "${article.url}")'>⭐ Add To Favorite</button>
                </div>
            </div>
        </div>
    `).join('');
    // - Each article is displayed in a Bootstrap grid column (col-md-4)
    // - Includes title, abstract, "Read More" link, and "Add To Favorite" button
    // - The onclick event calls handleFavorite with article details
    // - .join('') combines the array of HTML strings into a single string
}

/**
 * Updates the pagination buttons based on the API metadata and sets the current page.
 *
 * @function updatePagination
 * @param {Object} data - The metadata object from the API response (e.g., {current_page, prev_page, next_page}).
 */
function updatePagination(data) {
    // Update the global currentPage variable with the current page from the API
    currentPage = data.current_page;

    // Disable the "Previous" button if there is no previous page
    document.getElementById('prevPageBtn').disabled = data.prev_page === null;
    // Disable the "Next" button if there is no next page
    document.getElementById('nextPageBtn').disabled = data.next_page === null;
}

/**
 * Changes the current page of search results by calling searchArticles with an updated page number.
 *
 * @function changePage
 * @param {string} direction - The direction to navigate ('prev' for previous page, anything else for next).
 */
function changePage(direction) {
    // If direction is 'prev', load the previous page
    if (direction === 'prev') {
        searchArticles(currentPage - 1);
    }
    // Otherwise, load the next page
    else {
        searchArticles(currentPage + 1);
    }
}

/**
 * Asynchronously adds an article to the user's favorites if authenticated,
 * or prompts for login if no JWT token is present.
 *
 * @async
 * @function handleFavorite
 * @param {string} articleId - The ID of the article to add.
 * @param {string} title - The title of the article.
 * @param {string} url - The URL of the article.
 * @returns {Promise<void>} Resolves when the favorite action is complete or login is prompted.
 */
async function handleFavorite(articleId, title, url) {
    // Check if the user is authenticated (has a JWT token)
    if (!jwtToken) {
        // Show the login modal (using Bootstrap) if no token is present
        new bootstrap.Modal(document.getElementById('loginModal')).show();
        return;
    }

    // Attempt to add the article to favorites via the API
    const data = await addToFavorites({
        "article_id": articleId,
        "article_title": title,
        "article_url": url
    });

    // Handle the API response
    if (data.message) {
        // Display success message (e.g., "Article added to favorites")
        alert(data.message);
    } else if (data.error) {
        // Display error message (e.g., "Article already in favorites")
        alert(data.error);
    } else {
        // Display generic error for unexpected responses
        alert('Error, Please try again.');
    }
}

/**
 * Asynchronously logs in a user by submitting credentials to the API,
 * stores the JWT token, and hides the login modal on success.
 *
 * @async
 * @function login
 * @returns {Promise<void>} Resolves when the login process is complete.
 */
async function login() {
    // Retrieve username and password from input fields
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Call the loginUser API function with the credentials
        const data = await loginUser(username, password);

        // Check if a token was returned in the response
        if (data.token) {
            // Store the token globally and in localStorage
            jwtToken = data.token;
            localStorage.setItem('jwtToken', jwtToken);
            // Notify the user of successful login
            alert('Login successful!');
            // Hide the login modal using Bootstrap's Modal API
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        } else {
            // Notify the user if login failed (no token in response)
            alert('Login failed. Please try again.');
        }
    } catch (error) {
        // Log the error to the console for debugging
        console.error('Login error:', error);
        // Notify the user of a generic error
        alert('An error occurred. Please try again.');
    }
}