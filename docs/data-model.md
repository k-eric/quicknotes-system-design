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