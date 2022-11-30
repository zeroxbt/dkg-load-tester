const endpoints = require("../../endpoints.json");

module.exports.getRandomEndpoints = (n) => {
  const shuffled = endpoints.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, n);
};
