/**
 * Asynchronously loads and displays a list of favorite articles in the DOM.
 * Fetches data from an API and renders it as a series of cards within the "favorites" div.
 * This function is triggered when the window finishes loading.
 *
 * @async
 * @function loadFavorites
 * @returns {Promise<void>} Resolves when the favorites are rendered in the DOM.
 */
async function loadFavorites() {
    // Get the DOM element with ID "favorites" where the articles will be displayed
    const favoritesDiv = document.getElementById("favorites");

    // Fetch favorite articles data from an API (assumed to return a JSON object with a "favorites" array)
    const data = await fetchFavorites();

    // Update the innerHTML of the favoritesDiv with a rendered list of articles
    // Map over the favorites array to create Bootstrap-styled cards for each article
    favoritesDiv.innerHTML = data.favorites.map(article => `
        <div class="col-md-4" id="${article.article_id}">
            <div class="card mb-3">
                <div class="card-body">
                    <h5>${article.article_title}</h5>
                    <a href="${article.article_url}" target="_blank" class="btn btn-sm btn-primary">Read More</a>
                    <button class="btn btn-sm btn-danger" onclick='removeFromFavorites("${article.article_id}")'>🗑 Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    // - Each article is wrapped in a div with class "col-md-4" for Bootstrap grid layout
    // - The card includes the article title, a "Read More" link, and a "Remove" button
    // - The onclick event on the "Remove" button calls removeFromFavorites with the article_id
    // - .join('') converts the array of HTML strings into a single string for innerHTML
}

/**
 * Asynchronously removes an article from the favorites list via an API call and updates the DOM.
 * Displays an alert based on the API response and removes the corresponding element if successful.
 *
 * @async
 * @function removeFromFavorites
 * @param {string} $id - The ID of the article to remove (passed as a string).
 * @returns {Promise<void>} Resolves when the removal process is complete, including DOM updates.
 */
async function removeFromFavorites($id) {
    // Call an API function (assumed) to remove the favorite by its ID and await the response
    const data = await removeFromFavoritesApi($id);

    // Check the API response for a success message
    if (data.message) {
        // Display the success message from the API (e.g., "Favorite deleted")
        alert(data.message);

        // Get the DOM element with the given article ID
        let element = document.getElementById($id);

        // If the element exists, remove it from the DOM
        if (element) {
            element.remove(); // Modern method to remove the element (supported in IE11+)
        }
    }
    // Check the API response for an error message
    else if (data.error) {
        // Display the error message from the API (e.g., "Favorite not found")
        alert(data.error);
    }
    // Fallback case: neither message nor error is present in the response
    else {
        // Display a generic error message for unexpected API responses
        alert('Error, Please try again.');
    }
}

/**
 * Event handler to trigger loadFavorites when the window finishes loading.
 * Ensures the DOM is fully available before attempting to manipulate it.
 */
window.onload = loadFavorites;