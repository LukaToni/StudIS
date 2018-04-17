
const { Client } = require('pg')

var bcrypt = require('bcrypt');
const saltRounds = 10;

const client = new Client({
  user: 'tpo-studis',
  host: 'poljch.home.kg',
  database: 'tpo_studis_db',
  password: 'viljanmahnic',
  port: 30307,
})
client.connect();

var facultyNumber;
client.query('SELECT * FROM public."faculty" WHERE title = \'FRI\'', (err, res) => {
  if (err) {
    console.log(err.stack);
  }
  facultyNumber = res.rows[0].number;
});

function getUser(user, callback) {
  var query = 'SELECT * FROM public."user" WHERE ';
  var params = [];
  
  var paramCount = 0;
  
  if(user.id) {
    paramCount++;
    query = query + 'id = $' + paramCount;
    params.push(user.id);
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
      callback(err);
    } else {
      callback(null, res.rows[0]);
    }
  })
}

function getStudent(student, callback) {
  var query = 'SELECT * FROM public."student" WHERE ';
  var params = [];
  
  var paramCount = 0;
  
  if(student.name) {
    paramCount++;
    query = query + 'name = $' + paramCount;
    params.push(student.name);
  }
  if(student.lastName) {
    paramCount++;
    query = query + 'surname = $' + paramCount;
    params.push(student.lastName);
  }
  if(student.email) {
    paramCount++;
    query = query + 'email = $' + paramCount;
    params.push(student.email);
  }
  if(student.registrationNumber) {
    paramCount++;
    query = query + 'registration_number = $' + paramCount;
    params.push(student.registrationNumber);
  }
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
      callback(err);
    } else {
      callback(null, res.rows[0]);
    }
  })
}

function updateUser(user, callback) {
  const query = 'UPDATE public."user" SET (password, email, reset_token) = ($1, $2, $3) WHERE id = $4';
  const params = [user.password, user.email, user.resetToken, user.id];

  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
      callback(err);
    } else {
      callback(null);
    }
  })
}

module.exports = {
  'updateUser': updateUser,
  'getUser': getUser,
  'studentImport': studentImport
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

function studentImport(students, callback) {
  const beginQuery = 'BEGIN';
  const commitQuery = 'COMMIT';
  const rollbackQuery = 'ROLLBACK';
  
  client.query(beginQuery, (err1) => {
    if(err1) {
      return callback(err1);
    }
        
    doImport(students, 0, (err2) => {
      if(err2) {
        client.query(rollbackQuery, () => {
          return callback(err2);
        })
      }
      client.query(commitQuery, () => {
        return callback(null, students);
      });
    });
  });
}

function doImport(students, index, endCallback) {
  if(index >= students.length) {
    return endCallback(null);
  }
    
  var student = students[index];
  
  getStudent(student, (getStudentErr, foundStudent) => {
    if(getStudentErr) {
      return endCallback(getStudentErr);
    }
    if(foundStudent) {
      //TODO update student :)
      return endCallback();
    }
  
    client.query("SELECT nextval('public.registration_number_seq')", (err, res) => {
      if(err) {
        return endCallback(err);
      }
      var nextNumber = res.rows[0].nextval + '';
      while(nextNumber.length < 4) {
        nextNumber = '0' + nextNumber;
      }
      
      var registrationNumber = '' + facultyNumber + currentYear() + nextNumber;
      console.log(registrationNumber);
      
      const insertStudentQuery = 'INSERT INTO public."student"(name, surname, email, registration_number) VALUES ($1, $2, $3, $4)';
      var params = [student.name, student.lastName, student.email, registrationNumber];

      client.query(insertStudentQuery, params, (err) => {
        if(err) {
          return endCallback(err);
        }
        
        students[index].registrationNumber = registrationNumber;
        
        insertUserQuery = 'INSERT INTO public."user"(password, type, email, student_id) VALUES ($1, $2, $3, $4)';
        params = [bcrypt.hashSync('student', saltRounds), 'student', student.email, registrationNumber];
        
        client.query(insertUserQuery, params, (err) => {
          if(err) {
            return endCallback(err);
          }
          
          return doImport(students, index + 1, endCallback);
        });
      });
    });
  }};
}

function currentYear() {
  return new Date().getFullYear().toString().substr(-2);
}