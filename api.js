const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const submitBtn = document.getElementById("submit-btn");
const statusP = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");

let notesArray = [];

// Reusable async request function with error checking and try/catch
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        // Return both response object and parsed JSON if applicable
        const data = response.status !== 204 ? await response.json() : null;
        return { data, status: response.status };
    } catch (error) {
        throw error;
    }
}

// Update status message with appropriate styling class
function setStatus(message, type) {
    statusP.textContent = message;
    statusP.className = `status-message status-${type}`;
}

// Render notes array securely using textContent only (preventing XSS)
function renderNotes() {
    notesList.textContent = "";

    if (notesArray.length === 0) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.textContent = "No notes available.";
        notesList.appendChild(li);
        return;
    }

    notesArray.forEach((note) => {
        const li = document.createElement("li");
        li.className = "note-item";

        const contentDiv = document.createElement("div");
        contentDiv.className = "note-content";

        const titleSpan = document.createElement("span");
        titleSpan.className = "note-title";
        titleSpan.textContent = note.title;

        const bodyP = document.createElement("p");
        bodyP.className = "note-body";
        bodyP.textContent = note.body || "";

        const metaP = document.createElement("p");
        metaP.className = "note-meta";
        metaP.textContent = `ID: ${note.id} | User ID: ${note.userId || 1}`;

        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(bodyP);
        contentDiv.appendChild(metaP);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteNote(note.id, li));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
    });
}

// GET: Load 10 notes
async function loadNotes() {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");

    try {
        const { data } = await request(`${API_URL}?_limit=10`);
        notesArray = data;
        renderNotes();
        setStatus(`Loaded ${notesArray.length} notes from the server.`, "success");
    } catch (error) {
        setStatus(`Failed to load notes: ${error.message}`, "error");
    } finally {
        loadBtn.disabled = false;
    }
}

// POST: Create a new note
async function createNote(e) {
    e.preventDefault();
    setStatus("", "loading");

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation
    if (!title) {
        setStatus("Validation Error: Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        setStatus("Validation Error: Title must be 100 characters or fewer.", "error");
        return;
    }

    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");

    try {
        const newNotePayload = { title, body, userId: 1 };
        const { data, status } = await request(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(newNotePayload)
        });

        // JSONPlaceholder returns a mocked object with id: 101
        notesArray.unshift(data);
        renderNotes();
        setStatus(`Note created (status ${status}, id ${data.id}).`, "success");

        // Clear form
        titleInput.value = "";
        bodyInput.value = "";
    } catch (error) {
        setStatus(`Failed to create note: ${error.message}`, "error");
    } finally {
        submitBtn.disabled = false;
    }
}

// DELETE: Remove note
/*
  Note on JSONPlaceholder: 
  JSONPlaceholder simulates successful DELETE requests (returning status 200), 
  but it does not permanently mutate server state. To ensure the UI reflects user actions, 
  we handle this by filtering the note out of our local `notesArray` and re-rendering.
*/
async function deleteNote(id, listItemElement) {
    const deleteButton = listItemElement.querySelector(".delete-btn");
    deleteButton.disabled = true;

    try {
        await request(`${API_URL}/${id}`, { method: "DELETE" });
        notesArray = notesArray.filter(note => note.id !== id);
        renderNotes();
        setStatus(`Note ID ${id} deleted successfully.`, "success");
    } catch (error) {
        setStatus(`Failed to delete note ID ${id}: ${error.message}`, "error");
        deleteButton.disabled = false;
    }
}

// Event Listeners
loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);