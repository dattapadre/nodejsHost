const mysql = require('mysql');
const util = require("util");

const conn = mysql.createConnection({
    host:"bna8pzjvte4mwfwdfszn-mysql.services.clever-cloud.com",
    user:"ubquzozjihafztvr",
    password:"yQZRT9IesjxLIZyIrmDp",
    database:"bna8pzjvte4mwfwdfszn"
})

const exe = util.promisify(conn.query).bind(conn);

module.exports = exe;

