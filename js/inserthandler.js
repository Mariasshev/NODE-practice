const mssql = require('mssql');
const connection = require('./config'); 

exports.loadAddPage = (req, res) => {
    //res.render('add-book'); 
    res.render('add-book', { currentPath: req.path}); 
};

exports.addRow = (req, res) => {
    const { user, name, state } = req.body;

    if (!user || !name || !state) {
        console.error('All fields are required.');
        //return res.status(400).json({ error: 'All fields are required' });
    }

    const request = new mssql.Request(connection);
    request.input('user', mssql.VarChar, user);
    request.input('name', mssql.VarChar, name);
    request.input('state', mssql.VarChar, state);

    const query = `INSERT INTO Books (name, state, user_is, created_at, updated_at) 
                   VALUES (@name, @state, @user, GETDATE(), GETDATE())`;

    request.query(query, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error inserting data');
        }

        console.log('Book added successfully:', result);
        //res.json({ success: true, message: 'Book added successfully!' });
        res.redirect('/books');
    });
};
