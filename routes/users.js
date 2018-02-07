'use strict';
const Express = require('express');
const router = Express.Router();


const DB = require('../database/db.js');

const Bcrypt = require('bcrypt-nodejs');

//Passport:
const Passport = require('passport')
    ,BasicStrategy = require('passport-http').BasicStrategy;

Passport.use(new BasicStrategy((username, password,  done) => {

    DB.get('SELECT * FROM USERS WHERE NAME = ?' ,[username], (err, user) => {

        if (err) {
            console.error(err.message);
            return done(err);
        }
        if (!user) {
            console.log('Bad username')
            return done(null, false, { message: 'Incorrect username' });
        }
        if (!Bcrypt.compareSync(password, user.PASSWORD)) {
            console.log('Bad password');
            return done(null, false, {message:'Incorrect password'});
        }
        return done(null, user);
    });
}));

//List of users : ADMIN ONLY
router.get('/'
    , Passport.authenticate('basic', {session: false})
    , (req, res) => {

        if(req.user){
            if(req.user.ROLE !== 'ROLE_ADMIN'){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }
        console.log('GET list of users');
        const sql = 'SELECT * FROM USERS';
        DB.all(sql, (err, data) => {
            if (err) {
                return console.error(err.message);
            }
            res.status(200);
            return res.json(data);
        });
})

//A user : ADMIN OR ASKED ID USER
router.get('/:id'
    , Passport.authenticate('basic', {session: false})
    ,(req, res) => {

        if(req.user){

            if( (req.user.ID.toString() !== req.params.id) && (req.user.ROLE !== 'ROLE_ADMIN') ){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }
        console.log('GET user with id: ' + req.params.id);
        const sql = 'SELECT * FROM USERS WHERE ID = ?';
        DB.all(sql, [req.params.id], (err, data) => {
            if (err) {
                return console.error(err.message);
            }
            res.status(200);
            return res.json(data);
        });
})

//Insert a user: EVERYBODY
router.post('/'
    ,(req,res) => {
    //TODO: validation celebrate

        console.log('INSERT new USER ' + req.body.name);
        //Hash of the plain password:
        let plainPassword = req.body.password;
        Bcrypt.hash(plainPassword,null,null, (err,hash) => {
            if(err){
                console.error(err.message);
            }
            const sql = 'INSERT INTO USERS (NAME, ROLE, PASSWORD) VALUES (?,"ROLE_USER",?)';
            DB.run(sql, [req.body.name, hash], (err) => {

                if (err) {
                    return console.error(err.message);
                }
                res.status(201);
                res.end('Insertion success');
            });
        })
});

module.exports.router = router;