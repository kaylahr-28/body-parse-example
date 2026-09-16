const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request,response,handler) => {
const body = [];
request.on('error',(err)=>{
  console.dir(err);
  response.statusCode = 400;
  response.end();
});

request.on('data',(chunk)=>{
body.push(chunk);
});

request.on('end', ()=>{
  const bodyString = Buffer.concat(body).toString();
  console.log(bodyString);
})

};

const handlePost = (request, response, parsedUrl) => {
  console.log("handle post");
  if (parsedUrl.pathname === '/addUser') {
    // jsonHandler.addUser(request, response);
    parseBody(request, response, jsonHandler.addUser);
  }
};

const handleGet = (request, response, parsedUrl) => {
  console.log("handle get");
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else {
    htmlHandler.getIndex(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    //get
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
