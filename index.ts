
import index from './Client/start.html'; 

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index, 
  },
  development: true
});

console.log(`Listening on ${server.url}`);