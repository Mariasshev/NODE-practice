var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var mssql = require('mssql');
var port = 8080;

var connection = require('./js/config');

var jsonParser = bodyParser.json();
app.use(jsonParser);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// node_modules для Bootstrap и других пакетов
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use(express.static(path.join(__dirname, 'html')));  

// Middleware для парсинга тела запроса
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); // Для JSON-данных

var insertHandler = require('./js/inserthandler'); 
var editHandler = require('./js/edithandler'); 
var deleteHandler = require('./js/deletehandler'); 

app.get('/auth', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'html', 'auth.html'));
});

var loginUsr = '';
app.post('/auth', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    loginUsr = login;
    if (!login || !password) {
       return res.status(400).json({ error: 'You need to sign in to continue' });
    }

    console.log('Login Attempt:', { login, password });

    const request = new mssql.Request(connection);
    request.input('login', mssql.VarChar, login);  
    request.input('password', mssql.VarChar, password);

    request.query('SELECT * FROM Admins WHERE login=@login AND password=@password', (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса:', err);
            return res.status(500).send('Произошла ошибка при получении данных');
        }

        if (result.recordset.length === 1) {
            //req.session.username = login; 
            console.log("Login succeeded: ", login);
            return res.redirect('/admin');
            // return res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + login);
        } else {
            console.log("Login failed: ", login);

           return  res.status(401).json({ error: 'Invalid Email or password' });
        }
    });
});

app.get('/admin', (req, res, next) => {
    //console.log('Attempting to access /admin');
    res.render('admin', { loginUsr });
    //res.render('admin');
   // res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});

function formatDate(dateString) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', options).replace(',', '');
}

app.get('/books', (req, res) => {
    var request = new mssql.Request(connection);
    request.query('SELECT * FROM Books', (err, result) => {
        if (err) {
            console.error('Ошибка выполнения запроса:', err);
            return res.status(500).send('Ошибка выполнения запроса');
        }

        const booksWithFormattedDates = result.recordset.map(book => {
            return {
                ...book,
                created_at: formatDate(book.created_at),
                updated_at: formatDate(book.updated_at)
            };
        });

        res.render('books', { currentPath: req.path, books: booksWithFormattedDates });
        //res.render('books', { books: booksWithFormattedDates });
    });
});


// Routes for adding books
app.get('/books/add-new', insertHandler.loadAddPage); 
app.post('/books/add-new', insertHandler.addRow);   

app.get('/books/edit/:id', editHandler.loadEditPage); 
app.post('/books/edit', editHandler.editRow);   

// app.get('/books/delete/:id', deleteHandler.loadDelPage);
app.delete('/books/delete/:id', deleteHandler.deleteRow);
//app.post('/books/edit', deleteHandler.deleteRow);   

app.listen(port, function () {
    console.log('app running on port ' + port); 
})