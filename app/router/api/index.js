const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
const jwt = require('jsonwebtoken');

router.post('/api/auth/login', function(req, res) {
   connection.query('SELECT * FROM users WHERE username = ?', [req.body.username], function(err, response){
    if (response[0]) {
      if (response[0].password === req.body.password) {
        const table = {
          userid : response[0]
        }
        const token = jwt.sign(table, 'secrettoken23')

        res.cookie('userid', token, {
          maxAge: 1000 * 60 * 60 * 24 * 6,
          httpOnly: true
        })
       return res.json({success: true, message: 'Welcome Back!'})
      } else {
       return res.json({success: false, message: 'Password Is Wrong!'})
      }
    } else {
      connection.query('INSERT INTO users (username, password) VALUES (?,?)', [req.body.username, req.body.password], function(err, ress) {
        const table = {
          userid : { id: ress.insertId, username: req.body.username, password: req.body.password, high_score: null }
        }
        const token = jwt.sign(table, 'secrettoken23')
  
        res.cookie('userid', token, {
          maxAge: 1000 * 60 * 60 * 24 * 6,
          httpOnly: true
        })
        return res.json({success: true, message: 'Hi, Welcome To Snake Game!'})
      })
    }
   });
});

router.post('/api/auth/sethigh', function(req, res) {
  const SendedScore = parseInt(req.body.score)
  const cookie = req.cookies
  try {
    const userid = jwt.verify(cookie.userid, 'secrettoken23')
    const userInfo = userid.userid
    connection.query('SELECT * FROM users WHERE username = ?', [userInfo.username], function(err, response){
        if (response[0].password === userInfo.password) {
          if (SendedScore > parseInt(response[0].high_score)) {
            connection.query(`UPDATE users SET high_score = '${SendedScore}' WHERE username = '${response[0].username}'`)
            return res.json({success: true, message: 'You set a new record'})
          }
        } else {
          return res.json({success: false})
        }
    });
  } catch(err) {
    return res.json({success: false})
  }
});

module.exports = router