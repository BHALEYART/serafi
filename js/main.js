/* Sé Rafi — site behavior: nav, bag drawer, and the shop, product and stack pages. */
(function () {
  'use strict';

  var Store = window.SerafiStore;
  var Art = window.SerafiArt;
  var ROOT = document.body.getAttribute('data-root') || '';
  var PAGE = document.body.getAttribute('data-page') || '';
  var MAX_STACK = 6;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function productURL(handle) { return ROOT + 'product/?handle=' + encodeURIComponent(handle); }
  function money(n, c) { return Store.money(n, c); }

  var ICON = {
    up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 10l5-5 5 5"/></svg>',
    down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>'
  };

  /* ---------------- Toast ---------------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------------- Mobile nav ---------------- */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------------- Bag drawer ---------------- */
  var drawer = $('#bag'), lastFocus = null;
  function openBag() {
    lastFocus = document.activeElement;
    document.body.classList.add('bag-open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(function () { $('.drawer-head button', drawer).focus(); }, 50);
  }
  function closeBag() {
    document.body.classList.remove('bag-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-bag]').forEach(function (b) { b.addEventListener('click', openBag); });
  $$('[data-close-bag]').forEach(function (b) { b.addEventListener('click', closeBag); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('bag-open')) closeBag();
  });

  function renderBag(cart) {
    $$('.bag-count').forEach(function (el) {
      el.textContent = cart.count;
      if (cart.count) el.removeAttribute('data-empty'); else el.setAttribute('data-empty', '');
    });
    var body = $('.drawer-body', drawer), foot = $('.drawer-foot', drawer);
    if (!cart.lines.length) {
      body.innerHTML = '<div class="bag-empty"><p>Your bag is empty.</p><a class="btn btn--line" href="' + ROOT + 'shop/">Shop the collection</a></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = cart.lines.map(function (l) {
      var attrs = (l.attributes || []).filter(function (a) { return a.key.charAt(0) !== '_'; })
        .map(function (a) { return '<div class="a">' + esc(a.key) + ': ' + esc(a.value) + '</div>'; }).join('');
      return '<div class="bag-line" data-line="' + esc(l.id) + '">' +
        (l.image ? '<img src="' + esc(l.image) + '" alt="">' : '<span></span>') +
        '<div><a class="t" href="' + productURL(l.handle) + '">' + esc(l.title) + '</a>' +
        (l.variantTitle ? '<div class="v">' + esc(l.variantTitle) + '</div>' : '') + attrs +
        '<div><span class="qty"><button type="button" data-qty="-1" aria-label="Remove one">&minus;</button><span>' + l.quantity +
        '</span><button type="button" data-qty="1" aria-label="Add one">+</button></span>' +
        '<button type="button" class="remove" data-qty="remove">Remove</button></div></div>' +
        '<div>' + money(l.price * l.quantity, cart.currency) + '</div></div>';
    }).join('');
    $('[data-subtotal]', foot).textContent = money(cart.subtotal, cart.currency);
  }

  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]');
      if (!b) return;
      var line = b.closest('[data-line]').getAttribute('data-line');
      var cur = Store.cart().lines.filter(function (l) { return l.id === line; })[0];
      if (!cur) return;
      var q = b.getAttribute('data-qty') === 'remove' ? 0 : cur.quantity + parseInt(b.getAttribute('data-qty'), 10);
      Store.updateLine(line, q).catch(function (err) { toast(err.message); });
    });
    var checkout = $('[data-checkout]', drawer), note = $('[data-demo-note]', drawer);
    if (!Store.live && note) note.hidden = false;
    checkout.addEventListener('click', function () {
      var cart = Store.cart();
      if (Store.live && cart.checkoutUrl) { location.href = cart.checkoutUrl; return; }
      toast('Checkout opens once the Shopify store is connected.');
    });
  }

  document.addEventListener('serafi:cart', function (e) { if (drawer) renderBag(e.detail); });
  Store.loadCart().catch(function () { /* bag stays empty if Shopify is unreachable */ });

  function add(items, label) {
    return Store.addToCart(items).then(function () {
      openBag();
      if (label) toast(label);
    });
  }

  /* ---------------- Shared product helpers ---------------- */
  function metalOption(p) {
    return p.options.filter(function (o) { return /metal|material|color/i.test(o.name); })[0] || null;
  }
  function metalsOf(p) {
    var o = metalOption(p);
    return o ? o.values.map(function (v) { return { value: v, key: Store.metalKey(v) }; }) : [];
  }
  function variantForMetal(p, metal, extra) {
    var o = metalOption(p);
    return p.variants.filter(function (v) {
      if (o && Store.metalKey(v.options[o.name]) !== metal) return false;
      if (extra) for (var k in extra) if (v.options[k] !== extra[k]) return false;
      return true;
    })[0] || null;
  }
  function imageFor(p, metal) {
    var v = metal ? variantForMetal(p, metal) : null;
    return (v && v.image) || p.images[0] || '';
  }

  function cardHTML(p) {
    var metals = metalsOf(p);
    var first = metals[0] ? metals[0].key : null;
    var badge = p.tags.indexOf('new') !== -1 ? '<span class="badge badge--new">New</span>' : '';
    var sw = metals.length > 1 ? '<div class="swatches" role="group" aria-label="Metal">' + metals.map(function (m, i) {
      return '<button type="button" class="swatch" data-metal="' + m.key + '" aria-pressed="' + (i === 0) + '" aria-label="' + esc(m.value) + '" title="' + esc(m.value) + '"></button>';
    }).join('') + '</div>' : '';
    return '<article class="card" data-handle="' + esc(p.handle) + '">' + badge +
      '<a class="card-img" href="' + productURL(p.handle) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(imageFor(p, first)) + '" alt="" loading="lazy"></a>' +
      '<div class="card-body"><a class="card-title" href="' + productURL(p.handle) + '">' + esc(p.title) + '</a>' +
      '<span class="card-price">' + money(p.price, p.currency) + '</span>' + sw + '</div></article>';
  }

  function bindCards(container, products) {
    container.addEventListener('click', function (e) {
      var s = e.target.closest('.swatch');
      if (!s || !container.contains(s)) return;
      var card = s.closest('.card');
      var p = products.filter(function (x) { return x.handle === card.getAttribute('data-handle'); })[0];
      $$('.swatch', card).forEach(function (b) { b.setAttribute('aria-pressed', b === s ? 'true' : 'false'); });
      $('.card-img img', card).src = imageFor(p, s.getAttribute('data-metal'));
    });
  }

  function renderGrid(el, products) {
    el.innerHTML = products.map(cardHTML).join('');
  }

  // Resolve a stack definition ([[handle, metal], ...]) against the live product list.
  function resolveStack(rings, byHandle) {
    return rings.map(function (r) {
      var p = byHandle[r[0] || r.handle];
      return p ? { product: p, metal: r[1] || r.metal || 'yellow' } : null;
    }).filter(Boolean);
  }
  function stackSVG(resolved) {
    return Art.stackSVG(resolved.map(function (r) { return { spec: r.product.art, metal: r.metal }; }));
  }
  function stackTotal(resolved) {
    return resolved.reduce(function (sum, r) {
      var v = variantForMetal(r.product, r.metal);
      return sum + (v ? v.price : r.product.price);
    }, 0);
  }
  function indexBy(products) {
    var map = {};
    products.forEach(function (p) { map[p.handle] = p; });
    return map;
  }

  function failMessage(el, err) {
    if (el) el.innerHTML = '<p class="empty">We couldn’t load products right now. ' + esc(err.message) + '</p>';
  }

  /* ---------------- Home ---------------- */
  function initHome(products) {
    var by = indexBy(products);
    var stacks = (window.SERAFI_STACKS || []).map(function (s) {
      return { name: s.name, note: s.note, rings: resolveStack(s.rings, by) };
    }).filter(function (s) { return s.rings.length; });

    // Hero stage
    var stage = $('[data-hero-stage]');
    if (stage && stacks.length) {
      var i = 0;
      var draw = function () {
        var s = stacks[i];
        $('.stack-view', stage).innerHTML = stackSVG(s.rings);
        $('.stage-name', stage).textContent = s.name;
        $('.stage-price', stage).textContent = s.rings.length + ' rings, ' + money(stackTotal(s.rings));
        $('[data-stage-link]', stage).href = ROOT + 'stack/?preset=' + i;
        $('.stack-view svg', stage).setAttribute('role', 'img');
        $('.stack-view svg', stage).setAttribute('aria-label', s.name + ': ' + s.rings.map(function (r) { return r.product.title; }).join(', '));
      };
      $('[data-stage-prev]', stage).addEventListener('click', function () { i = (i - 1 + stacks.length) % stacks.length; draw(); });
      $('[data-stage-next]', stage).addEventListener('click', function () { i = (i + 1) % stacks.length; draw(); });
      draw();
    }

    // Category images
    var catPick = { rings: ['dew-solitaire', 'yellow'], necklaces: ['pip-pendant', 'yellow'], earrings: ['pave-huggies', 'rose'], bracelets: ['line-tennis-bracelet', 'white'] };
    $$('[data-cat-img]').forEach(function (img) {
      var cat = img.getAttribute('data-cat-img');
      var pick = catPick[cat] && by[catPick[cat][0]];
      var p = pick || products.filter(function (x) { return x.category === cat; })[0];
      if (p) img.src = imageFor(p, pick ? catPick[cat][1] : null);
    });

    // Bestsellers
    var grid = $('[data-grid="bestsellers"]');
    if (grid) {
      var best = products.filter(function (p) { return p.tags.indexOf('bestseller') !== -1; });
      if (best.length < 4) best = products;
      renderGrid(grid, best.slice(0, 4));
      bindCards(grid, products);
    }

    // Ready-made stacks
    var wrap = $('[data-stacks]');
    if (wrap) {
      wrap.innerHTML = stacks.map(function (s, idx) {
        return '<article class="stack-card"><div class="stack-view">' + stackSVG(s.rings) + '</div><div class="body">' +
          '<h3>' + esc(s.name) + '</h3><p class="muted small" style="margin:0">' + esc(s.note) + '</p>' +
          '<ul>' + s.rings.slice().reverse().map(function (r) {
            return '<li>' + esc(r.product.title) + ', ' + esc(Art.METALS[r.metal].name.replace('14k ', '').toLowerCase()) + '</li>';
          }).join('') + '</ul>' +
          '<div class="row"><span>' + money(stackTotal(s.rings)) + '</span><a class="btn btn--line" href="' + ROOT + 'stack/?preset=' + idx + '">Choose sizes</a></div></div></article>';
      }).join('');
      $$('.stack-view svg', wrap).forEach(function (svg) { svg.setAttribute('aria-hidden', 'true'); });
    }
  }

  /* ---------------- Shop ---------------- */
  function initShop(products) {
    var grid = $('[data-grid="shop"]');
    var state = { category: param('category') || 'all', metal: param('metal') || '', sort: param('sort') || 'featured' };
    var tabs = $$('[data-cat]'), metals = $$('[data-filter-metal]'), sort = $('[data-sort]');
    var heading = $('[data-shop-title]');
    var titles = { all: 'All jewelry', rings: 'Rings', necklaces: 'Necklaces', earrings: 'Earrings', bracelets: 'Bracelets' };

    function sync() {
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-cat') === state.category ? 'true' : 'false'); });
      metals.forEach(function (m) { m.setAttribute('aria-pressed', m.getAttribute('data-filter-metal') === state.metal ? 'true' : 'false'); });
      sort.value = state.sort;
      if (heading) heading.textContent = titles[state.category] || 'Shop';
      document.title = (titles[state.category] || 'Shop') + ' | Sé Rafi';

      var list = products.filter(function (p) {
        if (state.category !== 'all' && p.category !== state.category) return false;
        if (state.metal && !metalsOf(p).some(function (m) { return m.key === state.metal; })) return false;
        return true;
      });
      if (state.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === 'new') list.sort(function (a, b) { return (b.tags.indexOf('new') !== -1) - (a.tags.indexOf('new') !== -1); });

      $('[data-count]').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
      if (!list.length) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Nothing matches those filters. <button type="button" class="text-link" data-reset>Clear filters</button></div>';
      } else {
        renderGrid(grid, list);
        // Show the filtered metal on each card
        if (state.metal) $$('.card', grid).forEach(function (c) {
          var s = $('.swatch[data-metal="' + state.metal + '"]', c);
          if (s) s.click();
        });
      }
      var q = new URLSearchParams();
      if (state.category !== 'all') q.set('category', state.category);
      if (state.metal) q.set('metal', state.metal);
      if (state.sort !== 'featured') q.set('sort', state.sort);
      history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
    }

    tabs.forEach(function (t) { t.addEventListener('click', function () { state.category = t.getAttribute('data-cat'); sync(); }); });
    metals.forEach(function (m) {
      m.addEventListener('click', function () {
        var k = m.getAttribute('data-filter-metal');
        state.metal = state.metal === k ? '' : k; sync();
      });
    });
    sort.addEventListener('change', function () { state.sort = sort.value; sync(); });
    grid.addEventListener('click', function (e) {
      if (e.target.closest('[data-reset]')) { state = { category: 'all', metal: '', sort: 'featured' }; sync(); }
    });
    bindCards(grid, products);
    sync();
  }

  /* ---------------- Product ---------------- */
  function initProduct(products) {
    var root = $('[data-pdp]');
    var p = indexBy(products)[param('handle')];
    if (!p) {
      root.innerHTML = '<div class="empty" style="grid-column:1/-1"><h1>We couldn’t find that piece.</h1>' +
        '<p>It may have sold out or been renamed.</p><a class="btn" href="' + ROOT + 'shop/">Browse all jewelry</a></div>';
      return;
    }
    document.title = p.title + ' | Sé Rafi';
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', p.description.slice(0, 155));
    $('[data-crumb-cat]').textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
    $('[data-crumb-cat]').href = ROOT + 'shop/?category=' + p.category;
    $('[data-crumb-title]').textContent = p.title;

    var mOpt = metalOption(p);
    var others = p.options.filter(function (o) { return o !== mOpt; });
    var startMetal = param('metal');
    var sel = {};
    if (mOpt) {
      var match = mOpt.values.filter(function (v) { return Store.metalKey(v) === startMetal; })[0];
      sel[mOpt.name] = match || mOpt.values[0];
    }
    others.forEach(function (o) { sel[o.name] = /size/i.test(o.name) ? null : o.values[0]; });

    function current() {
      return p.variants.filter(function (v) {
        for (var k in sel) if (sel[k] !== null && v.options[k] !== sel[k]) return false;
        return true;
      });
    }
    function chosen() {
      for (var k in sel) if (sel[k] === null) return null;
      return current()[0] || null;
    }

    var info = $('.pdp-info', root);
    var optionHTML = '';
    if (mOpt) {
      optionHTML += '<fieldset class="option"><legend>Metal <span class="val" data-val="' + esc(mOpt.name) + '"></span></legend>' +
        '<div class="swatches" role="radiogroup" aria-label="Metal">' + mOpt.values.map(function (v) {
          return '<button type="button" role="radio" class="swatch" data-opt="' + esc(mOpt.name) + '" data-value="' + esc(v) + '" data-metal="' + Store.metalKey(v) + '" aria-label="' + esc(v) + '" title="' + esc(v) + '"></button>';
        }).join('') + '</div></fieldset>';
    }
    others.forEach(function (o) {
      var isSize = /size/i.test(o.name);
      optionHTML += '<fieldset class="option"><legend>' + esc(o.name) + ' <span class="val" data-val="' + esc(o.name) + '"></span>' +
        (isSize ? '<a class="aside" href="' + ROOT + 'care/#sizing">Find your size</a>' : '') + '</legend>' +
        '<div class="size-grid" role="radiogroup" aria-label="' + esc(o.name) + '">' + o.values.map(function (v) {
          return '<button type="button" role="radio" class="size-btn" data-opt="' + esc(o.name) + '" data-value="' + esc(v) + '">' + esc(v) + '</button>';
        }).join('') + '</div></fieldset>';
    });

    info.innerHTML = '<h1>' + esc(p.title) + '</h1><div class="pdp-price" data-price></div>' + optionHTML +
      '<div class="pdp-actions"><button type="button" class="btn btn--block" data-add>Add to bag</button>' +
      (p.stackable ? '<a class="btn btn--line btn--block" data-to-stack href="#">Try it in a stack</a>' : '') + '</div>' +
      '<div class="status" data-status role="status"></div>' +
      '<div class="pdp-desc"><p>' + esc(p.description) + '</p></div>' +
      '<div class="accordion">' +
      (p.details.length ? '<details open><summary>Details</summary><div class="content"><ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div></details>' : '') +
      '<details><summary>Shipping and returns</summary><div class="content"><p>[Shipping times, costs and the return window go here once confirmed.] Made-to-order pieces may have different terms.</p></div></details>' +
      '<details><summary>Care</summary><div class="content"><p>Take rings off for the gym, the pool and household cleaning. Clean with warm water, mild soap and a soft brush. <a href="' + ROOT + 'care/#care">Full care guide</a></p></div></details>' +
      '</div>';

    var main = $('.gallery-main img', root), thumbs = $('.thumbs', root);
    function setMain(src) {
      main.src = src;
      $$('.thumb', thumbs).forEach(function (t) { t.setAttribute('aria-current', t.getAttribute('data-src') === src ? 'true' : 'false'); });
    }
    main.alt = p.title;
    thumbs.innerHTML = p.images.length > 1 ? p.images.map(function (src, i) {
      return '<button type="button" class="thumb" data-src="' + esc(src) + '" aria-label="View image ' + (i + 1) + '"><img src="' + esc(src) + '" alt=""></button>';
    }).join('') : '';
    thumbs.addEventListener('click', function (e) {
      var t = e.target.closest('.thumb'); if (t) setMain(t.getAttribute('data-src'));
    });

    function refresh() {
      $$('[data-opt]', info).forEach(function (b) {
        var on = sel[b.getAttribute('data-opt')] === b.getAttribute('data-value');
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on || (sel[b.getAttribute('data-opt')] === null && !b.previousElementSibling) ? 0 : -1;
      });
      // Mark sold-out sizes for the chosen metal
      others.forEach(function (o) {
        $$('[data-opt="' + o.name + '"]', info).forEach(function (b) {
          var probe = {}; for (var k in sel) probe[k] = sel[k]; probe[o.name] = b.getAttribute('data-value');
          var v = p.variants.filter(function (x) { for (var k in probe) if (probe[k] !== null && x.options[k] !== probe[k]) return false; return true; })[0];
          if (v && !v.available) b.setAttribute('data-soldout', ''); else b.removeAttribute('data-soldout');
        });
      });
      for (var k in sel) {
        var lab = $('[data-val="' + k + '"]', info);
        if (lab) lab.textContent = sel[k] || '';
      }
      var v = chosen(), any = current()[0];
      $('[data-price]', info).textContent = money((v || any || p).price, p.currency);
      var addBtn = $('[data-add]', info), status = $('[data-status]', info);
      status.removeAttribute('data-tone'); status.textContent = '';
      if (!v) { addBtn.textContent = 'Select a size'; }
      else if (!v.available) { addBtn.textContent = 'Sold out'; addBtn.disabled = true; status.textContent = 'This size is sold out in ' + (sel[mOpt && mOpt.name] || 'this option') + '. Try another metal.'; }
      else { addBtn.textContent = 'Add to bag'; addBtn.disabled = false; }
      if (v && v.available) addBtn.disabled = false;
      if (!v) addBtn.disabled = false;
      var img = (v && v.image) || (any && any.image);
      if (img) setMain(img); else if (p.images[0]) setMain(p.images[0]);
      var toStack = $('[data-to-stack]', info);
      if (toStack) toStack.href = ROOT + 'stack/?add=' + encodeURIComponent(p.handle) + '&metal=' + Store.metalKey(sel[mOpt && mOpt.name]);
    }

    info.addEventListener('click', function (e) {
      var b = e.target.closest('[data-opt]');
      if (b) { sel[b.getAttribute('data-opt')] = b.getAttribute('data-value'); refresh(); return; }
      if (e.target.closest('[data-add]')) {
        var v = chosen(), status = $('[data-status]', info);
        if (!v) {
          status.setAttribute('data-tone', 'error');
          status.textContent = 'Choose a size to add this ring to your bag.';
          var firstSize = $('.size-btn', info); if (firstSize) firstSize.focus();
          return;
        }
        var btn = e.target.closest('[data-add]');
        btn.disabled = true; btn.textContent = 'Adding…';
        add([{ variantId: v.id, quantity: 1 }], p.title + ' added to your bag')
          .catch(function (err) { status.setAttribute('data-tone', 'error'); status.textContent = err.message; })
          .then(refresh);
      }
    });
    // Arrow keys move through radio-style option buttons
    info.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-opt]');
      if (!b || ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var group = $$('[data-opt="' + b.getAttribute('data-opt') + '"]', info);
      var i = group.indexOf(b) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1);
      var next = group[(i + group.length) % group.length];
      next.focus(); next.click();
    });
    refresh();

    // Structured data for search engines
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: p.title, description: p.description,
      brand: { '@type': 'Brand', name: 'Sé Rafi' },
      image: p.images.filter(function (u) { return u.indexOf('data:') !== 0; }),
      offers: { '@type': 'AggregateOffer', priceCurrency: p.currency, lowPrice: p.price,
        highPrice: Math.max.apply(null, p.variants.map(function (v) { return v.price; })),
        availability: p.variants.some(function (v) { return v.available; }) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
    });
    document.head.appendChild(ld);

    // Pairs well with
    var pair = $('[data-grid="pairs"]');
    if (pair) {
      var picks = products.filter(function (x) { return x.handle !== p.handle && (p.stackable ? x.stackable : x.category === p.category); });
      if (picks.length < 4) picks = picks.concat(products.filter(function (x) { return x.handle !== p.handle && picks.indexOf(x) === -1; }));
      renderGrid(pair, picks.slice(0, 4));
      bindCards(pair, products);
    }
  }

  /* ---------------- Stack builder ---------------- */
  function initStack(products) {
    var STORE_KEY = 'serafi-stack';
    var by = indexBy(products);
    var rings = products.filter(function (p) { return p.stackable; });
    var stacks = window.SERAFI_STACKS || [];
    var state = { rings: [], size: '' };
    try { var saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (saved && saved.rings) state = saved; } catch (e) { /* ignore */ }
    state.rings = state.rings.filter(function (r) { return by[r.handle]; });

    var preset = param('preset');
    if (preset !== null && stacks[preset]) {
      state.rings = resolveStack(stacks[preset].rings, by).map(function (r) { return { handle: r.product.handle, metal: r.metal }; });
    }
    var addHandle = param('add');
    if (addHandle && by[addHandle] && state.rings.length < MAX_STACK) {
      state.rings.push({ handle: addHandle, metal: param('metal') || 'yellow' });
    }
    if (preset !== null || addHandle) history.replaceState(null, '', location.pathname);

    var view = $('[data-stack-view]'), list = $('[data-my-stack]'), picker = $('[data-picker]');
    var sizeSel = $('[data-stack-size]'), totalEl = $('[data-stack-total]'), addBtn = $('[data-add-stack]');
    var status = $('[data-stack-status]'), countEl = $('[data-stack-count]');

    // Sizes come from the first ring that has a size option
    var sizeOpt = null;
    rings.some(function (p) { return (sizeOpt = p.options.filter(function (o) { return /size/i.test(o.name); })[0]); });
    if (sizeOpt) {
      sizeSel.innerHTML = '<option value="">Choose a size</option>' + sizeOpt.values.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join('');
      sizeSel.value = state.size || '';
    }

    $('[data-presets]').innerHTML = stacks.map(function (s, i) {
      if (!resolveStack(s.rings, by).length) return '';
      return '<button type="button" class="chip" data-preset="' + i + '">' + esc(s.name) + '</button>';
    }).join('') + '<button type="button" class="chip" data-clear>Start over</button>';

    picker.innerHTML = rings.map(function (p) {
      return '<button type="button" class="pick" data-pick="' + esc(p.handle) + '"><img src="' + esc(imageFor(p, 'yellow')) + '" alt="">' +
        '<span>' + esc(p.title) + ' <em>' + money(p.price, p.currency) + '</em></span></button>';
    }).join('');

    function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

    function render() {
      save();
      var resolved = state.rings.map(function (r) { return { product: by[r.handle], metal: r.metal }; });
      if (resolved.length) {
        view.innerHTML = stackSVG(resolved);
        var svg = $('svg', view);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Your stack, top to bottom: ' + resolved.slice().reverse().map(function (r) { return r.product.title; }).join(', '));
      } else {
        view.innerHTML = '<p class="builder-empty">Pick a ring below, or start from one of our stacks.</p>';
      }
      countEl.textContent = resolved.length + ' of ' + MAX_STACK + ' rings';
      totalEl.textContent = money(stackTotal(resolved));

      // List shows the top of the finger first, matching the picture
      list.innerHTML = state.rings.map(function (r, i) { return { r: r, i: i }; }).reverse().map(function (o) {
        var p = by[o.r.handle], ms = metalsOf(p);
        return '<li data-i="' + o.i + '"><img src="' + esc(imageFor(p, o.r.metal)) + '" alt="">' +
          '<div class="name">' + esc(p.title) + '<small>' + esc(Art.METALS[o.r.metal].name) + '</small></div>' +
          '<div class="swatches" role="group" aria-label="Metal for ' + esc(p.title) + '">' + ms.map(function (m) {
            return '<button type="button" class="swatch" data-set-metal="' + m.key + '" data-metal="' + m.key + '" aria-pressed="' + (m.key === o.r.metal) + '" aria-label="' + esc(m.value) + '"></button>';
          }).join('') + '</div>' +
          '<div class="row-tools"><button type="button" data-move="1" aria-label="Move up"' + (o.i === state.rings.length - 1 ? ' disabled' : '') + '>' + ICON.up + '</button>' +
          '<button type="button" data-move="-1" aria-label="Move down"' + (o.i === 0 ? ' disabled' : '') + '>' + ICON.down + '</button>' +
          '<button type="button" data-remove aria-label="Remove ' + esc(p.title) + '">' + ICON.x + '</button></div></li>';
      }).join('');

      $$('[data-pick]', picker).forEach(function (b) { b.disabled = state.rings.length >= MAX_STACK; });
      addBtn.disabled = !state.rings.length;
    }

    $('[data-presets]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-preset]');
      if (b) state.rings = resolveStack(stacks[b.getAttribute('data-preset')].rings, by).map(function (r) { return { handle: r.product.handle, metal: r.metal }; });
      if (e.target.closest('[data-clear]')) state.rings = [];
      if (b || e.target.closest('[data-clear]')) { status.textContent = ''; render(); }
    });
    picker.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]');
      if (!b || state.rings.length >= MAX_STACK) return;
      var last = state.rings[state.rings.length - 1];
      state.rings.push({ handle: b.getAttribute('data-pick'), metal: last ? last.metal : 'yellow' });
      render();
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('[data-i]'); if (!li) return;
      var i = parseInt(li.getAttribute('data-i'), 10);
      var m = e.target.closest('[data-set-metal]'), mv = e.target.closest('[data-move]');
      if (m) state.rings[i].metal = m.getAttribute('data-set-metal');
      else if (mv && !mv.disabled) {
        var j = i + parseInt(mv.getAttribute('data-move'), 10);
        var tmp = state.rings[i]; state.rings[i] = state.rings[j]; state.rings[j] = tmp;
      } else if (e.target.closest('[data-remove]')) state.rings.splice(i, 1);
      else return;
      render();
    });
    sizeSel.addEventListener('change', function () { state.size = sizeSel.value; status.textContent = ''; save(); });

    addBtn.addEventListener('click', function () {
      status.removeAttribute('data-tone');
      if (sizeOpt && !state.size) {
        status.setAttribute('data-tone', 'error');
        status.textContent = 'Choose a ring size first. Every ring in the stack uses the same size.';
        sizeSel.focus();
        return;
      }
      var items = [], missing = [];
      state.rings.forEach(function (r) {
        var p = by[r.handle];
        var extra = {}; if (sizeOpt) extra[sizeOpt.name] = state.size;
        var v = variantForMetal(p, r.metal, sizeOpt ? extra : null);
        if (!v || !v.available) missing.push(p.title);
        else items.push({ variantId: v.id, quantity: 1, attributes: [{ key: 'Stack', value: state.rings.length + '-ring stack' }] });
      });
      if (missing.length) {
        status.setAttribute('data-tone', 'error');
        status.textContent = 'Not available in size ' + state.size + ': ' + missing.join(', ') + '. Swap the metal or choose another size.';
        return;
      }
      // Merge identical rings into one line
      var merged = {};
      items.forEach(function (it) { if (merged[it.variantId]) merged[it.variantId].quantity += 1; else merged[it.variantId] = it; });
      addBtn.disabled = true;
      add(Object.keys(merged).map(function (k) { return merged[k]; }), 'Your stack is in your bag')
        .catch(function (err) { status.setAttribute('data-tone', 'error'); status.textContent = err.message; })
        .then(function () { addBtn.disabled = false; });
    });

    render();
  }

  /* ---------------- Forms without a backend yet ---------------- */
  $$('form[data-placeholder-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if ((f.getAttribute('action') || '').indexOf('YOUR_FORM_ID') === -1) return;
      e.preventDefault();
      var note = $('[data-form-note]', f.parentNode) || $('[data-form-note]', f);
      if (note) note.textContent = 'Thanks. This form is not connected yet, so nothing was sent.';
    });
  });

  /* ---------------- Boot ---------------- */
  var inits = { home: initHome, shop: initShop, product: initProduct, stack: initStack };
  if (inits[PAGE]) {
    Store.getProducts().then(inits[PAGE]).catch(function (err) {
      failMessage($('[data-grid]') || $('[data-pdp]') || $('[data-stack-view]'), err);
      if (window.console) console.error(err);
    });
  }
})();
