async function installServiceWorker() {
  console.info('[info] Installing Service Worker');
  const { serviceWorker } = navigator;

  if (serviceWorker === undefined) {
    console.info('[info] Service Worker is not supported');
    return Promise.reject();
  }

  await serviceWorker.register('./service-worker.js');
  console.info('[info] Registered Service Worker');

  return serviceWorker.ready;
}

async function uninstallServiceWorker() {
  console.info('[info] Uninstalling Service Worker');
  const { serviceWorker } = navigator;

  if (serviceWorker === undefined) {
    console.info('[info] Service Worker is not supported');
    return Promise.reject();
  }

  const registrations = await serviceWorker.getRegistrations();
  for (const registration of registrations) {
    registration.unregister();
  }
  console.info('[info] Unregistered Service Worker');

  const keys = await caches.keys();
  for (const key of keys) {
    await caches.delete(key);
  }
  console.info('[info] Cleared caches');
}

function addPaymentInstrument({ paymentManager }) {
  if (paymentManager === undefined) {
    console.info('[info] paymentManager is not supported');
    return Promise.reject();
  }

  paymentManager.instruments.set("https://1000ch.github.io/payment-app-demo/", {
    name: 'Payment App demo',
    method: 'https://1000ch.github.io/payment-app-demo/pay'
  });

  console.info('[info] Added a payment instrument');
}

async function main() {
  document.querySelector('#install-payment-app').addEventListener('click', async e => {
    const registration = await installServiceWorker();

    addPaymentInstrument(registration);
  });

  document.querySelector('#uninstall-payment-app').addEventListener('click', async e => {
    await uninstallServiceWorker();
  });
}

main();
