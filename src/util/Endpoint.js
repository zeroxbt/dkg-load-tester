const endpoints = require("../../endpoints.json");

module.exports.getRandomEndpoints = (count) => {
  const shuffled = endpoints.sort(() => Math.random() - 0.5);
  const randomEndpoints = []
  for(let i = 0; i < count; i++) {
    randomEndpoints.push(shuffled.pop())
  }

  return randomEndpoints;
};
