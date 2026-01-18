#!/usr/bin/env node
require('dotenv').config();

const LibraryService = require('./libraryService');
const { openFile } = require('./utils/system');
const readline = require('node:readline/promises');
const os = require('os');
const EventEmitter = require('events');
const { stdin: input, stdout: output } = require('node:process');

class LibraryLogger extends EventEmitter {}
const logger = new LibraryLogger();

logger.on('action', (message) => {
  const timestamp = new Date().toLocaleString();
  const user = os.userInfo().username;
  const platform = os.platform();
  console.log(`\x1b[32m[${timestamp}]\x1b[0m \x1b[34m[User: ${user}]\x1b[0m \x1b[35m[OS: ${platform}]\x1b[0m ${message}`);
});

const aliases = {
  ls: 'list',
  rm: 'delete',
  exp: 'export',
  add: 'add',
  update: 'update',
  init: 'init'
};

async function main() {
  const [,, rawCommand, ...args] = process.argv;
  const command = aliases[rawCommand] ?? rawCommand;

  const rl = readline.createInterface({ input, output });

  try {
    if (LibraryService.db && LibraryService.db.initDB) {
      await LibraryService.db.initDB();
    }

    if (!command) {
      console.log(' Library CLI Usage: node library.js [add|list|update|delete|export|init]');
      return;
    }

    switch (command) {

      case 'init': {
        if (LibraryService.initLibrary) {
          const msg = await LibraryService.initLibrary();
          logger.emit('action', msg);
        }
        break;
      }

      case 'add': {
        const [title, author, genre, status] = args;
        const errors = [];
        if (!title) errors.push('Title is missing');
        if (!author) errors.push('Author is missing');
        if (status && !['read', 'to-read', 'reading'].includes(status.toLowerCase())) {
          errors.push('Invalid status. Use: read, to-read, reading');
        }
        if (errors.length > 0) {
          console.error(' Input Validation Failed:');
          errors.forEach(e => console.error(`   - ${e}`));
          break;
        }

        const newBook = await LibraryService.addBook(title, author, genre, status);
        logger.emit('action', `SUCCESS: Added "${newBook.title}" (ID: ${newBook.id})`);
        break;
      }

      case 'list': {
        const filters = {};
        args.forEach(arg => {
          if (arg.startsWith('genre=')) filters.genre = arg.split('=')[1];
          if (arg.startsWith('status=')) filters.status = arg.split('=')[1];
        });

        const books = await LibraryService.listBooks(filters);
        logger.emit('action', `QUERY: Listed books (Count: ${books.length})`);
        books.length === 0
          ? console.log(' Your library is empty. Add a book with `library add "Title" "Author"`')
          : console.table(books);
        break;
      }

      case 'update': {
        const [id, status] = args;
        if (!id || !status) {
          console.error('Usage: update <id> <status>');
          break;
        }

        const updated = await LibraryService.updateBook(id, { status });
        updated
          ? logger.emit('action', `UPDATE: Book ${id} updated to "${updated.status}"`)
          : console.log(' Book not found.');
        break;
      }

      case 'delete': {
        const id = args[0];
        if (!id) { console.error('Error: ID required'); break; }

        const answer = await rl.question(`Delete book ID ${id}? (y/n): `);
        if (['y','yes'].includes(answer.toLowerCase())) {
          const success = await LibraryService.deleteBook(id);
          success ? logger.emit('action', `DELETE: Removed Book ID ${id}`) : console.log('Book not found.');
        } else {
          console.log(' Deletion cancelled.');
        }
        break;
      }

      case 'export': {
        const fileName = `library_export_${Date.now()}.csv`;
        logger.emit('action', `EXPORT: Exporting to ${fileName}`);
        await LibraryService.exportToCSV(fileName);
        openFile(fileName);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
    }

  } catch (err) {
    console.error(' System Error:', err.message);
  } finally {
    rl.close();
    if (LibraryService.db && LibraryService.db.end) await LibraryService.db.end();
  }
}

process.on('SIGINT', () => {
  console.log('\n Closing Library...');
  process.exit(0);
});

main();
