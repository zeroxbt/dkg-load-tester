require("dotenv").config();
const { setTimeout } = require("timers/promises");
const OTNode = require("./src/apis/OTNode");
const { getRandomEndpoints } = require("./src/util/Endpoint");
const apis = require("./src/util/apis");
const wallets = require("./wallets.json");

async function queryNode(otnode, endpoint, wallet) {
  for (const api of apis) {
    // fetch data
    const data = await api.getData();

    // create asset
    const publishResult = await otnode.publish(data, endpoint, wallet);

    // get asset
    if (publishResult?.UAL) {
      await otnode.get(publishResult.UAL, endpoint, wallet);
    }

    // sleep 5 seconds
    await setTimeout(5 * 1000);
  }
}

(async () => {
  const clients = [0, 0, 0, 0];
  await Promise.all(
    clients.map((c) => new OTNode()).map((c) => c.initialize())
  );

  while (true) {
    const promises = [];
    const endpoints = getRandomEndpoints(4);
    for (let i = 0; i < 4; i++) {
      promises.push(
        queryNode(clients[i], endpoints[i], wallets[i])
      );
    }
    await Promise.all(promises);
  }
})();
