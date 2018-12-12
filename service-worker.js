importScripts('./promise-resolver.js');

self.addEventListener('install', e => {
  console.info('[info] Handling `install` event');
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  console.info('[info] Handling `activate` event');
  e.waitUntil(self.clients.claim());
});

const origin = 'https://1000ch.github.io/payment-app-demo';
const methodName = `${origin}/pay`;
const checkoutURL = `${origin}/checkout.html`;
let resolver;
let paymentRequestEvent;

self.addEventListener('paymentrequest', async e => {
  console.info('[info] Handling `paymentrequest` event');
  paymentRequestEvent = e;

  function noop() {}
  resolver = new PromiseResolver(new Promise(noop, noop));
  e.respondWith(resolver.promise);

  try {
    console.info('[info] Opening checkout page');
    const client = await e.openWindow(checkoutURL);

    if (client === null) {
      resolver.reject('Failed to open window');
    }
  } catch (error) {
    resolver.reject(error);
  }
});

self.addEventListener('message', async e => {
  console.info('[info] Handling `message` event:', e.data.type);
  if (paymentRequestEvent === undefined) {
    return;
  }

  switch (e.data.type) {
    case 'payment-window-ready':
      const clientList = await clients.matchAll({
        includeUncontrolled: false,
        type: 'window'
      });

      console.info('[info] Showing Service Worker clients list', clientList);

      for (const client of clientList) {
        client.postMessage(paymentRequestEvent.total);
      }
      break;
    case 'pay-with-payment-app':
      const details = {
        total: e.data
      };

      resolver.resolve({
        methodName,
        details
      });
      break;
    default:
      resolver.reject(e.data);
      break;
  }
});
