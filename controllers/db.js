var users = [
  {
    'id': 1,
    'username': 'user',
	'type': 'student',
    'password': '$2a$10$h6EJCiaOI9Rgfskt/7sO3uubF1uwgj1VwdYTP.A65nHqp2VtS/e/W'
  }
]

function getUser(username) {
  for(var i = 0; i < users.length; i ++) {
    if(users[i].username === username) {
      return users[i];
    }
  }
  return null;
}

module.exports = {'getUser': getUser};