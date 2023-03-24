require("dotenv").config();
const { setTimeout } = require("timers/promises");
const OTNode = require("./src/apis/OTNode");
const { getRandomEndpoints } = require("./src/util/Endpoint");
const wallets = require("./wallets.json");
const Logger = require("./src/util/logger");
const { randomUUID } = require("crypto");

const CONCURRENCY = 2;
const logger = new Logger("trace");
const otnode = new OTNode(logger);

(async () => {
  const concurrency = Math.min(CONCURRENCY, wallets.length);

  await otnode.initialize();

  while (true) {
    const endpoints = getRandomEndpoints(concurrency);
    const clientsOptions = [];
    for (let i = 0; i < concurrency; ++i) {
      clientsOptions.push({ wallet: wallets[i], endpoint: endpoints[i] });
    }

    await Promise.all(
      clientsOptions.map(async ({ wallet, endpoint }) => {
        const loadTestId = randomUUID();
        logger.info(`Starting load test with id: ${loadTestId}...`);
        // create asset
        let identifier = Math.floor(Math.random() * 1e10);
        const publishResult = await otnode.publish(
          {
            public: {
              "@context": "https://schema.org",
              "@id": `uuid:${identifier}`,
              "@type": "Person",
              name: "John Doe",
            },
            private: {
              "@context": "https://schema.org",
              "@id": `uuid:${identifier}`,
              bankAccount: `${identifier}`,
            },
          },
          endpoint,
          wallet,
          loadTestId
        );

        // get asset
        if (publishResult?.operation?.status === "COMPLETED") {
          await otnode.get(
            publishResult.UAL,
            null,
            endpoint,
            wallet,
            loadTestId
          );

          identifier = Math.floor(Math.random() * 1e10);
          const updateResult = await otnode.update(
            publishResult.UAL,
            {
              public: {
                "@context": "https://schema.org",
                "@id": `http://example.com/${identifier}`,
                "@type": "Person",
                name: "John Doe",
              },
              private: {
                "@context": "https://schema.org",
                "@id": `uuid:${identifier}`,
                bankAccount: `${identifier}`,
              },
            },
            endpoint,
            wallet,
            loadTestId
          );

          if (updateResult?.operation?.status === "COMPLETED") {
            await otnode.get(
              publishResult.UAL,
              null,
              endpoint,
              wallet,
              loadTestId
            );
            await otnode.get(
              publishResult.UAL,
              "LATEST",
              endpoint,
              wallet,
              loadTestId
            );
            await otnode.get(
              publishResult.UAL,
              "LATEST_FINALIZED",
              endpoint,
              wallet,
              loadTestId
            );
            await otnode.get(
              publishResult.UAL,
              "LATEST",
              getRandomEndpoints(1)[0],
              wallet,
              loadTestId
            );
            await otnode.get(
              publishResult.UAL,
              "LATEST_FINALIZED",
              getRandomEndpoints(1)[0],
              wallet,
              loadTestId
            );
          }
        }

        // sleep 5 seconds
        await setTimeout(5 * 1000);
      })
    );
  }
})();
