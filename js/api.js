/**
 * Base URL for the API endpoints. This should be updated if the server address or port changes.
 * @constant {string} BASE_URL
 */
const BASE_URL = "http://localhost:8085";  // Update this if needed

/**
 * Asynchronously fetches articles from the API based on a search query and page number.
 *
 * @async
 * @function fetchArticles
 * @param {string} query - The search query to filter articles.
 * @param {number} [page=0] - The page number for pagination (defaults to 0).
 * @returns {Promise<Object>} A promise that resolves to the JSON response containing article data.
 */
async function fetchArticles(query, page = 0) {
    // Send a GET request to the /articles/search endpoint with query and page parameters
    const response = await fetch(`${BASE_URL}/articles/search?q=${query}&page=${page}`);
    // Parse and return the JSON response from the API
    return response.json();
}

/**
 * Constructs HTTP headers for authenticated API requests.
 * Retrieves the JWT token from localStorage and includes it in the Authorization header if available.
 *
 * @function getAuthHeaders
 * @returns {Object} An object containing Content-Type and Authorization headers.
 */
function getAuthHeaders() {
    // Retrieve the JWT token from localStorage
    let jwtToken = localStorage.getItem('jwtToken');
    // Return headers with Content-Type and conditional Authorization (Bearer token if present)
    return {
        "Content-Type": "application/json",
        "Authorization": jwtToken ? `Bearer ${jwtToken}` : "" // Add token if available
    };
}

/**
 * Asynchronously adds an article to the user's favorites via the API.
 *
 * @async
 * @function addToFavorites
 * @param {Object} article - The article object to add (expected to have article_id, article_title, article_url).
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
async function addToFavorites(article) {
    // Send a POST request to the /favorites endpoint with the article data
    const response = await fetch(`${BASE_URL}/favorites`, {
        method: "POST",
        headers: getAuthHeaders(), // Include authentication headers
        body: JSON.stringify(article) // Convert article object to JSON string
    });

    // Parse and return the JSON response from the API
    return response.json();
}

/**
 * Asynchronously fetches the user's favorite articles from the API.
 *
 * @async
 * @function fetchFavorites
 * @returns {Promise<Object>} A promise that resolves to the JSON response containing the favorites list.
 */
async function fetchFavorites() {
    // Send a GET request to the /favorites endpoint with authentication headers
    const response = await fetch(`${BASE_URL}/favorites`, {
        method: "GET",
        headers: getAuthHeaders() // Include authentication headers
    });
    // Parse and return the JSON response from the API
    return response.json();
}

/**
 * Asynchronously removes an article from the user's favorites via the API.
 *
 * @async
 * @function removeFromFavoritesApi
 * @param {string} articleId - The ID of the article to remove.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
async function removeFromFavoritesApi(articleId) {
    // Send a DELETE request to the /favorites endpoint with the article ID
    const response = await fetch(`${BASE_URL}/favorites`, {
        method: "DELETE",
        headers: getAuthHeaders(), // Include authentication headers
        body: JSON.stringify({
            "article_id": articleId // Send article_id in the request body
        })
    });

    // Parse and return the JSON response from the API
    return response.json();
}

/**
 * Asynchronously logs in a user by sending credentials to the API and stores the JWT token if successful.
 *
 * @async
 * @function loginUser
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that resolves to the JSON response containing the token.
 * @throws {Error} Throws an error if the login request fails (e.g., invalid credentials).
 */
async function loginUser(username, password) {
    // Send a POST request to the /login endpoint with username and password
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // No Authorization header needed for login
        body: JSON.stringify({ username, password }) // Convert credentials to JSON string
    });

    // Check if the response indicates an error (e.g., 401 Unauthorized)
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse and return the JSON response (expected to include a JWT token)
    return response.json();
}