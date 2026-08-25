// 운영 서버
// host 공인 (외부 접속)   : '54.180.66.48',
// host 로컬 (운영시 내부 접속)   : '172.31.12.29',
mysqlConfig = {
    connectionLimit : 100, 
    // host     : '52.78.131.107',
    // user: "ktrcs",
    // password: "ktrcs",
    // port     : 3306,
    // database : 'complexm',
    // charset  : 'utf8'
    host     : '127.0.0.1',
    user: "root",
    password: "iota2k!@#$",
    port     : 3306,
    database : 'complexm',
    charset  : 'utf8'
};

// mySQL pool
let mysql = require('mysql2/promise');
let mysqlPool = mysql.createPool(mysqlConfig);

exports.mysqlPool = mysqlPool;
