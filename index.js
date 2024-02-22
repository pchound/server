const express = require("express")
const app = express();
const mysql = require('mysql')
const cors = require("cors")

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET, POST"],
  credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

  app.use(session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitalized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

const db = mysql.createPool({
  host: 'sql3.freemysqlhosting.net', // Use localhost or 127.0.0.1 as the hostname
  port: '3306',      // Specify the port number
  user: 'sql3686184',
  password: 'ayUJQ1lLDe',
  database: 'sql3686184',
});


app.post('/register', (req, res)=>{
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash)=>{

    if (err){
      console.log(err)
    }

    db.query(
      "INSERT INTO users (username, password) VALUES (?,?)",
      [username, hash],
      (err, result) =>{
        console.log(err);
      }
    );
  })
});




app.get("/login", (req, res)=>{
  if (req.session.user){
    res.send({loggedIn: true, user: req.session.user})
  }else{
    res.send({loggedIn : false});
  }
})

app.post('/login', (req, res) =>{
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE username = ?;",
  username,
   (err, result) => {
    if (err){
      res.send({err: err});
    } 
  
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response)=>{
        if (response){
          req.session.user = result;
          console.log(req.session.user);
          res.send(result);
        }else{
          res.send({message: "Wrong username/password combination!"});
        }
      });
    } else{
      res.send({message: "User doesn't exist"});
    }
  }
);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
