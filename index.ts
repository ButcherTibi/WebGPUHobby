import index from './Client/start.html'; 
import { startWatchingTheShaderCode, handleShaderCodeRequest } from './ShaderCodeWatcher';

startWatchingTheShaderCode();

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,  // Handles all static file requests
    "/shader_code": handleShaderCodeRequest
  },
  development: true
});

console.log(`Listening on ${server.url}`);