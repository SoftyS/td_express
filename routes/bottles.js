'use strict';
const Express = require('express');
const { celebrate, Joi, errors } = require('celebrate');

const DB = require('../database/db.js');

const router = Express.Router();

const Bcrypt = require('bcrypt-nodejs');

//Passeport
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

//Routes:

//Get all bottles : No Auth
router.get('/'
    , (req, res) => {

        console.log('GET /bottles');
        DB.all('SELECT * FROM BOTTLES', (err, data) => {

            if (err) {
                return console.error(err.message);
            }
            return res.json(data);
        });
});

//Get a bottle : No Auth
router.get('/:id'
    , (req, res) => {

        DB.get('SELECT * FROM BOTTLES WHERE ID = ?', [req.params.id], (err, data) => {

            if (err) {
                return console.error(err.message);
            }
            return res.json(data);
        });
});

//Insert a bottle : ADMIN ONLY
router.post('/'
    , celebrate({

        body: Joi.object().keys({
            brand: Joi.string().required(),
            price: Joi.number().min(0).required(),
            volume: Joi.number().integer().min(0).required(),
            quantity: Joi.number().integer().min(0).required()
        })
    })
    , Passport.authenticate('basic', {session: false})
    ,(req, res) => {

        if(req.user){
            if(req.user.ROLE !== 'ROLE_ADMIN'){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }
        console.log('INSERT new bottle ' + req.body.brand);
        const sql = 'INSERT INTO BOTTLES (BRAND, PRICE, VOLUME, QUANTITY) VALUES (?,?,?,?)';
        DB.run(sql, [req.body.brand, req.body.price, req.body.volume, req.body.quantity], (err) => {

            if (err) {
                return console.error(err.message);
            }
            res.status(201);
            res.end('Successfully insert');
        });
    });

//Update the quantity of a bottle : ALL USERS
router.patch('/:id'
    , celebrate({
        body:
            Joi.object().keys({
                quantity: Joi.number().integer().min(0).required()
            })
    })
    , Passport.authenticate('basic', {session: false})
    ,(req, res) => {

        if(req.user){
            if( ( req.user.ROLE !== 'ROLE_ADMIN') && (req.user.ROLE !== 'ROLE_USER') ){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }
        console.log('UPDATE quantity of id:' + req.params.id);
        const sql = 'UPDATE BOTTLES SET QUANTITY=? WHERE ID = ?'
        DB.run(sql, [req.body.quantity, req.params.id], (err) => {

            if (err) {
                return console.error(err.message);
            }
            res.status(200);
            res.end();
        });
});

//Delete a bottle : ADMIN ONLY
router.delete('/:id'
    , Passport.authenticate('basic', {session: false})
    , (req, res) => {

        if(req.user){
            if(req.user.ROLE !== ('ROLE_ADMIN')){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }
        console.log('Delete id: '+req.params.id);
        DB.run('DELETE FROM BOTTLES WHERE ID = ?', [req.params.id], (err) => {

            if (err) {
                return console.error(err.message);
            }
            return res.end();
        });
});


module.exports.router = router;
