// 운영 서버
// host 공인 (외부 접속)   : '54.180.66.48',
// host 로컬 (운영시 내부 접속)   : '172.31.12.29',
mysqlConfig = {
    connectionLimit : 100, 
    host     : '54.180.66.48',
    user     : 'moadev',
    password : 'Ectus!2#',
    port     : 3306,
    database : 'moa_platform',
    charset  : 'utf8'
};

// mySQL pool
let mysql = require('mysql2/promise');
let mysqlPool = mysql.createPool(mysqlConfig);

exports.mysqlPool = mysqlPool;
