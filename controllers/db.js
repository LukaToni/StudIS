
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
  const params = [user.password, user.email, user.resetToken, user.id];

  
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

//STUDENTS
module.exports.getStudentById = function(id){
  return new Promise((resolve, reject)=>{
    let query = 'SELECT * FROM public."student" WHERE registration_number=$1';
    let params = [id];

    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows[0]);
    })
  })
}
module.exports.findStudent = function(queryData){
  return new Promise((resolve, reject)=>{
    queryData = queryData +'%';
    let query = 'SELECT * FROM public."student" WHERE registration_number LIKE $1 OR name LIKE $1 OR surname LIKE $1'
    let params = [queryData];

    client.query(query, params, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}

//STUDENT ENROLS
module.exports.getStudentEnrols = function(studentId){
  return new Promise((resolve, reject) =>{
    let query = 'SELECT s.year as year, s.study_year as study_year, s.study_programme as s_programme, t.name as s_type, e.name as e_type FROM public."student_enrols" as s, public."study_type" as t, public."enrol_type" as e WHERE s.student_registration_number = $1 AND s.study_type = t.key AND s.enrol_type = e.code' ;
    let params =[studentId];

    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
