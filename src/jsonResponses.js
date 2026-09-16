// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
// We will be working with databases in the next few weeks.
const users = {};

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD') {
    response.write(JSON.stringify(object));
  }

  response.end();
};

const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  respondJSON(request, response, 200, responseJSON);
};

const addUser = (request, response) => {
  responseJSON = {
    message:'Name and age are both required!'
  };

  const { name, age } = request.body;
 
 if(!name || !age){
  responseJSON.id = 'Missing Params';
  return respondJSON(request, response, 400, responseJSON);
 };

 let statusCode = 204;

 if (!users[name]) {
  statusCode = 201;
  users[name] = {
    name:name
  }
 }

 users[name].age = age;

 if (statusCode === 201){
  responseJSON.message = 'User Successfully created!';
  return respondJSON(request, response, statusCode, responseJSON);
 }

 //return 204 (no need to send body out, empty obj instead)
 return respondJSON(request, response, statusCode, {});
  console.log(name, age);

};

module.exports = {
  getUsers,
  addUser,
};
