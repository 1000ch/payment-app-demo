export async function installServiceWorker() {
  console.info('[info] Installing Service Worker');
  const { serviceWorker } = navigator;

  if (serviceWorker === undefined) {
    console.info('[info] Service Worker is not supported');
    return Promise.reject();
  }

  await serviceWorker.register('./service-worker.js', {
    scope: '/payment-app-demo/'
  });
  console.info('[info] Registered Service Worker');

  return serviceWorker.ready;
}

export async function uninstallServiceWorker() {
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

export function addPaymentInstrument({ paymentManager }) {
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

export function notifyPaymentWindowReady() {
  console.info('[info] Notifing payment app is ready to Service Worker');
  const { serviceWorker } = navigator;

  serviceWorker.controller.postMessage({
    type: 'payment-window-ready'
  });
}

export function payWithPaymentApp(total) {
  console.info('[info] Paying with payment app');
  const { serviceWorker } = navigator;

  serviceWorker.controller.postMessage({
    type: 'pay-with-payment-app',
    total
  });
}
