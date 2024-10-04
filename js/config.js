var mssql = require('mssql');

// Параметры соединения с бд
var config = {
    user: 'Maria',                      // пользователь базы данных
    password: '12345',                  // пароль пользователя
    server: 'LAPTOP-RPD6D51R\\SQLEXPRESS01',          // хост
    database: 'Bookery',                // имя бд
    port: 1433,                         // порт, на котором запущен sql server
    options: {
        encrypt: true,                  // Использование SSL/TLS
        trustServerCertificate: true    // Отключение проверки самоподписанного сертификата
    },
}

// Connection
var connection = new mssql.ConnectionPool(config);

var pool = connection.connect(function(err) {
    if (err) console.log(err)
});

module.exports = pool;