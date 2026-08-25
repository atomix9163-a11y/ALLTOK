// 로컬 서버
mysqlConfig = {
    connectionLimit : 100, 
    host     : '127.0.0.1',
    user: "root",
    password: "nadolotte1",
    port     : 3306,
    database : 'complexm',
    charset  : 'utf8'
};

// 슈켓 서버. 외부에서 접속할 때는 공인 IP를 이용
mysqlConfig_shuket = {
    connectionLimit: 100,
    // host     : '172.31.12.29',
    host: "54.180.66.48",
    user: "moadev",
    password: "Ectus!2#",
    port: 3306,
    database: "moa_platform",
    charset: "utf8",
};

// mySQL pool
let mysql = require('mysql2/promise');
let mysqlPool = mysql.createPool(mysqlConfig);

var mysqlPool_shuket = mysql.createPool(mysqlConfig_shuket);
exports.mysqlPool_shuket = mysqlPool_shuket;

exports.mysqlPool = mysqlPool;
