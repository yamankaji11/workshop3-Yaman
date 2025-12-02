const API_URL = "http://localhost:3000/movies";
const movieListDiv = document.getElementById("movie-list");
const searchInput = document.getElementById("search-input");
const form = document.getElementById("add-movie-form");

let allMovies = []; // Full movie list

// Render movies on screen
function renderMovies(movies) {
    movieListDiv.innerHTML = "";

    if (movies.length === 0) {
        movieListDiv.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-item");

        movieElement.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <button class="edit-btn" data-id="${movie.id}">Edit</button>
            <button class="delete-btn" data-id="${movie.id}">Delete</button>
        `;

        movieListDiv.appendChild(movieElement);
    });

    attachButtonEvents(); // Attach dynamic event listener
}

// Attach edit/delete events after rendering
function attachButtonEvents() {

    // EDIT BUTTONS
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const movie = allMovies.find(m => m.id == id);
            editMoviePrompt(movie);
        });
    });

    // DELETE BUTTONS
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            deleteMovie(id);
        });
    });
}

// Fetch all movies (READ)
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allMovies = data;
            renderMovies(allMovies);
        })
        .catch(err => console.error("Fetch error:", err));
}

fetchMovies(); // Initial load

// Search movies
searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term)
    );

    renderMovies(filtered);
});

// Add Movie (POST)
form.addEventListener("submit", event => {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById("title").value,
        genre: document.getElementById("genre").value,
        year: parseInt(document.getElementById("year").value)
    };

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie)
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add movie");
            return res.json();
        })
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(err => console.error(err));
});

// Edit movie (prompt UI)
function editMoviePrompt(movie) {
    const newTitle = prompt("Enter new title:", movie.title);
    const newYear = prompt("Enter new year:", movie.year);
    const newGenre = prompt("Enter new genre:", movie.genre);

    if (!newTitle || !newYear || !newGenre) return;

    const updatedMovie = {
        title: newTitle,
        year: parseInt(newYear),
        genre: newGenre
    };

    updateMovie(movie.id, updatedMovie);
}

// Update (PUT)
function updateMovie(id, data) {
    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to update");
            return res.json();
        })
        .then(() => fetchMovies())
        .catch(err => console.error(err));
}

// Delete (DELETE)
function deleteMovie(id) {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete");
            fetchMovies();
        })
        .catch(err => console.error(err));
}