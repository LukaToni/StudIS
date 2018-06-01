
const { Client } = require('pg')

var bcrypt = require('bcrypt-nodejs');
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
//GET LAST YEAR COURSES
module.exports.getCoursesLastYear = function(student){
  return new Promise((resolve, reject)=>{
    let query = `SELECT cou.name as name, cur.study_year as s_year, cur.type as type, cur.key as key, cou.credits as credits, cur.module as module
    FROM public."courses" as cou, public."course_enrol" as enr, public."curriculum" as cur
    WHERE cou.numberid = enr.course_id AND enr.student_id = $1 AND cou.numberid = cur.course AND enr.enrol_year='2017'
    ORDER BY cou.module, cou.name`
    let params= [student.registration_number];

    client.query(query, params, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}
//GET MODULES
module.exports.getModules = function(student){
  return new Promise((resolve, reject)=>{
    let query = `SELECT mod.name as name, mod.type as type, mod.key as key, mod.credits as credits, mod.key as module
    FROM public."modules" as mod
    ORDER BY mod.name`

    client.query(query, (err, res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}


//TOKEN
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
    FROM public."student" as student
    WHERE registration_number=$1`;
    let params = [id];

    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows[0]);
    })
  })
}
//GET TOKEN OF STUDENT
module.exports.getTokenByKey = function(key){
  return new Promise((resolve, reject)=>{
    let query = `SELECT *
    FROM public."token" as token
    WHERE token.key = $1`
    let params = [key];

    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows[0]);
    })
  })
}

//FIND STUDENT
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
//UPDATE ALL INFO OF STUDENT
module.exports.updateStudentAll = function(data){
  return new Promise((resolve, reject)=>{
    let query = `UPDATE public."student"
    SET (name, surname, emso, birth, telephone_number, country, county, post_office_number, street, street_post, country_post, county_post, post_post) = ($1, $2, $3, $4, $5, $6, $7, $8, $9, $11, $12, $13, $14)
    WHERE registration_number = $10`
    let birth =   "";
    if(data.emso[4] == '9')
      birth = data.emso[0] + data.emso[1] + "." + data.emso[2] + data.emso[3] + ".1" + data.emso[4] + data.emso[5] + data.emso[6]; 
    else
      birth = data.emso[0] + data.emso[1] + "." + data.emso[2] + data.emso[3] + ".2" + data.emso[4] + data.emso[5] + data.emso[6];
    let params = [data.name, data.surname, data.emso, birth, data.telephone_number, data.country, data.county, 3000, data.street, data.registration_number, data.street_post, data.country_post, data.county_post, data.post_post];
    
    client.query(query,params, (err,res)=>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  })
}

//STUDENT ENROLS
module.exports.getStudentEnrols = function(studentId){
  return new Promise((resolve, reject) =>{
    let query = `SELECT s.year as year, s.study_year as study_year, t.name as s_type, e.name as e_type, sp.name as s_programme , s.key as s_key
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
//SAVE ENROL COURSES WITH MODULES(ni mel proste izbire is so v seznamu moduli brez predmetov)
module.exports.setEnrolCoursesModules = function(student,data){
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
/*
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
}*/

module.exports.getVpisniPdfData = function(enrolId){
  
  return new Promise((resolve, reject) =>{    
    let query = 'select sp.evs_code as study_program_evs, s.emso as student_emso, sp.name as enrol_study_program, s.email as student_email, se.study_year as enrol_year, s.registration_number as student_vpisna, s."name" as student_name, s.surname as student_surname from student_enrols as se '+
                'inner join student as s '+
                  'on s.registration_number = se.student_registration_number '+
                'inner join study_programme sp '+
                  'on se.study_programme = sp.evs_code '+
                'where se."key" = $1 ';
    let params = [enrolId];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    })
  });
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
              'WHERE co.professor_id = $1 ' +
              'ORDER BY c.name';
      let params = [professorId];
      
      client.query(query, params, (err, res) =>{
        if(err) return reject(err);
        return resolve(res.rows);
      })
    }
    if(userType === 'clerk') {
      query = 'SELECT name, numberid FROM public.courses as c ' +
              'ORDER BY c.name';
      
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
                  's.registration_number AS student_registration_number, s.surname as student_surname, s."name" AS student_name, st."name" AS student_enrol_type ' +
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
                  'AND c.numberid = $1 ' +
                'ORDER BY s.surname';
    let params = [courseNumberId];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.getExams = function(courseNumberId){
  return new Promise((resolve, reject) =>{    
      let query = 'SELECT * FROM exams WHERE course_id = $1 '+
                    'ORDER BY date ASC';
      let params = [courseNumberId];
      
      client.query(query, params, (err, res) =>{
        if(err) return reject(err);
        return resolve(res.rows);
      });
    });
}
    
module.exports.addExam = function(courseNumberId, date){
  dayStr = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  monthStr = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  hoursStr = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  minutesStr = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  dateStr = dayStr + '-' + monthStr + '-' + date.getFullYear() + ' ' + hoursStr + ':' + minutesStr + ':00';
  console.log('dateStr: ' + dateStr);
  
  return new Promise((resolve, reject) =>{    
    let query = 'INSERT INTO exams(course_id, date) VALUES ' +
                  "( $1, to_timestamp( $2 , 'dd-mm-yyyy hh24:mi:ss'))";
    let params = [courseNumberId, dateStr];
    
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve();
    })
  });
};

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
    let query = 'UPDATE student SET (token) = (null) WHERE token = ' + tokenId + ';' +  
                'DELETE FROM token WHERE key = ' + tokenId;
    let params = [];
  
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
}


module.exports.createNewToken = function(student_id) {
  return new Promise((resolve, reject) => {
    let query = "INSERT INTO token" +
                "(study_programme, year, enrol_type, study_type, average, student_id)" +
                "VALUES" +
                "('1000468', 1, 1, 1, 0, $1)" + 
                "RETURNING key";
                
    let params = [student_id];
  
    client.query(query, params, (err, res) =>{
      console.log(res);
      if(!err && res.rows.length != 0) {
          let query = "UPDATE student SET (token) = ($1) WHERE registration_number = $2";
          let new_token_key = res.rows[0].key
          let params = [new_token_key, student_id];
          console.log("params", params)
          
          client.query(query, params, (err, res) =>{
            // TODO: CRITICAL: ce pride tuki do napake je treba tudi prejsni query nazaj poslt !! 
            // TODo: preveri ce se mogoce to da narediti samo z enim klicem  
            console.log(err)
            if(err) return reject(err);
            return resolve(new_token_key);
          });
      }
      
      if(err) return reject(err);
      return resolve(res.rows);
    });
  });
  
}

module.exports.getExamsForStudent = function(student_id) {
  return new Promise((resolve, reject) => {
    let query =  '   select  '  + 
    'e.id exam_id,' +
 '       e.*,  '  + 
 '       c.*,  '  + 
 '       ce.*,  '  + 
          '( '+
            'select exam_grade from exam_enrols where student_id = $1 and exam_id = e.id limit 1 '+
         ' ) exam_grade, ' +
 '       (  '  + 
 '         select count(*)  '  + 
 '         from (  '  + 
 '             select *  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 "             and e.date > to_date('09/2017', 'mm/yyyy') and e.date < to_date('09/2018', 'mm/yyyy')  "  + 
 '         ) as foo  '  + 
 '       ) as takings_this_year,  '  + 
 '       (  '  + 
 '         select count(*)  '  + 
 '         from (  '  + 
 '             select *  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 '         ) as foo  '  + 
 '       ) as takings_all_years,  '  + 
 '       (  '  + 
 "         select  extract ('doy' from e.\"date\") < extract( 'doy' from now())  "  + 
 '       ) as exam_expired,  '  + 
 '       (  '  + 
 '         select count(*) > 0  '  + 
 '         from (  '  + 
 '             select *  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 '             and ee.exam_grade is not null and ee.exam_grade > 5  '  + 
 '         ) as foo  '  + 
 '       ) as course_completed,  '  + 
 '       (  '  + 
 '         select count(*) > 0  '  + 
 '         from (  '  + 
 '             select *  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 '             and ee.exam_grade is null  '  + 
 '         ) as foo  '  + 
 '       ) as exists_enrol_without_grade,  '  + 
  '       (  '  + 
 '         select count(*) > 0  '  + 
 '         from (  '  + 
 '             select *  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 '             and ee.exam_grade is null  '  + 
 '              and ee.exam_id = e.id ' +
 '         ) as foo  '  + 
 '       ) as exists_enrol_for_this_exam,  '  + 
 '       (  '  + 
 "         select extract( 'day' from (  "  + 
 '           select foo.date - now() from (  '  + 
 '             select "date"  '  + 
 '             from exam_enrols ee  '  + 
 '             where 1=1  '  + 
 '             and student_id = $1  '  + 
 '             and e.course_id = ce.course_id  '  + 
 '             and ee.valid = true  '  + 
 '             order by date desc  '  + 
 '             limit 1  '  + 
 '           ) as foo  '  + 
 '         ))  '  + 
 '       ) as days_since_last_valid_exam_enrol,  '  + 
 '       (  '  + 
 '         select count(*) > 0 from student_enrols se  '  + 
 '           where 1=1  '  + 
 "           and study_year = extract('year' from now())  "  + 
 '       ) as student_enrolled  '  + 
 '       from exams e  '  + 
 '       inner join courses c  '  + 
 '         on e.course_id = c.numberid  '  + 
 '       inner join course_enrol ce  '  + 
 '         on e.course_id = ce.course_id  '  + 
 '       where 1=1  '  + 
 "       and e.date > to_date('09/2017', 'mm/yyyy') and e.date < to_date('09/2018', 'mm/yyyy')  "  + 
 '       and ce.active = true  '  + 
 '       and ce.student_id = $1  '  + 
 '       order by e."date" asc  ';
                
    let params = [student_id];
  
    client.query(query, params, (err, res) =>{
      if(err) return reject(err);
      //console.log(res.rows);
      return resolve(res.rows);
    });
  
    /*
    var exams = [{course_name: 'nekneki123', date: 'nekdatum', exam_id: 1, lecture_room: 'PA', enrolled: false, paid: false, changeable: true},
                {course_name: 'nekneki1231233', date: 'nekdrugdatum', exam_id: 2, lecture_room: 'PA', enrolled: false, paid: true, changeable: true},
                {course_name: 'nekneki1asd231233', date: 'nekdruasdgdatum', exam_id: 3, lecture_room: 'PA', enrolled: false, paid: false, changeable: false},
                {course_name: 'nekne212easd231233', date: 'nekdr12euasdgdatum', exam_id: 4, lecture_room: 'PA', enrolled: true, paid: false, changeable: true}]; //TODO
  
    resolve(exams)
    */
  });
}

module.exports.doEnrol = function(exam_id, student_id) {
  return new Promise((resolve, reject) => {
    let query = "insert into exam_enrols (valid, student_id, taking, exam_id) values (true, $1, 1 + (select count(*) from exam_enrols ee inner join exams e on ee.exam_id = e.id where ee.valid = true and ee.student_id = $2) ,$3)";
  
    let params = [student_id, student_id,  exam_id];
    
    console.log(query);
    console.log(params);
    
    client.query(query, params, (err, res) =>{
      console.log('exam enrol err: ' + err);
      if(err) return reject(err);
      return resolve();
    });
    
    /*
    insert into exam_enrols (course_id, valid, student_id, "year", taking)
    values ($course_id, $valid, $student_id, $"year", $taking)
    */  
  });
}

module.exports.undoEnrol = function(exam_id, user_id) {
  if(isNaN(exam_id)) return;

  console.log('undoing enrol: ' + exam_id + ' ' + user_id);

  return new Promise((resolve, reject) => {
  
    let query = 'update exam_enrols ee set valid = false, cancelled = now(), cancelled_by = $1 ' +
    'where ee.exam_id = $2 ' +
    'and ee.valid = true ';
  
    let params = [user_id,  exam_id];
  
    console.log(query);
    console.log(params);
    
    client.query(query, params, (err, res) =>{
      console.log('exam unenrol err: ' + err);
      if(err) return reject(err);
      return resolve();
    });
  });
}

function htmlBooleanToInt(htmlBoolean) {
  return htmlBoolean == 'on'? 1 : 0;
}

function currentYear() {
  return new Date().getFullYear().toString().substr(-2);
}