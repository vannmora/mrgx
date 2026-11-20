const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/heart.js', ['dist/heart.js', 'text/javascript']],
]);

const port = Number(process.argv[2] ?? 8000);

createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  const file = files.get(path);
  if (!file) {
    response.writeHead(404).end();
    return;
  }

  const [name, contentType] = file;
  try {
    const content = await readFile(join(__dirname, name));
    response.writeHead(200, {
      'Content-Type': contentType + '; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(content);
  } catch (error) {
    console.error(error);
    response.writeHead(500).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Open http://127.0.0.1:${port}/`);
});
