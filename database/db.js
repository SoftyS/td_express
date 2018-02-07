const DB_NAME = 'tests-express-sqlite';
const Sqlite = require('sqlite3').verbose();

/* Changes on the db method, I manage tables with
** console so this file is just use to open the database.
 */

let DB = new Sqlite.Database( DB_NAME, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('connected to the SQlite database');
});

module.exports = DB;
