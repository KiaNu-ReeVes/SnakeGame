const express = require('express');
var flash = require('connect-flash');
var session = require('express-session');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
connection.connect((err) => {
  if (err) {
    console.error(err)
  } else {
    console.log('Database Connected')
  }
})
module.exports = class Application {
    constructor() {
        this.websiteConfig();
        this.folderConfig();
        this.serverListen();
    }
    websiteConfig() {
      app.use(express.static(__dirname + '/public'))
      app.set('view engine', 'ejs');
      app.set('views', path.join(__dirname, 'resources/views'))
      app.use(bodyParser.urlencoded({ extended: true }))
      app.use(bodyParser.json())
      app.set('trust proxy', 1)
      app.use(cookieParser('87H49CBh0E'))
      app.use(session({
        secret: 'MV53wZjBYD2',
        resave: true,
        saveUninitialized: true,
        cookie: { secure: true, maxAge: 1000 * 60 * 60 * 24 * 8 }
      }))
      app.use(flash());

      app.get('/', function(req, res) {
        return res.render('login')
      });

      app.get('/play', function(req, res) {
        const cookie = req.cookies
        try {
          const userid = jwt.verify(cookie.userid, 'secrettoken23')
          console.log(userid)
          const userInfo = userid.userid
          connection.query('SELECT * FROM users WHERE username = ?', [userInfo.username], function(err, response){
            if (!response[0]) {return res.redirect('/')}
              if (response[0].password === userInfo.password) {
                  return res.render('index')
              } else {
                  return res.redirect('/')
              }
          });
        } catch(err) {
          return res.redirect('/')
        }
        // return res.render('login')
      });
    
      app.get('/leaderboard', function(req, res) {
        connection.query('SELECT * FROM users ORDER By high_score DESC', function(err, response){
          return res.render('leaderboard', {scores: response})
        })
      });
    }
    folderConfig() {
      app.use(require('./router/api/index'));
    }
    serverListen() {

        app.listen(process.env.WEBSITE_PORT, (err) => {
            if(err) console.log(err)
            console.log(`WebSite Loaded\nPort : ${process.env.WEBSITE_PORT}`)
        })
    }
}