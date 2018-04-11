const { Client } = require('pg')

const client = new Client({
  user: 'tpo-studis',
  host: 'poljch.home.kg',
  database: 'tpo_studis_db',
  password: 'viljanmahnic',
  port: 30307,
})
client.connect()

function getStudent(student, callback) {
  var query = 'SELECT * FROM public."student" WHERE ';
  var params = [];
  
  var paramCount = 0;
  
  if(student.registrationNumber) {
    paramCount++;
    query = query + 'registration_number = $' + paramCount;
    params.push(student.registrationNumber);
  }
  if(student.email) {
    paramCount++;
    query = query + 'email = $' + paramCount;
    params.push(student.email);
  }
  if(student.resetToken) {
    paramCount++;
    query = query + 'reset_token = $' + paramCount;
    params.push(student.resetToken);
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

function updateStudent(student, callback) {
  const query = 'UPDATE public."student" SET password, email, registration_number) = ($1, $2, $3) WHERE id = $4';
  const params = [student.password, student.email, student.resetToken, student.registrationNumber];

  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      callback();
    }
  })
}

module.exports = {
  'updateStudent': updateStudent,
  'getStudent': getStudent
};