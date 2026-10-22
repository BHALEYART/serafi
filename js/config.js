/* Sé Rafi — Shopify connection.
   Leave `domain` empty to run the site as a demo store using js/catalog.js.

   To connect a Shopify store:
   1. In Shopify admin, add the "Headless" sales channel and create a storefront.
   2. Copy its public Storefront API access token (public tokens are made to be
      used in the browser; never put an Admin API token here).
   3. Fill in the values below and push. Products, prices, stock and checkout
      then come from Shopify. See README.md for product setup. */
window.SERAFI_SHOPIFY = {
  domain: '',            // e.g. 'serafi.myshopify.com'
  storefrontToken: '',   // public Storefront API access token
  apiVersion: '2026-07',
  country: 'US',         // buyer country, sets prices and currency
  language: 'EN'
};
