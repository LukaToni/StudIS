
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
  'studentImport': studentImport,
  'getCourseEnrols': getCourseEnrols,
  'getCourses' : getCourses,
  'getStudentsWithNoTokens': getStudentsWithNoTokens,
  'getStudentsWithTokens': getStudentsWithTokens,
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
  
  getStudent({email: student.email}, (getStudentErr, foundStudent) => {
  
    if(getStudentErr) {
      return endCallback(getStudentErr);
    }
    if(foundStudent) {
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

function getCourses(userType, professorId) {
  return new Promise((resolve, reject) =>{
    
    if(userType === 'professor') {
      let query = 'SELECT c.name, c.numberid FROM public.courses AS c ' + 
              'INNER JOIN public.course_owner AS co ON c.numberid = co.course_id ' +
              'WHERE co.professor_id = $1';
      let params = [professorId];
      
      client.query(query, params, (err, res) =>{
        if(err) return reject(err);
        return resolve(res.rows);
      })
    }
    if(userType === 'clerk') {
      query = 'SELECT name, numberid FROM public.courses';
      
      client.query(query, (err, res) =>{
        if(err) return reject(err);
        return resolve(res.rows);
      });
    }
  });
}

function getCourseEnrols(courseNumberId) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT c.numberid AS course_id, c."name" as course_name, ce.enrol_year AS course_enrol_year, ' +
                  's.registration_number AS registration_number, s.surname as student_surname, s."name" AS student_name, st."name" AS student_enrol_type ' +
                    'FROM course_enrol ce ' +
                'INNER JOIN courses c ' +
                  'ON ce.course_id = c.numberid ' +
                'INNER JOIN student s ' +
                  'ON s.registration_number = ce.student_id ' +
                'INNER JOIN student_enrols se ' +
                  'ON se.student_registration_number = s.registration_number ' +
                'INNER JOIN study_type st ' +
                  'ON st.key = se.study_type ' +
                'WHERE ce.enrol_year = se.study_year ' +
                  'AND c.numberid = $1 ';
    let params = [courseNumberId];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

function getStudentsWithTokens() {
  return new Promise((resolve, reject) => {
    let query = "SELECT t.key, t.used, t.verified, t.year, t.average," +
                "  p.name as programme_type, p.evs_code as study_programme_key," +
                "  s.emso, s.name, s.surname, s.registration_number," +
                "  e.name as enrol_type," +
                "  st.name as study_type from token t" +
                "  INNER JOIN study_programme p" +
                "  On study_programme = p.evs_code" +
                "  INNER JOIN student s" +
                "  ON student_id = s.registration_number" +
                "  INNER JOIN enrol_type e" +
                "  ON enrol_type = e.code" +
                "  INNER JOIN study_type st" +
                "  ON study_type = st.key";
    let params = [];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

function getStudentsWithNoTokens() {
  return new Promise((resolve, reject) => {
    let query = "  SELECT s.emso, s.name, s.surname, s.registration_number from student s" +
                "  WHERE token IS NULL";
    let params = [];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.getTokenWithId = function(tokenId) {
  return new Promise((resolve, reject) => {
    let query = "SELECT t.key, t.used, t.verified, t.year, t.average," +
                "  p.name as programme_type, p.evs_code as study_programme_key," +
                "  s.emso, s.name, s.surname, s.registration_number," +
                "  e.name as enrol_type, e.code as enrol_type_key," +
                "  st.name as study_type, st.key as study_type_key" +
                "  from token t" +
                "  INNER JOIN study_programme p" +
                "    On study_programme = p.evs_code" +
                "  INNER JOIN student s" +
                "    ON student_id = s.registration_number" +
                "  INNER JOIN enrol_type e" +
                "    ON enrol_type = e.code" +
                "  INNER JOIN study_type st" +
                "    ON study_type = st.key" +
                "  WHERE t.key = $1";
                
    let params = [tokenId];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.updateTokenWithId = function(tokenId, tokenValues) {
  return new Promise((resolve, reject) => {
    console.log("Updating token ... ", tokenId, tokenValues);
    let query = 'UPDATE public."token" SET (used, verified, year, enrol_type, study_type, study_programme) = '+
                '($1, $2, $3, $4, $5, $6)' +
                'WHERE key = $7';
                
    let t = tokenValues;
    t.used = htmlBooleanToInt(t.used);
    t.verified = htmlBooleanToInt(t.verified);
    
    let params = [t.used, t.verified, t.year, t.enrol_type, t.study_type, t.study_programme, tokenId];
    
    console.log("Upgrading with params:", params)
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.deleteTokenWithId = function(tokenId) {
  return new Promise((resolve, reject) => {
    let query = 'DELETE FROM token WHERE key = $1';
    let params = [tokenId];
  
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.createNewToken = function(registration_number) {
  return new Promise((resolve, reject) => {
    let query = 'DELETE FROM token WHERE key = $1';
    let params = [registration_number];
  
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
  
}

function htmlBooleanToInt(htmlBoolean) {
  return htmlBoolean == 'on'? 1 : 0;
}


function currentYear() {
  return new Date().getFullYear().toString().substr(-2);
}