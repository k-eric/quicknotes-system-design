# QuickNotes Data Model

## Entities & Schema

### 1. `users`
Stores registered account details.
- `id` (INT, PK, Auto-increment)
- `username` (VARCHAR(50), NOT NULL, UNIQUE)
- `email` (VARCHAR(100), NOT NULL, UNIQUE)
- `created_at` (TIMESTAMP, NOT NULL)

### 2. `notes`
Stores note content created by users.
- `id` (INT, PK, Auto-increment)
- `user_id` (INT, FK referencing `users(id)`, NOT NULL)
- `title` (VARCHAR(100), NOT NULL)
- `body` (TEXT)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

### 3. `tags`
Stores category labels for organizing notes.
- `id` (INT, PK, Auto-increment)
- `name` (VARCHAR(30), NOT NULL, UNIQUE)

### 4. `note_tags` (Junction Table)
Binds notes and tags in a many-to-many relationship.
- `note_id` (INT, FK referencing `notes(id)`, NOT NULL)
- `tag_id` (INT, FK referencing `tags(id)`, NOT NULL)
- PRIMARY KEY (`note_id`, `tag_id`)

---

## Relationships Explanation
- Users to Notes (One-to-Many): One user can create many notes, but each note belongs to exactly one user (`user_id` foreign key on `notes`).
- Notes to Tags (Many-to-Many): A single note can possess multiple tags, and a single tag can be applied to multiple notes. Because relational databases cannot represent many-to-many relationships natively, the `note_tags` junction table bridges `notes` and `tags`.

---

## SQL DDL (`CREATE TABLE` Statements)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

Example SQL Queries
1. JOIN Query: Get all notes with their associated tags for a specific user
SQL
SELECT n.id, n.title, n.body, t.name AS tag_name
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.user_id = 104
ORDER BY n.created_at DESC;
2. Aggregation Query: Count notes per user
SQL
u.username, COUNT(n.id) AS total_notes
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.username;
3. Filter Query: Find notes created within the last 7 days
SQL
SELECT  FROM notes
WHERE user_id = 104 
  AND created_at >= NOW() - INTERVAL 7 DAY;
Indexing Strategy
Index: CREATE INDEX idx_notes_user_id ON notes(user_id);

Reason: Every time a user loads their feed or queries their notes, the database filters by user_id. Indexing this foreign key column prevents full table scans and drastically reduces query execution latency.

Database Choice Justification
A relational SQL database (e.g., PostgreSQL or MySQL) is chosen for QuickNotes because the core entities (users, notes, tags) maintain strict, well-defined relational schemas with foreign key constraints. Relational integrity guarantees that if a user account is deleted, their associated notes are cleanly purged via cascade rules, and ACID compliance ensures data reliability for user creations and updates.