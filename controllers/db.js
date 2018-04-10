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

function getUser(username, callback) {
  const query = 'SELECT * FROM public."user" WHERE username = $1';
  const params = [username];
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      callback(res.rows[0]);
    }
  })
}

module.exports = {'getUser': getUser};