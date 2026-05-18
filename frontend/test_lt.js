const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 8081 });
    console.log("Tunnel is open at: " + tunnel.url);
    tunnel.on('close', () => {
      console.log("Tunnel closed");
    });
    setTimeout(() => {
        tunnel.close();
    }, 5000);
  } catch(e) {
    console.error("Error:", e);
  }
})();
