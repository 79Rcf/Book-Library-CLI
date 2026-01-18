const LibraryService = require('../src/libraryService');
const db = require('../src/db');

jest.mock('../src/db');

describe('LibraryService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addBook returns newly created book', async () => {
    const mockBook = { id: 1, title: 'Deep Work', author: 'Cal Newport', genre: 'Productivity', status: 'to-read' };
    db.query.mockResolvedValue({ rows: [mockBook] });

    const result = await LibraryService.addBook('Deep Work', 'Cal Newport', 'Productivity', 'to-read');

    expect(result).toEqual(mockBook);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO books'),
      ['Deep Work', 'Cal Newport', 'Productivity', 'to-read']
    );
  });

  test('listBooks applies genre filter', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await LibraryService.listBooks({ genre: 'Classic' });

    const calledQuery = db.query.mock.calls[0][0];
    const calledParams = db.query.mock.calls[0][1];

    expect(calledQuery).toContain('WHERE genre = $1');
    expect(calledParams).toEqual(['Classic']);
  });

  test('updateBook returns updated book', async () => {
    const mockUpdated = { id: 1, title: 'Deep Work', author: 'Cal Newport', genre: 'Productivity', status: 'read' };
    db.query.mockResolvedValue({ rows: [mockUpdated] });

    const result = await LibraryService.updateBook(1, { status: 'read' });

    expect(result.status).toBe('read');
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('deleteBook returns true if a book is deleted', async () => {
    db.query.mockResolvedValue({ rowCount: 1 });

    const result = await LibraryService.deleteBook(1);

    expect(result).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM books'),
      [1]
    );
  });

  test('deleteBook returns false if book not found', async () => {
    db.query.mockResolvedValue({ rowCount: 0 });

    const result = await LibraryService.deleteBook(999);

    expect(result).toBe(false);
  });
});
