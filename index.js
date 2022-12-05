require("dotenv").config();
const { setTimeout } = require("timers/promises");
const OTNode = require("./src/apis/OTNode");
const { getRandomEndpoints } = require("./src/util/Endpoint");
const wallets = require("./wallets.json");

const CONCURRENCY = 7;

(async () => {
  const concurrency = Math.min(CONCURRENCY, wallets.length);

  const otnode = new OTNode();
  await otnode.initialize();

  while (true) {
    const endpoints = getRandomEndpoints(concurrency);
    const clientsOptions = [];
    for (let i = 0; i < concurrency; ++i) {
      clientsOptions.push({ wallet: wallets[i], endpoint: endpoints[i] });
    }

    await Promise.all(
      clientsOptions.map(async ({ wallet, endpoint }) => {
        const data = {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "John Doe",
          identifier: Math.floor(Math.random() * 1e10),
        };
        // create asset
        const publishResult = await otnode.publish(data, endpoint, wallet);

        // get asset
        if (publishResult?.operation?.status === "COMPLETED") {
          await otnode.get(publishResult.UAL, endpoint, wallet);
        }

        // sleep 5 seconds
        await setTimeout(5 * 1000);
      })
    );
  }
})();
