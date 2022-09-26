const endpoints = require("../../endpoints.json");

module.exports.getRandomEndpoint = () => {
  return endpoints[Math.floor(Math.random() * endpoints.length)];
}
