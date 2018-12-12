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

  try {
    console.info('[info] Opening checkout page');
    const promise = e.openWindow(checkoutURL);
    resolver = new PromiseResolver(promise);

    console.info('[info] Responding with e.openWindow() promise', resolver.promise);
    e.respondWith(resolver.promise);
  } catch (error) {
    resolver.reject(error);
  }
});

self.addEventListener('message', async e => {
  console.info('[info] Handling `message` event');
  if (paymentRequestEvent === undefined) {
    return;
  }

  switch (e.data.type) {
    case 'payment-window-ready':
      const clientList = await clients.matchAll({
        includeUncontrolled: false,
        type: 'window'
      });

      for (const client of clientList) {
        client.postMessage(paymentRequestEvent.total);
      }
      break;
    case 'pay-with-payment-app':
      const { total } = e.data;

      resolver.resolve({
        methodName,
        details: {
          total
        }
      });
      break;
    default:
      resolver.reject(e.data);
      break;
  }
});
