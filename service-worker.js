importScripts('./promise-resolver.js');

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

const origin = 'https://1000ch.github.io/payment-app-demo';
const methodName = `${origin}/pay`;
const checkoutURL = `${origin}/checkout.html`;
let resolver;
let paymentRequestEvent;

self.addEventListener('paymentrequest', async e => {
  paymentRequestEvent = e;

  resolver = new PromiseResolver();
  e.respondWith(resolver.promise);

  try {
    const client = await e.openWindow(checkoutURL);

    if (client === null) {
      resolver.reject('Failed to open window');
    }
  } catch (error) {
    resolver.reject(error);
  }
});

self.addEventListener('message', e => {
  if (e.data === "payment_app_window_ready") {
    sendPaymentRequest();
    return;
  }

  if (e.data.methodName === methodName) {
    resolver.resolve(e.data);
  } else {
    resolver.reject(e.data);
  }
});

async function sendPaymentRequest() {
  if (paymentRequestEvent === undefined) {
    return;
  }

  const clientList = await clients.matchAll({
    includeUncontrolled: false,
    type: 'window'
  });

  for (const client of clientList) {
    client.postMessage(paymentRequestEvent.total);
  }
}
