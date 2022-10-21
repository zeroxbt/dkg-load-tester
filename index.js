require("dotenv").config();
const { setTimeout } = require("timers/promises");
const OTNode = require("./src/apis/OTNode");
const { getRandomEndpoint } = require("./src/util/Endpoint");
const apis = require("./src/util/apis");
const wallets = require("./wallets.json");

(async () => {
  const otnode = new OTNode();
  await otnode.initialize();

  let walletIndex = 0;
  while (true) {
    for (const api of apis) {
      if(walletIndex === 0) continue
      // fetch data
      const data = await api.getData();

      // create asset
      const publishResult = await otnode.publish(
        data,
        getRandomEndpoint(),
        wallets[walletIndex]
      );

      // get asset
      if (publishResult?.UAL) {
        await otnode.get(
          publishResult.UAL,
          getRandomEndpoint(),
          wallets[walletIndex]
        );
      }

      // sleep 5 seconds
      await setTimeout(5 * 1000);

      walletIndex = (walletIndex + 1) % wallets.length;
    }
  }
})();
