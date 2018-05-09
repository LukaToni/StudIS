
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
  var query = 'SELECT * FROM public."user" WHERE';
  var params = [];
  
  var paramCount = 0;
  
  if(user.id) {
    paramCount++;
    query = query + ' id = $' + paramCount;
    params.push(user.id);
  }
  if(user.email) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' email = $' + paramCount;
    params.push(user.email);
  }
  if(user.resetToken) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' reset_token = $' + paramCount;
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
  var query = 'SELECT * FROM public."student" WHERE';
  var params = [];
  
  var paramCount = 0;
  
  if(student.name) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' name = $' + paramCount;
    params.push(student.name);
  }
  if(student.lastName) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' surname = $' + paramCount;
    params.push(student.lastName);
  }
  if(student.email) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' email = $' + paramCount;
    params.push(student.email);
  }
  if(student.registrationNumber) {
    paramCount++;
    if(paramCount > 1) {
      query = query + ' AND';
    }
    query = query + ' registration_number = $' + paramCount;
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

function updateStudent(student, callback) {
  const query = 'UPDATE public."student" SET (name, surname) = ($1, $2) WHERE email = $3';
  const params = [student.name, student.lastName, student.email];
  
  client.query(query, params, (err, res) => {
    if (err) {
      console.log(err.stack);
      callback(err);
    } else {
      callback(null);
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

//RESIDENTALS

//GET POST
module.exports.getPostOffice = function(){
  return new Promise((resolve, reject)=>{
    let query = 'SELECT * FROM public."post_office" ORDER BY name'
    
    client.query(query, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//GET COUNTRY
module.exports.getCountry = function(){
  return new Promise((resolve, reject)=>{
    let query = 'SELECT * FROM public."country" ORDER BY name_slo'
    
    client.query(query, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//GET COUNTY
module.exports.getCounty = function(){
  return new Promise((resolve, reject)=>{
    let query = 'SELECT * FROM public."county" ORDER BY name'
    
    client.query(query, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//COURSES
//GET (COMPULSORY(obvezni)) COURSES BY YEAR
module.exports.getCoursesByYear = function(year, study_programme){
  return new Promise((resolve, reject)=>{
    let query = `SELECT cou.name as name, cur.study_year as s_year, cur.type as type, cur.key as key, cou.credits as credits, cur.module as module
    FROM public."curriculum" as cur, public."courses" as cou 
    WHERE cur.year=$1 AND cur.study_programme=$2 AND cur.study_year='2018/19' AND cur.course = cou.numberid
    ORDER BY cou.module, cou.name`
    let params= [year, study_programme];

    client.query(query, params, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//GET OPTIONAL COURSES
module.exports.getOptionalCourses = function(){
  return new Promise((resolve, reject)=>{
    let query = `SELECT cou.name as name, cur.study_year as s_year, cur.type as type, cur.key as key, cou.credits as credits, cou.module as module
    FROM public."curriculum" as cur, public."courses" as cou
    WHERE cur.type=2 AND cur.study_year='2018/19' AND cur.course = cou.numberid
    ORDER BY cou.name`

    client.query(query, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}

//UPDATE TOKEN
module.exports.usedToken = function(key){
  return new Promise((resolve, reject)=>{
    let query = `UPDATE public."token"
    SET used = 1
    WHERE key = $1`
    let params = [key];

    client.query(query, params, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//STUDENTS
module.exports.getStudentById = function(id){
  return new Promise((resolve, reject)=>{
    let query = `SELECT *
    FROM public."student" as student, public."token" as token
    WHERE registration_number=$1 AND student.token=token.key`;
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
    let query = 'SELECT * FROM public."student" WHERE registration_number LIKE $1 OR name LIKE $1 OR surname LIKE $1 ORDER BY surname, name LIMIT 10'
    let params = [queryData];

    client.query(query, params, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
module.exports.updateStudentAll = function(student){
  return new Promise((resolve, reject)=>{
    let query = `UPDATE public."student"
    SET (name, surname, emso, birth, telephone_number, country, county, post_office_number, street) = ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    WHERE registration_number = $10`
    let params = [student.name, student.surname, student.emso, student.birth, student.telephone_number, student.country, student.county, 3000, student.street];

    client.query(query,params, (err,res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}

//STUDENT ENROLS
module.exports.getStudentEnrols = function(studentId){
  return new Promise((resolve, reject) =>{
    let query = `SELECT s.year as year, s.study_year as study_year, t.name as s_type, e.name as e_type, sp.name as s_programme 
    FROM public."student_enrols" as s, public."study_type" as t, public."enrol_type" as e, public."study_programme" as sp 
    WHERE s.student_registration_number = $1 AND s.study_type = t.key AND s.enrol_type = e.code AND s.study_programme = sp.evs_code`
    let params =[studentId];

    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//GET COURSES ID
module.exports.getCoursesId = function(id){
  return new Promise((resolve, reject) =>{
    let query = `SELECT * from public.curriculum WHERE key in (`+id.selected+`)`

    client.query(query, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//SAVE ENROL COURSES (predmete ki jih bo poslusal)
module.exports.setEnrolCourses = function(student,data){
  return new Promise((resolve, reject)=>{
    for(var i=0; i<data.length; i++){
      let query = `INSERT INTO public."course_enrol"(student_id,course_id,enrol_year, active) 
      VALUES ($1,$2,$3, $4)`;
      let params = [student.registration_number, data[i].course, 2018, true];
      //console.log(data[i].course);
      client.query(query, params, (err, res)=>{
        if(err) return reject(err);
        return resolve(res.rows);
      })
    }
  })
}
module.exports.setEnrol = function(student,data){
  return new Promise((resolve, reject)=>{
    for(var i=0; i<data.length; i++){
      let query = `INSERT INTO public."listen"(student,course,study_year) 
      VALUES ($1,$2,$3)`;
      let params = [student.registration_number, data[i].course, '2018/19']
      //console.log(data[i].course);
      client.query(query, params, (err, res)=>{
        if(err) return reject(err);
        return resolve(res.rows);
      })
    }
  })
}

//STUDENT IMPORT
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
      students[index].registrationNumber = foundStudent.registration_number;
      updateStudent(student, (err) => {
        if(err) {
          return endCallback(err);
        } else {
          return doImport(students, index + 1, endCallback);
        }
      })
    } else {
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
    }
  });
}

function currentYear() {
  return new Date().getFullYear().toString().substr(-2);
}