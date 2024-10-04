const mssql = require('mssql');
const connection = require('./config'); 

// Загрузка страницы редактирования книги
exports.loadEditPage = (req, res) => {
    const bookId = req.params.id; 
    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, bookId);

    // Запрос для получения данных книги
    request.query('SELECT * FROM Books WHERE id = @id', (err, result) => {
        if (err) {
            console.error('Error retrieving book data:', err);
            return res.status(500).send('Error retrieving book data');
        }

        if (result.recordset.length === 0) {
            return res.status(404).send('Book not found'); 
        }

        const book = result.recordset[0]; 
        res.render('edit-book', { currentPath: req.path, book});
    });
};

// Обновление записи книги
exports.editRow = (req, res) => {
    const { id, user, name, state } = req.body; 

    if (!id || !user || !name || !state) {
        console.error('All fields are required.');
        return res.status(400).json({ error: 'All fields are required' });
    }

    const request = new mssql.Request(connection);
    request.input('id', mssql.Int, id);
    request.input('user', mssql.VarChar, user);
    request.input('name', mssql.VarChar, name);
    request.input('state', mssql.VarChar, state);

    const query = `
    UPDATE Books 
    SET name = @name, state = @state, user_is = @user, updated_at = GETDATE() 
    WHERE id = @id`;

    request.query(query, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).send('Error updating data');
        }

        console.log('Book updated successfully:', result);
        res.redirect('/books'); 
    });
};
