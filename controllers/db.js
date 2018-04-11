const { Client } = require('pg')

const client = new Client({
  user: 'tpo-studis',
  host: 'poljch.home.kg',
  database: 'tpo_studis_db',
  password: 'viljanmahnic',
  port: 30307,
})
client.connect()

function getUser(user, callback) {
  var query = 'SELECT * FROM public."user" WHERE ';
  var params = [];
  
  var paramCount = 0;
  
  if(user.id) {
    paramCount++;
    query = query + 'id = $' + paramCount;
    params.push(user.registrationNumber);
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
  const query = 'UPDATE public."user" SET (password, email, reset_token) = ($1, $2, $3) WHERE id = $4';
  const params = [user.password, user.email, user.resetToken, user.registrationNumber];

  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      callback();
    }
  })
}

module.exports = {
  'updateUser': updateUser,
  'getUser': getUser
};