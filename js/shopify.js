/* Sé Rafi — store layer.
   One interface for products and the bag, backed by either the Shopify
   Storefront API (when js/config.js has a domain) or the demo catalog.
   Pages only talk to window.SerafiStore. */
(function () {
  'use strict';

  var CFG = window.SERAFI_SHOPIFY || {};
  var LIVE = !!(CFG.domain && CFG.domain.trim());
  var CART_KEY = LIVE ? 'serafi-cart-id' : 'serafi-cart-demo';
  var CATEGORIES = ['rings', 'necklaces', 'earrings', 'bracelets'];
  var RING_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9'];

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function metalKey(value) {
    var v = String(value || '').toLowerCase();
    if (v.indexOf('rose') !== -1) return 'rose';
    if (v.indexOf('white') !== -1 || v.indexOf('platinum') !== -1 || v.indexOf('silver') !== -1) return 'white';
    return 'yellow';
  }

  /* ------------------------------------------------------------------ */
  /* Shopify Storefront API                                              */
  /* ------------------------------------------------------------------ */
  function gql(query, variables) {
    var headers = { 'Content-Type': 'application/json' };
    if (CFG.storefrontToken) headers['X-Shopify-Storefront-Access-Token'] = CFG.storefrontToken;
    var url = 'https://' + CFG.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '') +
              '/api/' + (CFG.apiVersion || '2026-07') + '/graphql.json';
    return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify({ query: query, variables: variables || {} }) })
      .then(function (r) {
        if (!r.ok) throw new Error('Shopify returned ' + r.status + '. Check the domain and token in js/config.js.');
        return r.json();
      })
      .then(function (j) {
        if (j.errors && j.errors.length) throw new Error(j.errors[0].message);
        return j.data;
      });
  }

  var CTX = '@inContext(country: ' + (CFG.country || 'US') + ', language: ' + (CFG.language || 'EN') + ')';

  var PRODUCT_FIELDS = 'handle title productType tags description descriptionHtml ' +
    'options { name optionValues { name } } ' +
    'images(first: 10) { nodes { url altText } } ' +
    'details: metafield(namespace: "custom", key: "details") { value } ' +
    'variants(first: 100) { nodes { id title availableForSale price { amount currencyCode } ' +
    'selectedOptions { name value } image { url altText } } }';

  var CART_FIELDS = 'id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } } ' +
    'lines(first: 100) { nodes { id quantity attributes { key value } merchandise { ... on ProductVariant { ' +
    'id title image { url altText } price { amount currencyCode } selectedOptions { name value } ' +
    'product { title handle } } } } }';

  function tagValue(tags, prefix) {
    for (var i = 0; i < tags.length; i++) {
      if (tags[i].toLowerCase().indexOf(prefix) === 0) return tags[i].slice(prefix.length).trim().toLowerCase();
    }
    return '';
  }

  function categoryOf(type, tags) {
    var t = String(type || '').toLowerCase();
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      if (t === c || t === c.slice(0, -1)) return c;
      if (tags.map(function (x) { return x.toLowerCase(); }).indexOf(c) !== -1) return c;
    }
    return t || 'other';
  }

  function mapShopifyProduct(p) {
    var tags = p.tags || [];
    var details = [];
    if (p.details && p.details.value) {
      try { details = JSON.parse(p.details.value); } catch (e) { details = [p.details.value]; }
    }
    var variants = p.variants.nodes.map(function (v) {
      var opts = {};
      v.selectedOptions.forEach(function (o) { opts[o.name] = o.value; });
      return {
        id: v.id, title: v.title, available: v.availableForSale,
        price: parseFloat(v.price.amount), currency: v.price.currencyCode,
        options: opts, image: v.image ? v.image.url : null
      };
    });
    var images = p.images.nodes.map(function (i) { return i.url; });
    var lower = tags.map(function (t) { return t.toLowerCase(); });
    var category = categoryOf(p.productType, tags);
    return {
      handle: p.handle, title: p.title, category: category,
      description: p.description, details: details, tags: lower,
      stackable: lower.indexOf('stackable') !== -1 || category === 'rings',
      // tags like "stack-style:pave" and "stack-stone:diamond" drive the stack preview
      art: { kind: 'ring', style: tagValue(lower, 'stack-style:') || 'band', stone: tagValue(lower, 'stack-stone:') || 'diamond' },
      options: (p.options || []).filter(function (o) { return !(o.name === 'Title' && o.optionValues.length === 1); })
        .map(function (o) { return { name: o.name, values: o.optionValues.map(function (v) { return v.name; }) }; }),
      variants: variants,
      images: images,
      price: Math.min.apply(null, variants.map(function (v) { return v.price; })),
      currency: variants[0] ? variants[0].currency : 'USD'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Demo catalog                                                        */
  /* ------------------------------------------------------------------ */
  var imgCache = {};
  function demoImage(p, metal) {
    var k = p.handle + ':' + metal;
    if (!imgCache[k]) imgCache[k] = window.SerafiArt.dataURI(window.SerafiArt.productSVG(p.art, metal));
    return imgCache[k];
  }

  function mapDemoProduct(p) {
    var metals = ['yellow', 'white', 'rose'];
    var metalNames = metals.map(function (m) { return window.SerafiArt.METALS[m].name; });
    var options = [{ name: 'Metal', values: metalNames }];
    var second = null;
    if (p.category === 'rings') second = { name: 'Size', values: RING_SIZES };
    if (p.category === 'necklaces') second = { name: 'Length', values: ['16"', '18"'] };
    if (second) options.push(second);
    var variants = [];
    metals.forEach(function (m, i) {
      (second ? second.values : [null]).forEach(function (val) {
        var opts = { Metal: metalNames[i] };
        if (second) opts[second.name] = val;
        variants.push({
          id: 'demo:' + p.handle + ':' + m + (val ? ':' + val : ''),
          title: metalNames[i] + (val ? ' / ' + val : ''),
          available: !(p.handle === 'eternity-line' && m === 'rose' && val === '9'),
          price: p.price, currency: 'USD', options: opts, image: demoImage(p, m)
        });
      });
    });
    return {
      handle: p.handle, title: p.title, category: p.category, description: p.description,
      details: p.details || [], tags: p.tags || [], stackable: !!p.stackable, art: p.art,
      options: options, variants: variants,
      images: metals.map(function (m) { return demoImage(p, m); }),
      price: p.price, currency: 'USD'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Products                                                            */
  /* ------------------------------------------------------------------ */
  var productsPromise = null;
  function getProducts() {
    if (productsPromise) return productsPromise;
    if (LIVE) {
      productsPromise = gql('query Products ' + CTX + ' { products(first: 100, sortKey: BEST_SELLING) { nodes { ' + PRODUCT_FIELDS + ' } } }')
        .then(function (d) { return d.products.nodes.map(mapShopifyProduct); });
    } else {
      productsPromise = Promise.resolve((window.SERAFI_CATALOG || []).map(mapDemoProduct));
    }
    return productsPromise;
  }

  function getProduct(handle) {
    return getProducts().then(function (list) {
      for (var i = 0; i < list.length; i++) if (list[i].handle === handle) return list[i];
      return null;
    });
  }

  function findVariant(variantId) {
    return getProducts().then(function (list) {
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].variants.length; j++) {
          if (list[i].variants[j].id === variantId) return { product: list[i], variant: list[i].variants[j] };
        }
      }
      return null;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Bag                                                                 */
  /* ------------------------------------------------------------------ */
  var EMPTY = { id: null, checkoutUrl: null, count: 0, subtotal: 0, currency: 'USD', lines: [] };
  var current = EMPTY;

  function emit(cart) {
    current = cart;
    document.dispatchEvent(new CustomEvent('serafi:cart', { detail: cart }));
    return cart;
  }

  function attrsKey(attrs) {
    return (attrs || []).map(function (a) { return a.key + '=' + a.value; }).join('&');
  }

  function mapShopifyCart(c) {
    if (!c) return EMPTY;
    return {
      id: c.id, checkoutUrl: c.checkoutUrl, count: c.totalQuantity,
      subtotal: parseFloat(c.cost.subtotalAmount.amount), currency: c.cost.subtotalAmount.currencyCode,
      lines: c.lines.nodes.map(function (l) {
        var v = l.merchandise;
        return {
          id: l.id, quantity: l.quantity, variantId: v.id, title: v.product.title, handle: v.product.handle,
          variantTitle: v.title === 'Default Title' ? '' : v.title,
          price: parseFloat(v.price.amount), image: v.image ? v.image.url : null, attributes: l.attributes
        };
      })
    };
  }

  // Demo bag lives in localStorage as [{id, variantId, quantity, attributes}]
  function demoLines() {
    try { return JSON.parse(store(CART_KEY) || '[]'); } catch (e) { return []; }
  }
  function demoBuild(lines) {
    store(CART_KEY, JSON.stringify(lines));
    return Promise.all(lines.map(function (l) { return findVariant(l.variantId); })).then(function (found) {
      var out = [], count = 0, subtotal = 0;
      lines.forEach(function (l, i) {
        var f = found[i];
        if (!f) return;
        count += l.quantity; subtotal += f.variant.price * l.quantity;
        out.push({
          id: l.id, quantity: l.quantity, variantId: l.variantId, title: f.product.title, handle: f.product.handle,
          variantTitle: f.variant.title, price: f.variant.price, image: f.variant.image, attributes: l.attributes || []
        });
      });
      return { id: 'demo', checkoutUrl: null, count: count, subtotal: subtotal, currency: 'USD', lines: out };
    });
  }

  function loadCart() {
    if (!LIVE) return demoBuild(demoLines()).then(emit);
    var id = store(CART_KEY);
    if (!id) return Promise.resolve(emit(EMPTY));
    return gql('query Cart($id: ID!) ' + CTX + ' { cart(id: $id) { ' + CART_FIELDS + ' } }', { id: id })
      .then(function (d) {
        if (!d.cart) { store(CART_KEY, null); return emit(EMPTY); }
        return emit(mapShopifyCart(d.cart));
      });
  }

  function userErrors(payload) {
    if (payload.userErrors && payload.userErrors.length) throw new Error(payload.userErrors[0].message);
    return payload.cart;
  }

  // items: [{ variantId, quantity, attributes: [{key, value}] }]
  function addToCart(items) {
    if (!LIVE) {
      var lines = demoLines();
      items.forEach(function (it) {
        var key = it.variantId + '|' + attrsKey(it.attributes);
        var existing = lines.filter(function (l) { return l.id === key; })[0];
        if (existing) existing.quantity += it.quantity || 1;
        else lines.push({ id: key, variantId: it.variantId, quantity: it.quantity || 1, attributes: it.attributes || [] });
      });
      return demoBuild(lines).then(emit);
    }
    var gLines = items.map(function (it) {
      return { merchandiseId: it.variantId, quantity: it.quantity || 1, attributes: it.attributes || [] };
    });
    var id = store(CART_KEY);
    var p = id
      ? gql('mutation Add($id: ID!, $lines: [CartLineInput!]!) ' + CTX + ' { cartLinesAdd(cartId: $id, lines: $lines) { cart { ' + CART_FIELDS + ' } userErrors { field message } } }', { id: id, lines: gLines })
          .then(function (d) { return userErrors(d.cartLinesAdd); })
      : gql('mutation Create($lines: [CartLineInput!]!) ' + CTX + ' { cartCreate(input: { lines: $lines }) { cart { ' + CART_FIELDS + ' } userErrors { field message } } }', { lines: gLines })
          .then(function (d) { return userErrors(d.cartCreate); });
    // A bag that expired or was checked out can't take new lines: start a fresh one.
    if (id) p = p.catch(function () { return null; });
    return p.then(function (cart) {
      if (!cart) {
        if (!id) throw new Error('Shopify could not create a bag.');
        store(CART_KEY, null); return addToCart(items);
      }
      store(CART_KEY, cart.id);
      return emit(mapShopifyCart(cart));
    });
  }

  function updateLine(lineId, quantity) {
    if (!LIVE) {
      var lines = demoLines().map(function (l) { if (l.id === lineId) l.quantity = quantity; return l; })
        .filter(function (l) { return l.quantity > 0; });
      return demoBuild(lines).then(emit);
    }
    var id = store(CART_KEY);
    var q = quantity > 0
      ? gql('mutation Update($id: ID!, $lines: [CartLineUpdateInput!]!) ' + CTX + ' { cartLinesUpdate(cartId: $id, lines: $lines) { cart { ' + CART_FIELDS + ' } userErrors { field message } } }',
          { id: id, lines: [{ id: lineId, quantity: quantity }] }).then(function (d) { return userErrors(d.cartLinesUpdate); })
      : gql('mutation Remove($id: ID!, $ids: [ID!]!) ' + CTX + ' { cartLinesRemove(cartId: $id, lineIds: $ids) { cart { ' + CART_FIELDS + ' } userErrors { field message } } }',
          { id: id, ids: [lineId] }).then(function (d) { return userErrors(d.cartLinesRemove); });
    return q.then(function (cart) { return emit(mapShopifyCart(cart)); });
  }

  function money(amount, currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
    } catch (e) { return '$' + amount; }
  }

  window.SerafiStore = {
    live: LIVE,
    categories: CATEGORIES,
    metalKey: metalKey,
    money: money,
    getProducts: getProducts,
    getProduct: getProduct,
    loadCart: loadCart,
    addToCart: addToCart,
    updateLine: updateLine,
    cart: function () { return current; }
  };
})();
