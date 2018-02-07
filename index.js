'use strict';
const Express = require('express');
const BP = require('body-parser');

const app = Express();

//Body Parser:
app.use(BP.json());

//Routes of posts:
app.use('/posts', require('./routes/posts').router);
//Routes of users:
app.use('/users',require('./routes/users').router);
//Routes of bottles:
app.use('/bottles',require('./routes/bottles').router);

//Server:
app.listen(8080, (err) => {

    if (err) {
        return console.error(err.message);
    }
    console.log('app listening on port 8080');
});

