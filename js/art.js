/* Sé Rafi — placeholder jewelry illustrations.
   Draws product images and the ring-stack preview as SVG so the mock store
   has artwork before real photography exists. Once Shopify is connected,
   product images come from Shopify and only the stack preview uses this file. */
(function (root) {
  'use strict';

  var METALS = {
    yellow: { name: '14k Yellow Gold', hi: '#FCF1CF', mid: '#E2BA5E', lo: '#A97E2E', edge: '#7A561A' },
    white:  { name: '14k White Gold',  hi: '#FFFFFF', mid: '#D7DADE', lo: '#9EA4AC', edge: '#6E747C' },
    rose:   { name: '14k Rose Gold',   hi: '#FCE3D8', mid: '#E3A68F', lo: '#AA6651', edge: '#7B4333' }
  };
  var STONES = {
    diamond:  { hi: '#FFFFFF', mid: '#DCE5EF', lo: '#6F849C' },
    spinel:   { hi: '#F7A9C0', mid: '#B4264F', lo: '#5A0D25' },
    sapphire: { hi: '#B3CBF7', mid: '#2C50A9', lo: '#0D1D4F' }
  };

  var uid = 0;
  function id(p) { uid += 1; return p + uid; }
  function n(v) { return Math.round(v * 10) / 10; }

  function metalGrad(gid, m, dir) {
    var xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0.35"';
    return '<linearGradient id="' + gid + '" ' + xy + '>' +
      '<stop offset="0" stop-color="' + m.lo + '"/>' +
      '<stop offset=".22" stop-color="' + m.hi + '"/>' +
      '<stop offset=".48" stop-color="' + m.mid + '"/>' +
      '<stop offset=".72" stop-color="' + m.lo + '"/>' +
      '<stop offset=".9" stop-color="' + m.hi + '"/>' +
      '<stop offset="1" stop-color="' + m.mid + '"/></linearGradient>';
  }
  function darkGrad(gid, m) {
    return '<linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="' + m.edge + '"/>' +
      '<stop offset=".5" stop-color="' + m.lo + '"/>' +
      '<stop offset="1" stop-color="' + m.edge + '"/></linearGradient>';
  }
  function stoneGrad(gid, s) {
    return '<radialGradient id="' + gid + '" cx=".38" cy=".32" r=".75">' +
      '<stop offset="0" stop-color="' + s.hi + '"/>' +
      '<stop offset=".55" stop-color="' + s.mid + '"/>' +
      '<stop offset="1" stop-color="' + s.lo + '"/></radialGradient>';
  }

  // A round stone seen face-on: gradient body, facet star, glint.
  function roundStone(x, y, r, sg, rim, opacity) {
    var o = opacity == null ? 1 : opacity;
    var out = '<g opacity="' + o + '">';
    if (rim) out += '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r + rim.w) + '" fill="url(#' + rim.g + ')"/>';
    out += '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" fill="url(#' + sg + ')" stroke="#3d4a5c" stroke-opacity=".35" stroke-width="' + n(Math.max(.4, r / 18)) + '"/>';
    if (r >= 9) {
      var pts = [];
      for (var i = 0; i < 8; i++) {
        var a = (Math.PI / 4) * i + Math.PI / 8;
        var rr = i % 2 ? r * 0.42 : r * 0.92;
        pts.push(n(x + Math.cos(a) * rr) + ',' + n(y + Math.sin(a) * rr));
      }
      out += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="' + n(Math.max(.6, r / 22)) + '"/>';
      out += '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r * 0.4) + '" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="' + n(Math.max(.5, r / 26)) + '"/>';
    }
    out += '<circle cx="' + n(x - r * 0.35) + '" cy="' + n(y - r * 0.38) + '" r="' + n(Math.max(1, r * 0.18)) + '" fill="#fff" opacity=".9"/>';
    return out + '</g>';
  }

  function prongs(x, y, r, mg, size) {
    var s = size || Math.max(3, r * 0.16), out = '';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (d) {
      out += '<circle cx="' + n(x + d[0] * r * 0.72) + '" cy="' + n(y + d[1] * r * 0.72) + '" r="' + n(s) + '" fill="url(#' + mg + ')"/>';
    });
    return out;
  }

  function marquise(x, y, w, h, sg, mg) {
    var p = 'M' + n(x - w / 2) + ' ' + n(y) + ' Q' + n(x) + ' ' + n(y - h) + ' ' + n(x + w / 2) + ' ' + n(y) +
            ' Q' + n(x) + ' ' + n(y + h) + ' ' + n(x - w / 2) + ' ' + n(y) + 'Z';
    return '<path d="' + p + '" fill="url(#' + sg + ')"/>' +
      '<path d="M' + n(x - w * 0.38) + ' ' + n(y) + ' L' + n(x + w * 0.38) + ' ' + n(y) + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>' +
      '<path d="' + p + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>' +
      '<circle cx="' + n(x - w / 2 + 3) + '" cy="' + n(y) + '" r="4" fill="url(#' + mg + ')"/>' +
      '<circle cx="' + n(x + w / 2 - 3) + '" cy="' + n(y) + '" r="4" fill="url(#' + mg + ')"/>';
  }

  function ellPt(cx, cy, rx, ry, deg) {
    var a = deg * Math.PI / 180;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  }

  function wrap(defs, body, vb) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (vb || '0 0 600 600') + '"><defs>' + defs + '</defs>' + body + '</svg>';
  }

  function shadow(fid, cx, cy, rx) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="12" fill="#1c2430" opacity=".1" filter="url(#' + fid + ')"/>';
  }
  function blurDef(fid) {
    return '<filter id="' + fid + '" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>';
  }

  /* ---------- Rings & bracelets, three-quarter view ---------- */
  var BAND = { thin: 8, band: 13, dome: 24, pave: 15, eternity: 17, twist: 13, signet: 15, solitaire: 10, marquise: 10, bezel: 11, trio: 11, cuff: 11, tennis: 14 };

  function ringFront(spec, metalKey, o) {
    o = o || {};
    var m = METALS[metalKey] || METALS.yellow;
    var s = STONES[spec.stone] || STONES.diamond;
    var style = spec.style;
    var cx = 300, cy = o.cy || 330, rx = o.rx || 205, ry = o.ry || 90;
    var w = BAND[style] || 12, h = Math.max(6, w * 0.55);
    var mg = id('m'), dg = id('d'), sg = id('s'), fb = id('f');
    var defs = metalGrad(mg, m) + darkGrad(dg, m) + stoneGrad(sg, s) + blurDef(fb);
    var body = shadow(fb, cx, cy + ry + 70, rx * 0.8);

    var back = 'M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + cy;
    var front = 'M' + (cx + rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx - rx) + ' ' + cy;
    var frontL = 'M' + (cx + rx) + ' ' + (cy + h) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx - rx) + ' ' + (cy + h);
    var backL = 'M' + (cx - rx) + ' ' + (cy + h) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + (cy + h);

    // back half (inside of band shows)
    body += '<path d="' + backL + '" fill="none" stroke="url(#' + dg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
    body += '<path d="' + back + '" fill="none" stroke="url(#' + mg + ')" stroke-width="' + w + '" stroke-linecap="round" opacity=".85"/>';

    if (style === 'eternity' || style === 'tennis') {
      var rr = style === 'tennis' ? 9 : 7.2;
      for (var a = 190; a <= 350; a += 13) {
        var p = ellPt(cx, cy, rx, ry, a);
        body += roundStone(p[0], p[1], rr * 0.85, sg, null, .75);
      }
    }
    if (style === 'twist') {
      body += '<path d="' + back + '" fill="none" stroke="' + m.edge + '" stroke-opacity=".5" stroke-width="' + w + '" stroke-dasharray="2 9"/>';
    }

    // head at the top of the ring
    var top = cy - ry;
    if (style === 'solitaire') {
      body += '<path d="M' + (cx - 14) + ' ' + top + ' L' + (cx - 20) + ' ' + (top - 34) + ' M' + (cx + 14) + ' ' + top + ' L' + (cx + 20) + ' ' + (top - 34) + '" stroke="url(#' + mg + ')" stroke-width="5" stroke-linecap="round"/>';
      body += roundStone(cx, top - 44, 36, sg);
      body += prongs(cx, top - 44, 36, mg, 5);
    } else if (style === 'marquise') {
      body += marquise(cx, top - 16, 104, 34, sg, mg);
    } else if (style === 'bezel') {
      body += roundStone(cx, top - 10, 21, sg, { g: mg, w: 6 });
    } else if (style === 'trio') {
      [-44, 0, 44].forEach(function (dx) {
        var yy = top - 6 + Math.pow(dx / rx, 2) * ry * 1.4;
        body += roundStone(cx + dx, yy, 15, sg, { g: mg, w: 5 });
      });
    } else if (style === 'signet') {
      body += '<ellipse cx="' + cx + '" cy="' + (top - 4) + '" rx="54" ry="30" fill="url(#' + dg + ')"/>';
      body += '<ellipse cx="' + cx + '" cy="' + (top - 9) + '" rx="52" ry="28" fill="url(#' + mg + ')"/>';
      body += '<text x="' + cx + '" y="' + (top + 1) + '" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="28" fill="' + m.edge + '" fill-opacity=".7">SR</text>';
    }

    // front half: lower edge for depth, then the face
    if (style === 'cuff') {
      var gapA = 'M' + (cx + rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ',
          g1 = ellPt(cx, cy, rx, ry, 80), g2 = ellPt(cx, cy, rx, ry, 100);
      body += '<path d="' + gapA + n(g1[0]) + ' ' + n(g1[1]) + '" fill="none" stroke="url(#' + mg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
      body += '<path d="M' + n(g2[0]) + ' ' + n(g2[1]) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx - rx) + ' ' + cy + '" fill="none" stroke="url(#' + mg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
      body += '<circle cx="' + n(g1[0]) + '" cy="' + n(g1[1]) + '" r="' + (w * 0.85) + '" fill="url(#' + mg + ')"/>';
      body += '<circle cx="' + n(g2[0]) + '" cy="' + n(g2[1]) + '" r="' + (w * 0.85) + '" fill="url(#' + mg + ')"/>';
    } else {
      body += '<path d="' + frontL + '" fill="none" stroke="' + m.edge + '" stroke-width="' + w + '" stroke-linecap="round"/>';
      body += '<path d="' + front + '" fill="none" stroke="url(#' + mg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
    }

    if (style === 'twist') {
      body += '<path d="' + front + '" fill="none" stroke="' + m.edge + '" stroke-opacity=".55" stroke-width="' + w + '" stroke-dasharray="2.5 8"/>';
      body += '<path d="' + front + '" fill="none" stroke="' + m.hi + '" stroke-opacity=".8" stroke-width="' + (w * 0.5) + '" stroke-dasharray="5 5.5" stroke-dashoffset="3"/>';
    } else if (style !== 'cuff') {
      // polished highlight
      body += '<path d="M' + (cx + rx * 0.7) + ' ' + n(cy + ry * 0.72 - w * 0.2) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx - rx * 0.2) + ' ' + n(cy + ry - w * 0.22) + '" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="' + n(w * 0.16) + '" stroke-linecap="round"/>';
    }

    if (style === 'pave') {
      for (var b = 18; b <= 162; b += 7.2) {
        var q = ellPt(cx, cy, rx, ry, b);
        body += roundStone(q[0], q[1], 4.4, sg);
      }
    }
    if (style === 'eternity' || style === 'tennis') {
      var r2 = style === 'tennis' ? 9.5 : 7.4, step = style === 'tennis' ? 11 : 9.5;
      for (var c = 8; c <= 172; c += step) {
        var t = ellPt(cx, cy, rx, ry, c);
        body += roundStone(t[0], t[1], r2, sg);
        if (style === 'tennis') body += prongs(t[0], t[1], r2, mg, 1.6);
      }
    }
    return wrap(defs, body);
  }

  /* ---------- Necklaces ---------- */
  function necklace(spec, metalKey) {
    var m = METALS[metalKey] || METALS.yellow;
    var s = STONES[spec.stone] || STONES.diamond;
    var mg = id('m'), sg = id('s'), fb = id('f');
    var defs = metalGrad(mg, m) + stoneGrad(sg, s) + blurDef(fb);
    var body = '';
    function chain(d) {
      return '<path d="' + d + '" fill="none" stroke="' + m.lo + '" stroke-width="4.2" stroke-dasharray="7 2.4" stroke-linecap="round"/>' +
             '<path d="' + d + '" fill="none" stroke="' + m.hi + '" stroke-width="1.6" stroke-dasharray="4 5.6" stroke-dashoffset="1"/>';
    }
    if (spec.style === 'bar') {
      body += chain('M50 40 Q170 330 236 352') + chain('M364 352 Q430 330 550 40');
      body += '<rect x="230" y="342" width="140" height="20" rx="10" fill="url(#' + mg + ')"/>';
      for (var i = 0; i < 9; i++) body += roundStone(244 + i * 14, 352, 5.4, sg);
    } else {
      body += chain('M50 40 Q300 640 550 40');
      if (spec.style === 'pendant') {
        body += '<circle cx="300" cy="352" r="9" fill="none" stroke="url(#' + mg + ')" stroke-width="4"/>';
        body += roundStone(300, 392, 26, sg, { g: mg, w: 7 });
      } else {
        body += '<circle cx="80" cy="102" r="7" fill="none" stroke="url(#' + mg + ')" stroke-width="3.5"/>';
      }
    }
    return wrap(defs, body);
  }

  /* ---------- Earrings (pairs) ---------- */
  function earrings(spec, metalKey) {
    var m = METALS[metalKey] || METALS.yellow;
    var s = STONES[spec.stone] || STONES.diamond;
    var mg = id('m'), dg = id('d'), sg = id('s'), fb = id('f');
    var defs = metalGrad(mg, m) + darkGrad(dg, m) + stoneGrad(sg, s) + blurDef(fb);
    var body = '';
    [205, 395].forEach(function (x, k) {
      var y = k ? 318 : 282;
      if (spec.style === 'studs') {
        body += shadow(fb, x, y + 84, 40);
        body += roundStone(x, y, 46, sg);
        body += prongs(x, y, 46, mg, 6.5);
      } else {
        var thin = spec.style === 'thread-hoop';
        var rx = thin ? 74 : 52, ry = thin ? 104 : 70, w = thin ? 6 : 17;
        body += shadow(fb, x, y + ry + 50, rx * 0.8);
        body += '<path d="M' + x + ' ' + (y - ry) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + x + ' ' + (y + ry) + '" fill="none" stroke="url(#' + dg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
        body += '<path d="M' + x + ' ' + (y + ry) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + x + ' ' + (y - ry) + '" fill="none" stroke="url(#' + mg + ')" stroke-width="' + w + '" stroke-linecap="round"/>';
        if (!thin) {
          for (var a = 100; a <= 260; a += 12) {
            var p = ellPt(x, y, rx, ry, a);
            body += roundStone(p[0], p[1], 5.2, sg);
          }
        }
      }
    });
    return wrap(defs, body);
  }

  function productSVG(spec, metalKey) {
    if (spec.kind === 'necklace') return necklace(spec, metalKey);
    if (spec.kind === 'earrings') return earrings(spec, metalKey);
    if (spec.kind === 'bracelet') return ringFront(spec, metalKey, { rx: 220, ry: 92, cy: 300 });
    return ringFront(spec, metalKey);
  }

  function dataURI(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- Side-view ring stack on a hand form ---------- */
  var SIDE_H = { thin: 14, band: 20, dome: 34, pave: 23, eternity: 26, twist: 20, signet: 23, solitaire: 17, marquise: 17, bezel: 18, trio: 18 };

  // rings: [{ spec: {style, stone}, metal: 'yellow' }], bottom ring first
  function stackSVG(rings, opts) {
    opts = opts || {};
    var W = 320, H = 560, cx = W / 2;
    var formTop = 30, formBot = 530, wTop = 150, wBot = 184;
    var fg = id('form'), fb = id('f');
    var defs = '<linearGradient id="' + fg + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#9CD3DC"/><stop offset=".35" stop-color="#F3FCFD"/>' +
      '<stop offset=".7" stop-color="#D2F1F5"/><stop offset="1" stop-color="#93CBD5"/></linearGradient>' + blurDef(fb);
    function widthAt(y) { return wTop + (wBot - wTop) * ((y - formTop) / (formBot - formTop)); }
    var body = '<ellipse cx="' + cx + '" cy="' + (formBot + 14) + '" rx="140" ry="14" fill="#1c2430" opacity=".12" filter="url(#' + fb + ')"/>';
    body += '<path d="M' + (cx - wBot / 2) + ' ' + formBot + ' L' + (cx - wTop / 2) + ' ' + (formTop + wTop / 2) +
      ' A' + (wTop / 2) + ' ' + (wTop / 2) + ' 0 0 1 ' + (cx + wTop / 2) + ' ' + (formTop + wTop / 2) +
      ' L' + (cx + wBot / 2) + ' ' + formBot + ' Q' + cx + ' ' + (formBot + 12) + ' ' + (cx - wBot / 2) + ' ' + formBot + 'Z" fill="url(#' + fg + ')"/>';

    var y = opts.base || 500, sag = 11;
    rings.forEach(function (r, i) {
      var m = METALS[r.metal] || METALS.yellow;
      var s = STONES[r.spec.stone] || STONES.diamond;
      var style = r.spec.style;
      var h = SIDE_H[style] || 12;
      var top = y - h;
      var half = widthAt(top) / 2 + 9;
      var x0 = cx - half, x1 = cx + half;
      var mg = id('m'), sg = id('s');
      var g = '<g class="stack-ring" style="--i:' + i + '"><defs>' + metalGrad(mg, m, 'v').replace('<stop offset="0" stop-color="' + m.lo + '"/>', '<stop offset="0" stop-color="' + m.mid + '"/>') + stoneGrad(sg, s) + '</defs>';
      var d = 'M' + n(x0) + ' ' + n(top) + ' Q' + cx + ' ' + n(top + sag) + ' ' + n(x1) + ' ' + n(top) +
              ' L' + n(x1) + ' ' + n(y) + ' Q' + cx + ' ' + n(y + sag) + ' ' + n(x0) + ' ' + n(y) + 'Z';
      g += '<path d="' + d + '" fill="url(#' + mg + ')" stroke="' + m.edge + '" stroke-opacity=".45" stroke-width=".8"/>';
      var mid = top + h / 2 + sag / 2;
      if (style === 'twist') {
        for (var tx = x0 + 5; tx < x1 - 4; tx += 9) {
          var tt = (tx + 3.5 - x0) / (x1 - x0), off = 4 * tt * (1 - tt) * sag;
          g += '<path d="M' + n(tx) + ' ' + n(top + off + 1) + ' l7 ' + n(h - 2) + '" stroke="' + m.edge + '" stroke-opacity=".45" stroke-width="2.2"/>';
        }
      }
      if (style === 'pave' || style === 'eternity') {
        var rr = style === 'pave' ? 5 : 7, step = rr * 2.25;
        for (var px = x0 + rr + 3; px <= x1 - rr - 3; px += step) {
          var t = (px - x0) / (x1 - x0), yy = mid + (4 * t * (1 - t) - 1) * sag * 0.5 + sag * 0.0;
          g += roundStone(px, yy, rr, sg);
        }
      }
      if (style === 'solitaire') g += roundStone(cx, mid - 6, 24, sg) + prongs(cx, mid - 6, 24, mg, 4);
      if (style === 'bezel') g += roundStone(cx, mid, 13, sg, { g: mg, w: 4.5 });
      if (style === 'trio') [-28, 0, 28].forEach(function (dx) { g += roundStone(cx + dx, mid, 9.5, sg, { g: mg, w: 3.5 }); });
      if (style === 'marquise') g += marquise(cx, mid - 1, 74, 24, sg, mg);
      if (style === 'signet') g += '<ellipse cx="' + cx + '" cy="' + n(mid) + '" rx="34" ry="18" fill="url(#' + mg + ')" stroke="' + m.edge + '" stroke-opacity=".5"/>';
      g += '</g>';
      body += g;
      y = top - 3;
    });
    // Frame the lower part of the form, where the rings sit
    return wrap(defs, body, '0 150 ' + W + ' ' + (H - 150));
  }

  root.SerafiArt = { METALS: METALS, productSVG: productSVG, stackSVG: stackSVG, dataURI: dataURI };
})(typeof window !== 'undefined' ? window : globalThis);
