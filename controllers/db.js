const { Client } = require('pg')

const client = new Client({
  user: 'tpo-studis',
  host: 'poljch.home.kg',
  database: 'tpo_studis_db',
  password: 'viljanmahnic',
  port: 30307,
})
client.connect()

var users = [
  {
    'id': 1,
    'username': 'user',
	'type': 'student',
    'password': '$2a$10$h6EJCiaOI9Rgfskt/7sO3uubF1uwgj1VwdYTP.A65nHqp2VtS/e/W'
  }
]

function getUserByUsername(username, callback) {
  const query = 'SELECT * FROM public."user" WHERE username = $1';
  const params = [username];
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
      callback();
    } else {
      callback(res.rows[0]);
    }
  })
}

function getUserByEmail(email, callback) {
  const query = 'SELECT * FROM public."user" WHERE email = $1';
  const params = [email];
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack)
      callback();
    } else {
      callback(res.rows[0]);
    }
  })
}

function getUser(user, callback) {
  var query = 'SELECT * FROM public."user" WHERE ';
  var params = [];
  
  var paramCount = 0;
  
  if(user.username) {
    paramCount++;
    query = query + 'username = $' + paramCount;
    params.push(user.username);
  }
  if(user.email) {
    paramCount++;
    query = query + 'email = $' + paramCount;
    params.push(user.email);
  }
  if(user.resetToken) {
    paramCount++;
    query = query + 'reset_token = $' + paramCount;
    params.push(user.resetToken);
  }
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
      callback();
    } else {
      callback(res.rows[0]);
    }
  })
}

function updateUser(user, callback) {
  const query = 'UPDATE public."user" SET (username ,password, type, email, reset_token) = ($1, $2, $3, $4, $5) WHERE id = $6';
  const params = [user.username, user.password, user.type, user.email, user.resetToken, user.id];

  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      callback();
    }
  })
}

module.exports = {
  'getUserByUsername': getUserByUsername,
  'getUserByEmail': getUserByEmail,
  'updateUser': updateUser,
  'getUser': getUser
};