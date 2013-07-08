
var express = require('express');
var fs = require('fs');
var inputfile = "index.html";

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
   var filecontents = fs.readFileSync(inputfile, 'utf8');
   response.send(filecontents.toString());

//  response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
