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

  // Two cases send headers with no body: a HEAD request (Monday), and a 204 No Content.
  // Content-Length above is still the real size. For HEAD that size is the whole point.
  // Note this is && and not ||. With || the condition is true for everything, so nothing is ever skipped.
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(JSON.stringify(object));
  }

  response.end();
};

const getUsers = (request, response) => {
  // Wrapping users in a key means an empty result reads as "no users yet"
  // instead of looking like something broke.
  const responseJSON = {
    users,
  };

  respondJSON(request, response, 200, responseJSON);
};

const addUser = (request, response) => {

  // Start with the error message. If the request turns out to be fine we overwrite it.
  // Assume people will send you broken requests, because they will.
  const responseJSON = {
    message: 'Name and age are both required!'
  };

  // request.body is the object parseBody built for us over in server.js.
  const { name, age } = request.body;

  // Either field missing or blank, so stop here with a 400.
  if (!name || !age) {
    // A short id gives your client code something to check against,
    // since several different errors can share the same readable message.
    responseJSON.id = 'Missing Params';
    return respondJSON(request, response, 400, responseJSON);
  };

  // Assume this is an update (204) until we find out the name is new.
  let statusCode = 204;

   // No user by that name yet, so this is a create (201) and we make the object.
  if (!users[name]) {
    statusCode = 201;
    users[name] = {
      name: name
    }
  }

  // New or existing, the user object definitely exists by this point, so one line sets the age.
  // Note the age is a string. A url encoded body is all text.
  users[name].age = age;

  //created a user
  if (statusCode === 201) {
    responseJSON.message = 'User Successfully created!';
    return respondJSON(request, response, statusCode, responseJSON);
  }

  //return 204 (no need to send body out since a 204 never sends one, empty obj instead)
  return respondJSON(request, response, statusCode, {});
  console.log(name, age);
};

module.exports = {
  getUsers,
  addUser,
};
