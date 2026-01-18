const db = require('./db');
const fs = require('fs');
const { format } = require('fast-csv');

async function exportToCSV(filePath) { 
    const { rows } = await db.query('SELECT * FROM books');
    const writableStream = fs.createWriteStream(filePath); 

    const csvStream = format({ headers: true }); 
    csvStream.pipe(writableStream);

    rows.forEach(row => csvStream.write(row));
    csvStream.end();

    return new Promise((resolve) => writableStream.on('finish', resolve));
}

async function updateBook(id, updates) {
    const { title, author, genre, status } = updates;
    const sql = `
        UPDATE books 
        SET title = COALESCE($1, title), 
            author = COALESCE($2, author), 
            genre = COALESCE($3, genre), 
            status = COALESCE($4, status)
        WHERE id = $5 RETURNING *`;
    const { rows } = await db.query(sql, [title, author, genre, status, id]);
    return rows[0];
}

const libraryService = {
    addBook: async function(title, author, genre, status) {
        const sql = 'INSERT INTO books (title, author, genre, status) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await db.query(sql, [title, author, genre, status]);
        return rows[0];
    },
    
    async listBooks(filters = {}) {
        let sql = 'SELECT * FROM books';
        const params = [];
        const conditions = [];
    
    
        if (filters.genre) {
            params.push(filters.genre);
            conditions.push(`genre = $${params.length}`);
        }
    
        if (filters.status) {
            params.push(filters.status);
            conditions.push(`status = $${params.length}`);
        }
    

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
    
        sql += ' ORDER BY id ASC';
        
        const { rows } = await db.query(sql, params);
        return rows;
    },

    deleteBook: async function(id) { 
        const { rowCount } = await db.query('DELETE FROM books WHERE id = $1', [id]);
        return rowCount > 0;
    },

    updateBook,
    exportToCSV
};

module.exports = libraryService;