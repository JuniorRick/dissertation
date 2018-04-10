const http = require('http');
const fs = require('fs');
const path = require('path');

fs.readFile('index.html', (err, html) => {
  if(err) {
    // throw err;
    return;
  }

  const hostname = '127.0.0.1';
  const port = 3000;

  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-tye', 'text/plain');
    res.write(html);
    res.end();
  });

  server.listen(port, hostname, () => {
    console.log('Server started on port ' + port);
  });

});
