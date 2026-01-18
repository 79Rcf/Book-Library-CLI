`README.md`. **"System Awareness"** features built (OS logging, EventEmitters) and the **Automated Testing** section to ensure it reflects the full "professional-grade" scope of your tool.

---

# Book Library CLI

A professional-grade Command Line Interface (CLI) tool for managing a personal library, built with **Node.js** and **PostgreSQL**. This project focuses on modular architecture, data integrity, and deep system-level integration.

##  Architecture & Design Decisions

This project utilizes a **Layered Architecture** to ensure the code is maintainable, scalable, and easy to test.

### 1. Separation of Concerns

* **CLI Layer (`library.js`)**: Orchestrates user interaction, command parsing, and terminal output. It uses a custom `EventEmitter` for system logging.
* **Service Layer (`libraryService.js`)**: Houses the core business logic. It remains "database agnostic," focusing on data transformation and logic flow.
* **Data Access Layer (`db.js`)**: Manages the PostgreSQL connection pool and features a self-healing `initDB` routine to manage the database schema automatically.

### 2. High-Performance Data Handling

* **Streaming Exports**: Utilizes Node.js **Streams** and `fast-csv` to pipe data directly from PostgreSQL to the filesystem, preventing memory overflow on large datasets.
* **Connection Pooling**: Uses `pg.Pool` to manage persistent connections, reducing latency and resource consumption.

### 3. System Integration

* **Event-Driven Logging**: Uses the `events` and `os` modules to generate logs stamped with system metadata (Username and Platform).
* **Cross-Platform Automation**: The `utils/system.js` module utilizes `child_process.spawn` with `detached: true` to launch exported files in the system's default viewer (Excel, Numbers, etc.) without blocking the CLI.

---

## Features

* **Full CRUD**: Add, List, Update, and Delete books with interactive confirmation "speed bumps."
* **Data Safety**: 100% Parameterized SQL queries to prevent **SQL Injection**.
* **Idempotent Setup**: Automatic database table creation on first run.
* **User Aliases**: Shorthand commands (`ls`, `rm`, `exp`) for power users.

---

##  Getting Started

### Prerequisites

* Node.js (v22+)
* PostgreSQL instance

### Installation

1. **Clone & Install**:
```bash
git clone https://github.com/yourusername/book-library-cli.git
cd book-library-cli
npm install

```


2. **Environment Setup**: Create a `.env` file in the root:
```env
DATABASE_URL=postgres://user:password@localhost:5432/library_db

```


3. **Global Link (Optional)**:
```bash
npm link

```



---

##  Usage

### Standard Commands

```bash
# Add a book
node src/library.js add "The Pragmatic Programmer" "Andy Hunt" "Programming" "read"

# List with filters
node src/library.js list genre=Programming status=read

# Update status by ID
node src/library.js update 1 "reading"

# Export and auto-open
node src/library.js export

```

### Automation (npm scripts)

```bash
# Using npm start
npm start -- add "Deep Work" "Cal Newport" "Productivity" "to-read"

# Quick list
npm run list

```

---

## Testing & Verification

We use **Jest** for unit testing, employing module mocking to isolate service logic from the physical database.

### Running Tests

```bash
npm test

```

### Manual Verification Suite

| Test Case | Command | Expected Result |
| --- | --- | --- |
| **Validation** | `node src/library.js add "Title"` | Error: Author is missing. |
| **Interactivity** | `node src/library.js rm 1` | Prompt: "Are you sure?" |
| **OS Awareness** | `node src/library.js ls` | Log: `[User: yourname] [OS: darwin]` |
| **Export** | `node src/library.js exp` | CSV opens in default system app. |

---