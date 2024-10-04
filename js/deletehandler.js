const mssql = require('mssql');
const connection = require('./config'); 

exports.deleteRow = (req, res) => {
    const bookId = req.params.id;
    
    console.log('Attempting to delete book with ID:', bookId); // Добавляем лог для отслеживания

    const request = new mssql.Request(connection);

    request.input('id', mssql.Int, bookId);

    // Проверка существования книги
    request.query('SELECT * FROM Books WHERE id = @id', (err, result) => {
        if (err) {
            console.error('Error checking book existence:', err);
            return res.status(500).send('Error checking book existence');
        }

        if (result.recordset.length === 0) {
            return res.status(404).send('Book not found');
        }

        // Если книга найдена, удаляем её
        const query = 'DELETE FROM Books WHERE id = @id';

        request.query(query, (err, result) => {
            if (err) {
                console.error('Error deleting book:', err);
                return res.status(500).send('Error deleting book');
            }
        
            console.log('Book deleted successfully:', result.rowsAffected);
            res.json({ success: true, message: 'Book deleted successfully!' });
        });
        
    });
};
