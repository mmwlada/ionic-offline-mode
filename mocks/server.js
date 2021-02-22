
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(require('./db.js')());
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);

server.use(jsonServer.rewriter({
  '/api/messages': '/messages'
}));

server.get('/testError', (req, res) => {
  res.status(400).jsonp({
    errors: [{"code": "123", "details":"Testing error"}]
  });
});

server.use(router);
server.listen(port);
