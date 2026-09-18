const http = require('http');
// Built into node. query.parse() turns "name=jp&age=40" into { name: 'jp', age: '40' }
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

/*
  A POST body does not show up attached to the request the way the URL does.
  It streams in, so node hands it to us a piece at a time. We collect the pieces,
  wait until they stop coming, then put them back together.

  The handler parameter is a function (for us, jsonHandler.addUser). parseBody
  does not know or care what it does. It rebuilds the body and then calls it,
  so any POST route we add later can reuse this same function. */

const parseBody = (request, response, handler) => {

  //console.log('parse body');
  const body = [];

  // request.on() sets these up, it does not run them. Node calls them when the event happens,
  // the same way addEventListener works in the browser.

  // The upload broke partway through. Log it and send back a bare 400.
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // Fires once per chunk, in order. Our tiny form body is one chunk.
  // A 1MB upload fires this around 15 times, and a 1GB upload thousands.
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // Fires once, when the whole body has arrived. This is the only place we know we have all of it.
  request.on('end', () => {
    // Buffer.concat glues the chunks back together, .toString() turns those bytes into text.
    // We now have the string "name=jp&age=40"
    const bodyString = Buffer.concat(body).toString();

    const type = request.headers['content-type'];
    //console.log(type);

    if (type === 'application/x-www-form-urlencoded') {
      // Turn that text into an object and hang it on the request.
      // Nothing builds request.body for us, so this is the line that creates it.
      // Leave it out and addUser dies with "Cannot destructure property 'name' of 'request.body'"
      request.body = query.parse(bodyString);

    } else if (type === 'application/json') {
      request.body = JSON.parse(bodyString);

    } else {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(index);
      response.end();
    }


    // The body is ready, so now it is safe to run the real handler.
    // Leave this out and the request just spins forever, because nothing ever responds.
    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  //console.log("handle post");
  if (parsedUrl.pathname === '/addUser') {
    // Our first try in class. It ran immediately, before the body had arrived,
    // so request.body did not exist yet and the server crashed.
    // jsonHandler.addUser(request, response);

    // No parentheses on addUser. We are handing parseBody the function itself,
    // and parseBody calls it for us once the body is complete.
    parseBody(request, response, jsonHandler.addUser);
  }
};

const handleGet = (request, response, parsedUrl) => {
  //console.log("handle get");
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

  // Monday the URL picked the handler. Here the method picks first, then the URL,
  // because a POST needs its body rebuilt before any handler can run.
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
