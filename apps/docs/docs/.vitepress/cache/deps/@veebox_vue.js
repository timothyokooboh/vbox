import {
  cloneVNode,
  computed,
  createBlock,
  defineComponent,
  inject,
  isVNode,
  mergeProps,
  normalizeClass,
  normalizeProps,
  openBlock,
  ref,
  renderSlot,
  resolveDynamicComponent,
  unref,
  useAttrs,
  useId,
  useSlots,
  watchEffect,
  withCtx
} from "./chunk-WVT526FA.js";

// ../../node_modules/.pnpm/@veebox+vue@0.0.10_vue@3.5.25_typescript@5.9.3_/node_modules/@veebox/vue/dist/index.es.js
var n0 = /* @__PURE__ */ new Map();
var a0 = (e, o) => {
  const t = `${e}::${o}`;
  if (n0.has(t)) return n0.get(t);
  const c = CSS.supports(`${e}: ${o}`);
  return n0.set(t, c), c;
};
var te = (e) => {
  try {
    return document.createDocumentFragment().querySelector(e), true;
  } catch {
    return false;
  }
};
var U = (e) => Object.prototype.toString.call(e) === "[object Object]";
var D = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var ce = (e) => e.replace(
  /([A-Za-z])\-([a-z])/g,
  (o, t, c) => t + c.toUpperCase()
);
var re = {
  cl: "color",
  fs: "font-size",
  fw: "font-weight",
  ff: "font-family",
  lh: "line-height",
  ls: "letter-spacing",
  sp: "spacing",
  br: "border-radius",
  bs: "box-shadow",
  z: "z-index"
};
var ne = /\b(cl|fs|fw|ff|lh|ls|sp|br|bs|z)-([a-zA-Z0-9-_]+)\b/g;
var i0 = (e) => !e || typeof e != "string" ? e : e.replace(
  ne,
  (o, t, c, r, s) => {
    const l = re[t], n = s.lastIndexOf("var(", r);
    if (n !== -1) {
      const a = s.indexOf(")", n);
      if (a !== -1 && a >= r + o.length - 1)
        return o;
    }
    return l ? `var(--${l}-${c})` : o;
  }
);
var M = true;
var $0 = /* @__PURE__ */ new Map();
var J = (e, o) => {
  const t = $0.get(e);
  if (t) return t;
  const c = ce(e), r = o[c] ?? c;
  return $0.set(e, r), r;
};
var E = (e, o) => {
  let t = {};
  const c = {};
  if (!e || !U(e))
    return { rootStyleRecord: t, nestedStyleRecord: c };
  for (const [r, s] of Object.entries(e))
    if (U(s)) {
      if (!te(r))
        continue;
      let l = {};
      for (const [n, a] of Object.entries(s)) {
        const h = D(
          n
        );
        let i = String(a);
        h === "content" && !/^['"]/.test(i) && (i = `"${i}"`);
        const m = i0(i), k = J(h, o), f = D(k);
        a0(f, m) && (l[f] = m);
      }
      c[r] = l;
    } else {
      const l = D(
        r
      );
      let n = String(s);
      l === "content" && !/^['"]/.test(n) && (n = `"${n}"`);
      const a = i0(n), h = J(l, o), i = D(h);
      a0(i, a) && (t[i] = a);
    }
  return { rootStyleRecord: t, nestedStyleRecord: c };
};
var w0 = (e, o, t) => {
  if (!e) return;
  const c = {}, r = {};
  for (const [s, l] of Object.entries(e)) {
    if (!s.startsWith("@media ")) {
      M && console.warn(
        `[VBox] Invalid mq key "${s}". It must start with "@media".`
      );
      continue;
    }
    const { rootStyleRecord: n, nestedStyleRecord: a } = E(
      l,
      o
    );
    c[s] = n;
    for (const [h, i] of Object.entries(a))
      r[`mbp::${s}::${h}`] = i;
  }
  return {
    customMediaQueries: c,
    selectorBlocks: r
  };
};
var v0 = (e, o, t) => {
  if (!e) return;
  const c = {}, r = {};
  for (const [s, l] of Object.entries(e)) {
    if (!s.startsWith("@container ")) {
      M && console.warn(
        `[VBox] Invalid cq key "${s}". It must start with "@container".`
      );
      continue;
    }
    const { rootStyleRecord: n, nestedStyleRecord: a } = E(
      l,
      o
    );
    c[s] = n;
    for (const [h, i] of Object.entries(a))
      r[`cbp::${s}::${h}`] = i;
  }
  return {
    containerQueries: c,
    selectorBlocks: r
  };
};
var se = ({
  obj: e,
  aliases: o,
  className: t,
  breakpoints: c
}) => {
  let r = {};
  const s = {}, l = {}, n = {};
  let a = {}, h = {}, i = {};
  for (const [m, k] of Object.entries(e)) {
    if (!k) continue;
    const f = J(m, o), $ = D(
      f
    ), w = String(k), O = i0(w), B = J($, o), S = D(B);
    if (a0(S, O) && (r[S] = O), f === "declarations") {
      const { rootStyleRecord: b, nestedStyleRecord: z } = E(
        k,
        o
      );
      Object.assign(r, b);
      for (const [j, y] of Object.entries(z))
        i[j] = y;
      continue;
    }
    if (f === "dark" && typeof k == "object") {
      const { rootStyleRecord: b, nestedStyleRecord: z } = E(
        k,
        o
      );
      Object.assign(s, b);
      for (const [j, y] of Object.entries(z))
        i[`dark::${j}`] = y;
      continue;
    }
    if ([
      "hover",
      "focus",
      "focusVisible",
      "focusWithin",
      "active",
      "_disabled"
    ].includes(f)) {
      const b = f === "_disabled" ? f.slice(1) : f;
      if (typeof k == "object") {
        const { rootStyleRecord: z, nestedStyleRecord: j } = E(
          k,
          o
        );
        l[b] = z;
        for (const [y, d] of Object.entries(j)) {
          const t0 = y.includes("&") ? y.replace(/&/g, `.${t}:${b}`) : `.${t}:${b} ${y}`;
          i[t0] = d;
        }
      }
      continue;
    }
    if (f === "pseudos" && typeof k == "object") {
      for (const [b, z] of Object.entries(k)) {
        if (!b.startsWith(":")) {
          M && console.warn(
            `[VBox] Invalid pseudo selector "${b}". It must start with ":" or "::"`
          );
          continue;
        }
        const { rootStyleRecord: j, nestedStyleRecord: y } = E(
          z,
          o
        );
        l[b] = j;
        for (const [d, t0] of Object.entries(y)) {
          const q0 = d.includes("&") ? d.replace(/&/g, `.${t}${b}`) : `.${t}${b} ${d}`;
          i[q0] = t0;
        }
      }
      continue;
    }
    if (f === "mq") {
      a = {
        ...a,
        ...w0(k, o)?.customMediaQueries
      }, i = {
        ...i,
        ...w0(k, o)?.selectorBlocks
      };
      continue;
    }
    if (f === "cq") {
      h = {
        ...h,
        ...v0(k, o)?.containerQueries
      }, i = {
        ...i,
        ...v0(k, o)?.selectorBlocks
      };
      continue;
    }
    if (["sm", "md", "lg", "xl", "2xl"].includes(f)) {
      const b = f;
      if (typeof k == "object") {
        const { rootStyleRecord: z, nestedStyleRecord: j } = E(
          k,
          o
        );
        n[c[b]] = z;
        for (const [y, d] of Object.entries(j))
          i[`bp::${c[b]}::${y}`] = d;
      }
      continue;
    }
  }
  return {
    rootStyles: r,
    rootDarkStyles: s,
    pseudoStyles: l,
    breakpointStyles: n,
    customMediaQueries: a,
    containerQueries: h,
    selectorBlocks: i
  };
};
var A = (e) => Object.entries(e).map(([o, t]) => `${o}: ${t};`).join(" ");
var le = ({
  rootStyles: e,
  rootDarkStyles: o,
  pseudoStyles: t,
  selectorBlocks: c,
  breakpointStyles: r,
  customMediaQueries: s,
  containerQueries: l,
  className: n
}) => {
  let a = `.${n} { ${A(e)} }`;
  U(o) && Object.keys(o).length > 0 && (a += `
html.dark { .${n} { ${A(o)} } }`);
  for (const [h, i] of Object.entries(t)) {
    const m = h.startsWith(":") ? "" : ":";
    a += `
.${n}${m}${D(h)} { ${A(i)} }`;
    for (const [k, f] of Object.entries(c))
      k.startsWith(`.${n}${m}${h}`) && (a += `
${k} { ${A(f)} }`);
  }
  for (const [h, i] of Object.entries(r))
    a += `
@media (min-width: ${h}) { .${n} { ${A(i)} } }`;
  for (const [h, i] of Object.entries(s))
    a += `
${h} { .${n} { ${A(i)} } }`;
  for (const [h, i] of Object.entries(l))
    a += `
${h} { .${n} { ${A(i)} } }`;
  for (const [h, i] of Object.entries(c)) {
    const m = Object.entries(i).map(([f, $]) => {
      const w = D(f);
      let O = String($);
      return w === "content" && !/^['"]/.test(O) && (O = `"${O}"`), `${w}: ${O};`;
    }).join(" "), k = h.includes("&") ? h.replace(/&/g, `.${n}`) : `.${n} ${h}`;
    if (!/^[\s\S]*\S[\s\S]*$/.test(k)) {
      M && console.warn(`[VBox] Skipping invalid selector: "${h}"`);
      continue;
    }
    if (k.startsWith("bp::")) {
      const [, f, $] = k.split("::");
      a += `
@media (min-width: ${f}) { ${$} { ${m} } }`;
    } else if (k.startsWith("mbp::")) {
      const [, f, $] = k.split("::");
      a += `
${f} { ${$} { ${m} } }`;
    } else if (k.startsWith("cbp::")) {
      const [, f, $] = k.split("::");
      a += `
${f} { ${$} { ${m} } }`;
    } else if (k.startsWith("dark::")) {
      const [, f] = k.split("::");
      a += `
html.dark { ${f} { ${m} } }`;
    } else
      a += `
${k} { ${m} }`;
  }
  return a;
};
var g = "-ms-";
var F = "-moz-";
var p = "-webkit-";
var B0 = "comm";
var f0 = "rule";
var d0 = "decl";
var ae = "@import";
var ie = "@namespace";
var R0 = "@keyframes";
var he = "@layer";
var C0 = Math.abs;
var p0 = String.fromCharCode;
var h0 = Object.assign;
function ue(e, o) {
  return x(e, 0) ^ 45 ? (((o << 2 ^ x(e, 0)) << 2 ^ x(e, 1)) << 2 ^ x(e, 2)) << 2 ^ x(e, 3) : 0;
}
function I0(e) {
  return e.trim();
}
function W(e, o) {
  return (e = o.exec(e)) ? e[0] : e;
}
function u(e, o, t) {
  return e.replace(o, t);
}
function Z(e, o, t) {
  return e.indexOf(o, t);
}
function x(e, o) {
  return e.charCodeAt(o) | 0;
}
function _(e, o, t) {
  return e.slice(o, t);
}
function C(e) {
  return e.length;
}
function M0(e) {
  return e.length;
}
function q(e, o) {
  return o.push(e), e;
}
function ke(e, o) {
  return e.map(o).join("");
}
function S0(e, o) {
  return e.filter(function(t) {
    return !W(t, o);
  });
}
var Y = 1;
var H = 1;
var W0 = 0;
var R = 0;
var v = 0;
var P = "";
function e0(e, o, t, c, r, s, l, n) {
  return { value: e, root: o, parent: t, type: c, props: r, children: s, line: Y, column: H, length: l, return: "", siblings: n };
}
function N(e, o) {
  return h0(e0("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, o);
}
function Q(e) {
  for (; e.root; )
    e = N(e.root, { children: [e] });
  q(e, e.siblings);
}
function fe() {
  return v;
}
function de() {
  return v = R > 0 ? x(P, --R) : 0, H--, v === 10 && (H = 1, Y--), v;
}
function I() {
  return v = R < W0 ? x(P, R++) : 0, H++, v === 10 && (H = 1, Y++), v;
}
function V() {
  return x(P, R);
}
function K() {
  return R;
}
function o0(e, o) {
  return _(P, e, o);
}
function T(e) {
  switch (e) {
    // \0 \t \n \r \s whitespace token
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    // ! + , / > @ ~ isolate token
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    // ; { } breakpoint token
    case 59:
    case 123:
    case 125:
      return 4;
    // : accompanied token
    case 58:
      return 3;
    // " ' ( [ opening delimit token
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    // ) ] closing delimit token
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function pe(e) {
  return Y = H = 1, W0 = C(P = e), R = 0, [];
}
function me(e) {
  return P = "", e;
}
function s0(e) {
  return I0(o0(R - 1, u0(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function be(e) {
  for (; (v = V()) && v < 33; )
    I();
  return T(e) > 2 || T(v) > 3 ? "" : " ";
}
function ge(e, o) {
  for (; --o && I() && !(v < 48 || v > 102 || v > 57 && v < 65 || v > 70 && v < 97); )
    ;
  return o0(e, K() + (o < 6 && V() == 32 && I() == 32));
}
function u0(e) {
  for (; I(); )
    switch (v) {
      // ] ) " '
      case e:
        return R;
      // " '
      case 34:
      case 39:
        e !== 34 && e !== 39 && u0(v);
        break;
      // (
      case 40:
        e === 41 && u0(e);
        break;
      // \
      case 92:
        I();
        break;
    }
  return R;
}
function ye(e, o) {
  for (; I() && e + v !== 57 && !(e + v === 84 && V() === 47); )
    ;
  return "/*" + o0(o, R - 1) + "*" + p0(e === 47 ? e : I());
}
function $e(e) {
  for (; !T(V()); )
    I();
  return o0(e, R);
}
function we(e) {
  return me(L("", null, null, null, [""], e = pe(e), 0, [0], e));
}
function L(e, o, t, c, r, s, l, n, a) {
  for (var h = 0, i = 0, m = l, k = 0, f = 0, $ = 0, w = 1, O = 1, B = 1, S = 0, b = "", z = r, j = s, y = c, d = b; O; )
    switch ($ = S, S = I()) {
      // (
      case 40:
        if ($ != 108 && x(d, m - 1) == 58) {
          Z(d += u(s0(S), "&", "&\f"), "&\f", C0(h ? n[h - 1] : 0)) != -1 && (B = -1);
          break;
        }
      // " ' [
      case 34:
      case 39:
      case 91:
        d += s0(S);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        d += be($);
        break;
      // \
      case 92:
        d += ge(K() - 1, 7);
        continue;
      // /
      case 47:
        switch (V()) {
          case 42:
          case 47:
            q(ve(ye(I(), K()), o, t, a), a), (T($ || 1) == 5 || T(V() || 1) == 5) && C(d) && _(d, -1, void 0) !== " " && (d += " ");
            break;
          default:
            d += "/";
        }
        break;
      // {
      case 123 * w:
        n[h++] = C(d) * B;
      // } ; \0
      case 125 * w:
      case 59:
      case 0:
        switch (S) {
          // \0 }
          case 0:
          case 125:
            O = 0;
          // ;
          case 59 + i:
            B == -1 && (d = u(d, /\f/g, "")), f > 0 && (C(d) - m || w === 0 && $ === 47) && q(f > 32 ? j0(d + ";", c, t, m - 1, a) : j0(u(d, " ", "") + ";", c, t, m - 2, a), a);
            break;
          // @ ;
          case 59:
            d += ";";
          // { rule/at-rule
          default:
            if (q(y = x0(d, o, t, h, i, r, n, b, z = [], j = [], m, s), s), S === 123)
              if (i === 0)
                L(d, o, y, y, z, s, m, n, j);
              else {
                switch (k) {
                  // c(ontainer)
                  case 99:
                    if (x(d, 3) === 110) break;
                  // l(ayer)
                  case 108:
                    if (x(d, 2) === 97) break;
                  default:
                    i = 0;
                  // d(ocument) m(edia) s(upports)
                  case 100:
                  case 109:
                  case 115:
                }
                i ? L(e, y, y, c && q(x0(e, y, y, 0, 0, r, n, b, r, z = [], m, j), j), r, j, m, n, c ? z : j) : L(d, y, y, y, [""], j, 0, n, j);
              }
        }
        h = i = f = 0, w = B = 1, b = d = "", m = l;
        break;
      // :
      case 58:
        m = 1 + C(d), f = $;
      default:
        if (w < 1) {
          if (S == 123)
            --w;
          else if (S == 125 && w++ == 0 && de() == 125)
            continue;
        }
        switch (d += p0(S), S * w) {
          // &
          case 38:
            B = i > 0 ? 1 : (d += "\f", -1);
            break;
          // ,
          case 44:
            n[h++] = (C(d) - 1) * B, B = 1;
            break;
          // @
          case 64:
            V() === 45 && (d += s0(I())), k = V(), i = m = C(b = d += $e(K())), S++;
            break;
          // -
          case 45:
            $ === 45 && C(d) == 2 && (w = 0);
        }
    }
  return s;
}
function x0(e, o, t, c, r, s, l, n, a, h, i, m) {
  for (var k = r - 1, f = r === 0 ? s : [""], $ = M0(f), w = 0, O = 0, B = 0; w < c; ++w)
    for (var S = 0, b = _(e, k + 1, k = C0(O = l[w])), z = e; S < $; ++S)
      (z = I0(O > 0 ? f[S] + " " + b : u(b, /&\f/g, f[S]))) && (a[B++] = z);
  return e0(e, o, t, r === 0 ? f0 : n, a, h, i, m);
}
function ve(e, o, t, c) {
  return e0(e, o, t, B0, p0(fe()), _(e, 2, -2), 0, c);
}
function j0(e, o, t, c, r) {
  return e0(e, o, t, d0, _(e, 0, c), _(e, c + 1, -1), c, r);
}
function N0(e, o, t) {
  switch (ue(e, o)) {
    // color-adjust
    case 5103:
      return p + "print-" + e + e;
    // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
    // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
      return p + e + e;
    // mask-composite
    case 4855:
      return p + e.replace("add", "source-over").replace("substract", "source-out").replace("intersect", "source-in").replace("exclude", "xor") + e;
    // tab-size
    case 4789:
      return F + e + e;
    // appearance, user-select, transform, hyphens, text-size-adjust
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return p + e + F + e + g + e + e;
    // writing-mode
    case 5936:
      switch (x(e, o + 11)) {
        // vertical-l(r)
        case 114:
          return p + e + g + u(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        // vertical-r(l)
        case 108:
          return p + e + g + u(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        // horizontal(-)tb
        case 45:
          return p + e + g + u(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
    // flex, flex-direction, scroll-snap-type, writing-mode
    case 6828:
    case 4268:
    case 2903:
      return p + e + g + e + e;
    // order
    case 6165:
      return p + e + g + "flex-" + e + e;
    // align-items
    case 5187:
      return p + e + u(e, /(\w+).+(:[^]+)/, p + "box-$1$2" + g + "flex-$1$2") + e;
    // align-self
    case 5443:
      return p + e + g + "flex-item-" + u(e, /flex-|-self/g, "") + (W(e, /flex-|baseline/) ? "" : g + "grid-row-" + u(e, /flex-|-self/g, "")) + e;
    // align-content
    case 4675:
      return p + e + g + "flex-line-pack" + u(e, /align-content|flex-|-self/g, "") + e;
    // flex-shrink
    case 5548:
      return p + e + g + u(e, "shrink", "negative") + e;
    // flex-basis
    case 5292:
      return p + e + g + u(e, "basis", "preferred-size") + e;
    // flex-grow
    case 6060:
      return p + "box-" + u(e, "-grow", "") + p + e + g + u(e, "grow", "positive") + e;
    // transition
    case 4554:
      return p + u(e, /([^-])(transform)/g, "$1" + p + "$2") + e;
    // cursor
    case 6187:
      return u(u(u(e, /(zoom-|grab)/, p + "$1"), /(image-set)/, p + "$1"), e, "") + e;
    // background, background-image
    case 5495:
    case 3959:
      return u(e, /(image-set\([^]*)/, p + "$1$`$1");
    // justify-content
    case 4968:
      return u(u(e, /(.+:)(flex-)?(.*)/, p + "box-pack:$3" + g + "flex-pack:$3"), /space-between/, "justify") + p + e + e;
    // justify-self
    case 4200:
      if (!W(e, /flex-|baseline/)) return g + "grid-column-align" + _(e, o) + e;
      break;
    // grid-template-(columns|rows)
    case 2592:
    case 3360:
      return g + u(e, "template-", "") + e;
    // grid-(row|column)-start
    case 4384:
    case 3616:
      return t && t.some(function(c, r) {
        return o = r, W(c.props, /grid-\w+-end/);
      }) ? ~Z(e + (t = t[o].value), "span", 0) ? e : g + u(e, "-start", "") + e + g + "grid-row-span:" + (~Z(t, "span", 0) ? W(t, /\d+/) : +W(t, /\d+/) - +W(e, /\d+/)) + ";" : g + u(e, "-start", "") + e;
    // grid-(row|column)-end
    case 4896:
    case 4128:
      return t && t.some(function(c) {
        return W(c.props, /grid-\w+-start/);
      }) ? e : g + u(u(e, "-end", "-span"), "span ", "") + e;
    // (margin|padding)-inline-(start|end)
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return u(e, /(.+)-inline(.+)/, p + "$1$2") + e;
    // (min|max)?(width|height|inline-size|block-size)
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (C(e) - 1 - o > 6)
        switch (x(e, o + 1)) {
          // (m)ax-content, (m)in-content
          case 109:
            if (x(e, o + 4) !== 45)
              break;
          // (f)ill-available, (f)it-content
          case 102:
            return u(e, /(.+:)(.+)-([^]+)/, "$1" + p + "$2-$3$1" + F + (x(e, o + 3) == 108 ? "$3" : "$2-$3")) + e;
          // (s)tretch
          case 115:
            return ~Z(e, "stretch", 0) ? N0(u(e, "stretch", "fill-available"), o, t) + e : e;
        }
      break;
    // grid-(column|row)
    case 5152:
    case 5920:
      return u(e, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(c, r, s, l, n, a, h) {
        return g + r + ":" + s + h + (l ? g + r + "-span:" + (n ? a : +a - +s) + h : "") + e;
      });
    // position: sticky
    case 4949:
      if (x(e, o + 6) === 121)
        return u(e, ":", ":" + p) + e;
      break;
    // display: (flex|inline-flex|grid|inline-grid)
    case 6444:
      switch (x(e, x(e, 14) === 45 ? 18 : 11)) {
        // (inline-)?fle(x)
        case 120:
          return u(e, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + p + (x(e, 14) === 45 ? "inline-" : "") + "box$3$1" + p + "$2$3$1" + g + "$2box$3") + e;
        // (inline-)?gri(d)
        case 100:
          return u(e, ":", ":" + g) + e;
      }
      break;
    // scroll-margin, scroll-margin-(top|right|bottom|left)
    case 5719:
    case 2647:
    case 2135:
    case 3927:
    case 2391:
      return u(e, "scroll-", "scroll-snap-") + e;
  }
  return e;
}
function X(e, o) {
  for (var t = "", c = 0; c < e.length; c++)
    t += o(e[c], c, e, o) || "";
  return t;
}
function Se(e, o, t, c) {
  switch (e.type) {
    case he:
      if (e.children.length) break;
    case ae:
    case ie:
    case d0:
      return e.return = e.return || e.value;
    case B0:
      return "";
    case R0:
      return e.return = e.value + "{" + X(e.children, c) + "}";
    case f0:
      if (!C(e.value = e.props.join(","))) return "";
  }
  return C(t = X(e.children, c)) ? e.return = e.value + "{" + t + "}" : "";
}
function xe(e) {
  var o = M0(e);
  return function(t, c, r, s) {
    for (var l = "", n = 0; n < o; n++)
      l += e[n](t, c, r, s) || "";
    return l;
  };
}
function je(e, o, t, c) {
  if (e.length > -1 && !e.return)
    switch (e.type) {
      case d0:
        e.return = N0(e.value, e.length, t);
        return;
      case R0:
        return X([N(e, { value: u(e.value, "@", "@" + p) })], c);
      case f0:
        if (e.length)
          return ke(t = e.props, function(r) {
            switch (W(r, c = /(::plac\w+|:read-\w+)/)) {
              // :read-(only|write)
              case ":read-only":
              case ":read-write":
                Q(N(e, { props: [u(r, /:(read-\w+)/, ":" + F + "$1")] })), Q(N(e, { props: [r] })), h0(e, { props: S0(t, c) });
                break;
              // :placeholder
              case "::placeholder":
                Q(N(e, { props: [u(r, /:(plac\w+)/, ":" + p + "input-$1")] })), Q(N(e, { props: [u(r, /:(plac\w+)/, ":" + F + "$1")] })), Q(N(e, { props: [u(r, /:(plac\w+)/, g + "input-$1")] })), Q(N(e, { props: [r] })), h0(e, { props: S0(t, c) });
                break;
            }
            return "";
          });
    }
}
var l0 = /* @__PURE__ */ new Map();
var z0 = (e) => {
  if (l0.has(e)) return l0.get(e);
  const o = X(
    we(e),
    xe([je, Se])
  );
  return l0.set(e, o), o;
};
var k0 = (e) => {
  if (typeof window > "u") return;
  const o = "vbox-style-sheet";
  let t = document.getElementById(o);
  if (t) {
    const r = z0(e);
    t.textContent += r;
    return;
  }
  t = document.createElement("style"), t.id = o;
  const c = z0(e);
  t.textContent += c, document.head.appendChild(t);
};
var D0 = (e = {}, o) => {
  if (!o) return { ...e };
  const t = { ...e };
  for (const c of Object.keys(o)) {
    const r = e[c], s = o[c];
    U(r) && U(s) ? t[c] = D0(r, s) : t[c] = s;
  }
  return t;
};
var ze = [
  "color",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "letterSpacing",
  "spacing",
  "borderRadius",
  "boxShadow",
  "zIndex"
];
var G = (e) => typeof e == "string" && e.startsWith("$");
var V0 = (e) => e ? e.replace(/^\$/, "").split(".") : [];
var A0 = (e, o, t = []) => {
  const c = V0(o), [r, s] = c, l = e?.[r]?.[s];
  if (l === void 0)
    return M && console.warn(`[VBox] Unknown token reference: ${o}`), o;
  const n = `${r}.${s}`;
  return t.includes(n) ? (M && console.warn(
    `[VBox] Circular token reference detected: ${[...t, n].join(" → ")}`
  ), o) : typeof l == "string" && G(l) ? A0(e, l, [...t, n]) : l;
};
var Oe = (e) => {
  const o = {}, t = {};
  for (const c of ze) {
    const r = e[c];
    if (r) {
      o[c] = {};
      for (const [s, l] of Object.entries(r))
        if (c === "color") {
          if (typeof l == "string" && !G(l)) {
            o.color[s] = l;
            continue;
          }
          if (typeof l == "string" && G(l)) {
            const n = V0(l), [, a] = n;
            o.color[s] = `var(--color-${a})`;
            continue;
          }
          if (l && typeof l == "object") {
            const n = l, a = n.default;
            if (a && typeof a == "string")
              o.color[s] = a;
            else {
              M && console.warn(`[VBox] Invalid default value for color.${s}`);
              continue;
            }
            n.dark && typeof n.dark == "string" && (t[s] = n.dark);
            continue;
          }
          M && console.warn(`[VBox] Unsupported color value for ${s}:`, l);
          continue;
        } else if (l && typeof l == "string" && G(l)) {
          const n = A0(e, l);
          o[c][s] = n;
        } else
          o[c][s] = l;
    }
  }
  return { normalized: o, colorDarkMap: t };
};
var Be = (e) => {
  const { normalized: o, colorDarkMap: t } = e;
  let c = ":root{", r = "html.dark{";
  for (const [s, l] of Object.entries(o))
    for (const [n, a] of Object.entries(l)) {
      const h = s.replace(
        /[A-Z]/g,
        (i) => `-${i.toLowerCase()}`
      );
      c += `--${h}-${n}: ${a};`, s === "color" && t[n] && (r += `--${h}-${n}: ${t[n]};`);
    }
  return c += "}", r += "}", r === "html.dark{}" ? `${c}` : `${c}
${r}`;
};
var E0 = {
  w: "width",
  maxW: "maxWidth",
  minW: "minWidth",
  h: "height",
  maxH: "maxHeight",
  minH: "minHeight",
  fs: "fontSize",
  fw: "fontWeight",
  ff: "fontFamily",
  lh: "lineHeight",
  ls: "letterSpacing",
  m: "margin",
  mt: "marginBlockStart",
  mb: "marginBlockEnd",
  ml: "marginInlineStart",
  mr: "marginInlineEnd",
  mx: "marginInline",
  my: "marginBlock",
  p: "padding",
  pt: "paddingBlockStart",
  pb: "paddingBlockEnd",
  pl: "paddingInlineStart",
  pr: "paddingInlineEnd",
  px: "paddingInline",
  py: "paddingBlock",
  bg: "background",
  bgColor: "backgroundColor",
  bgSize: "backgroundSize",
  bgPosition: "backgroundPosition",
  bgImage: "backgroundImage",
  bgClip: "backgroundClip",
  bgRepeat: "backgroundRepeat",
  bgAttachment: "backgroundAttachment",
  bgOrigin: "backgroundOrigin",
  radius: "borderRadius",
  shadow: "boxShadow"
};
var _0 = {
  sm: "40rem",
  // ~640px
  md: "48rem",
  // ~768px
  lg: "64rem",
  // ~1024px
  xl: "80rem"
  // ~1280px
  //"2xl": "96rem", // ~1536px
};
var Re = {
  color: {
    "red-50": "oklch(0.971 0.013 17.38)",
    "red-100": "oklch(0.936 0.032 17.717)",
    "red-200": " oklch(0.885 0.062 18.334)",
    "red-300": "oklch(0.808 0.114 19.571)",
    "red-400": "oklch(0.704 0.191 22.216)",
    "red-500": "oklch(0.637 0.237 25.331)",
    "red-600": "oklch(0.577 0.245 27.325)",
    "red-700": "oklch(0.505 0.213 27.518)",
    "red-800": "oklch(0.444 0.177 26.899)",
    "red-900": "oklch(0.396 0.141 25.723)",
    "red-950": "oklch(0.258 0.092 26.042)",
    "orange-50": "oklch(0.98 0.016 73.684)",
    "orange-100": " oklch(0.954 0.038 75.164)",
    "orange-200": "oklch(0.901 0.076 70.697)",
    "orange-300": "oklch(0.837 0.128 66.29)",
    "orange-400": "oklch(0.75 0.183 55.934)",
    "orange-500": "oklch(0.705 0.213 47.604)",
    "orange-600": " oklch(0.646 0.222 41.116)",
    "orange-700": " oklch(0.553 0.195 38.402)",
    "orange-800": " oklch(0.47 0.157 37.304)",
    "orange-900": " oklch(0.408 0.123 38.172)",
    "orange-950": " oklch(0.266 0.079 36.259)",
    "amber-50": "oklch(0.987 0.022 95.277)",
    "amber-100": " oklch(0.962 0.059 95.617)",
    "amber-200": " oklch(0.924 0.12 95.746)",
    "amber-300": " oklch(0.879 0.169 91.605)",
    "amber-400": " oklch(0.828 0.189 84.429)",
    "amber-500": " oklch(0.769 0.188 70.08)",
    "amber-600": "oklch(0.666 0.179 58.318)",
    "amber-700": "oklch(0.555 0.163 48.998)",
    "amber-800": " oklch(0.473 0.137 46.201)",
    "amber-900": " oklch(0.414 0.112 45.904)",
    "amber-950": " oklch(0.279 0.077 45.635)",
    "yellow-50": " oklch(0.987 0.026 102.212)",
    "yellow-100": " oklch(0.973 0.071 103.193)",
    "yellow-200": "oklch(0.945 0.129 101.54)",
    "yellow-300": " oklch(0.905 0.182 98.111)",
    "yellow-400": "oklch(0.852 0.199 91.936)",
    "yellow-500": "oklch(0.795 0.184 86.047)",
    "yellow-600": "oklch(0.681 0.162 75.834)",
    "yellow-700": "oklch(0.554 0.135 66.442)",
    "yellow-800": "oklch(0.476 0.114 61.907)",
    "yellow-900": " oklch(0.421 0.095 57.708)",
    "yellow-950": "oklch(0.286 0.066 53.813)",
    "lime-50": " oklch(0.986 0.031 120.757)",
    "lime-100": "oklch(0.967 0.067 122.328)",
    "lime-200": "oklch(0.938 0.127 124.321)",
    "lime-300": "oklch(0.897 0.196 126.665)",
    "lime-400": "oklch(0.841 0.238 128.85)",
    "lime-500": "oklch(0.768 0.233 130.85)",
    "lime-600": "oklch(0.648 0.2 131.684)",
    "lime-700": "oklch(0.532 0.157 131.589)",
    "lime-800": "oklch(0.453 0.124 130.933)",
    "lime-900": "oklch(0.405 0.101 131.063)",
    "lime-950": "oklch(0.274 0.072 132.109)",
    "green-50": "oklch(0.982 0.018 155.826)",
    "green-100": "oklch(0.962 0.044 156.743)",
    "green-200": "oklch(0.925 0.084 155.995)",
    "green-300": "oklch(0.871 0.15 154.449)",
    "green-400": "oklch(0.792 0.209 151.711)",
    "green-500": "oklch(0.723 0.219 149.579)",
    "green-600": "oklch(0.627 0.194 149.214)",
    "green-700": "oklch(0.527 0.154 150.069)",
    "green-800": "oklch(0.448 0.119 151.328)",
    "green-900": " oklch(0.393 0.095 152.535)",
    "green-950": "oklch(0.266 0.065 152.934)",
    "emerald-50": "oklch(0.979 0.021 166.113)",
    "emerald-100": "oklch(0.95 0.052 163.051)",
    "emerald-200": "oklch(0.905 0.093 164.15)",
    "emerald-300": " oklch(0.845 0.143 164.978)",
    "emerald-400": "oklch(0.765 0.177 163.223)",
    "emerald-500": " oklch(0.696 0.17 162.48)",
    "emerald-600": " oklch(0.596 0.145 163.225)",
    "emerald-700": "oklch(0.508 0.118 165.612)",
    "emerald-800": " oklch(0.432 0.095 166.913)",
    "emerald-900": "oklch(0.378 0.077 168.94)",
    "emerald-950": "oklch(0.262 0.051 172.552)",
    "teal-50": "oklch(0.984 0.014 180.72)",
    "teal-100": "oklch(0.953 0.051 180.801)",
    "teal-200": "oklch(0.91 0.096 180.426)",
    "teal-300": "oklch(0.855 0.138 181.071)",
    "teal-400": "oklch(0.777 0.152 181.912)",
    "teal-500": "oklch(0.704 0.14 182.503)",
    "teal-600": "oklch(0.6 0.118 184.704)",
    "teal-700": "oklch(0.511 0.096 186.391)",
    "teal-800": "oklch(0.437 0.078 188.216)",
    "teal-900": "oklch(0.386 0.063 188.416)",
    "teal-950": "oklch(0.277 0.046 192.524)",
    "cyan-50": "oklch(0.984 0.019 200.873)",
    "cyan-100": "oklch(0.956 0.045 203.388)",
    "cyan-200": "oklch(0.917 0.08 205.041)",
    "cyan-300": "oklch(0.865 0.127 207.078)",
    "cyan-400": "oklch(0.789 0.154 211.53)",
    "cyan-500": "oklch(0.715 0.143 215.221)",
    "cyan-600": "oklch(0.609 0.126 221.723)",
    "cyan-700": "oklch(0.52 0.105 223.128)",
    "cyan-800": "oklch(0.45 0.085 224.283)",
    "cyan-900": "oklch(0.398 0.07 227.392)",
    "cyan-950": "oklch(0.302 0.056 229.695)",
    "sky-50": "oklch(0.977 0.013 236.62)",
    "sky-100": " oklch(0.951 0.026 236.824)",
    "sky-200": "oklch(0.901 0.058 230.902)",
    "sky-300": "oklch(0.828 0.111 230.318)",
    "sky-400": "oklch(0.746 0.16 232.661)",
    "sky-500": "oklch(0.685 0.169 237.323)",
    "sky-600": "oklch(0.588 0.158 241.966)",
    "sky-700": "oklch(0.5 0.134 242.749)",
    "sky-800": "oklch(0.443 0.11 240.79)",
    "sky-900": "oklch(0.391 0.09 240.876)",
    "sky-950": "oklch(0.293 0.066 243.157)",
    "blue-50": "oklch(0.97 0.014 254.604)",
    "blue-100": "oklch(0.932 0.032 255.585)",
    "blue-200": "oklch(0.882 0.059 254.128)",
    "blue-300": "oklch(0.809 0.105 251.813)",
    "blue-400": "oklch(0.707 0.165 254.624)",
    "blue-500": "oklch(0.623 0.214 259.815)",
    "blue-600": "oklch(0.546 0.245 262.881)",
    "blue-700": "oklch(0.488 0.243 264.376)",
    "blue-800": "oklch(0.424 0.199 265.638)",
    "blue-900": "oklch(0.379 0.146 265.522)",
    "blue-950": "oklch(0.282 0.091 267.935)",
    "indigo-50": "oklch(0.962 0.018 272.314)",
    "indigo-100": "oklch(0.93 0.034 272.788)",
    "indigo-200": "oklch(0.87 0.065 274.039)",
    "indigo-300": "oklch(0.785 0.115 274.713)",
    "indigo-400": "oklch(0.673 0.182 276.935)",
    "indigo-500": "oklch(0.585 0.233 277.117)",
    "indigo-600": "oklch(0.511 0.262 276.966)",
    "indigo-700": "oklch(0.457 0.24 277.023)",
    "indigo-800": "oklch(0.398 0.195 277.366)",
    "indigo-900": "oklch(0.359 0.144 278.697)",
    "indigo-950": "oklch(0.257 0.09 281.288)",
    "violet-50": "oklch(0.969 0.016 293.756)",
    "violet-100": "oklch(0.943 0.029 294.588)",
    "violet-200": "oklch(0.894 0.057 293.283)",
    "violet-300": "oklch(0.811 0.111 293.571)",
    "violet-400": "oklch(0.702 0.183 293.541)",
    "violet-500": "oklch(0.606 0.25 292.717)",
    "violet-600": "oklch(0.541 0.281 293.009)",
    "violet-700": "oklch(0.491 0.27 292.581)",
    "violet-800": "oklch(0.432 0.232 292.759)",
    "violet-900": "oklch(0.38 0.189 293.745)",
    "violet-950": "oklch(0.283 0.141 291.089)",
    "purple-50": "oklch(0.977 0.014 308.299)",
    "purple-100": "oklch(0.946 0.033 307.174)",
    "purple-200": "oklch(0.902 0.063 306.703)",
    "purple-300": "oklch(0.827 0.119 306.383)",
    "purple-400": "oklch(0.714 0.203 305.504)",
    "purple-500": "oklch(0.627 0.265 303.9)",
    "purple-600": "oklch(0.558 0.288 302.321)",
    "purple-700": "oklch(0.496 0.265 301.924)",
    "purple-800": "oklch(0.438 0.218 303.724)",
    "purple-900": "oklch(0.381 0.176 304.987)",
    "purple-950": "oklch(0.291 0.149 302.717)",
    "fuchsia-50": "oklch(0.977 0.017 320.058)",
    "fuchsia-100": "oklch(0.952 0.037 318.852)",
    "fuchsia-200": "oklch(0.903 0.076 319.62)",
    "fuchsia-300": "oklch(0.833 0.145 321.434)",
    "fuchsia-400": " oklch(0.74 0.238 322.16)",
    "fuchsia-500": "oklch(0.667 0.295 322.15)",
    "fuchsia-600": "oklch(0.591 0.293 322.896)",
    "fuchsia-700": "oklch(0.518 0.253 323.949)",
    "fuchsia-800": "oklch(0.452 0.211 324.591)",
    "fuchsia-900": "oklch(0.401 0.17 325.612)",
    "fuchsia-950": "oklch(0.293 0.136 325.661)",
    "pink-50": "oklch(0.971 0.014 343.198)",
    "pink-100": "oklch(0.948 0.028 342.258)",
    "pink-200": "oklch(0.899 0.061 343.231)",
    "pink-300": "oklch(0.823 0.12 346.018)",
    "pink-400": "oklch(0.718 0.202 349.761)",
    "pink-500": " oklch(0.656 0.241 354.308)",
    "pink-600": "oklch(0.592 0.249 0.584)",
    "pink-700": "oklch(0.525 0.223 3.958)",
    "pink-800": " oklch(0.459 0.187 3.815)",
    "pink-900": "oklch(0.408 0.153 2.432)",
    "pink-950": "oklch(0.284 0.109 3.907)",
    "rose-50": "oklch(0.969 0.015 12.422)",
    "rose-100": "oklch(0.941 0.03 12.58)",
    "rose-200": "oklch(0.892 0.058 10.001)",
    "rose-300": "oklch(0.81 0.117 11.638)",
    "rose-400": "oklch(0.712 0.194 13.428)",
    "rose-500": "oklch(0.645 0.246 16.439)",
    "rose-600": "oklch(0.586 0.253 17.585)",
    "rose-700": "oklch(0.514 0.222 16.935)",
    "rose-800": "oklch(0.455 0.188 13.697)",
    "rose-900": "oklch(0.41 0.159 10.272)",
    "rose-950": "oklch(0.271 0.105 12.094)",
    "slate-50": "oklch(0.984 0.003 247.858)",
    "slate-100": "oklch(0.968 0.007 247.896)",
    "slate-200": "oklch(0.929 0.013 255.508)",
    "slate-300": "oklch(0.869 0.022 252.894)",
    "slate-400": "oklch(0.704 0.04 256.788)",
    "slate-500": "oklch(0.554 0.046 257.417)",
    "slate-600": "oklch(0.446 0.043 257.281)",
    "slate-700": "oklch(0.372 0.044 257.287)",
    "slate-800": "oklch(0.279 0.041 260.031)",
    "slate-900": "oklch(0.208 0.042 265.755)",
    "slate-950": "oklch(0.129 0.042 264.695)",
    "gray-50": "oklch(0.985 0.002 247.839)",
    "gray-100": "oklch(0.967 0.003 264.542)",
    "gray-200": "oklch(0.928 0.006 264.531)",
    "gray-300": "oklch(0.872 0.01 258.338)",
    "gray-400": "oklch(0.707 0.022 261.325)",
    "gray-500": "oklch(0.551 0.027 264.364)",
    "gray-600": "oklch(0.446 0.03 256.802)",
    "gray-700": "oklch(0.373 0.034 259.733)",
    "gray-800": "oklch(0.278 0.033 256.848)",
    "gray-900": "oklch(0.21 0.034 264.665)",
    "gray-950": "oklch(0.13 0.028 261.692)",
    "zinc-50": "oklch(0.985 0 0)",
    "zinc-100": "oklch(0.967 0.001 286.375)",
    "zinc-200": "oklch(0.92 0.004 286.32)",
    "zinc-300": "oklch(0.871 0.006 286.286)",
    "zinc-400": "oklch(0.705 0.015 286.067)",
    "zinc-500": "oklch(0.552 0.016 285.938)",
    "zinc-600": "oklch(0.442 0.017 285.786)",
    "zinc-700": "oklch(0.37 0.013 285.805)",
    "zinc-800": "oklch(0.274 0.006 286.033)",
    "zinc-900": "oklch(0.21 0.006 285.885)",
    "zinc-950": "oklch(0.141 0.005 285.823)",
    "neutral-50": "oklch(0.985 0 0)",
    "neutral-100": "oklch(0.97 0 0)",
    "neutral-200": "oklch(0.922 0 0)",
    "neutral-300": "oklch(0.87 0 0)",
    "neutral-400": "oklch(0.708 0 0)",
    "neutral-500": "oklch(0.556 0 0)",
    "neutral-600": "oklch(0.439 0 0)",
    "neutral-700": "oklch(0.371 0 0)",
    "neutral-800": "oklch(0.269 0 0)",
    "neutral-900": "oklch(0.205 0 0)",
    "neutral-950": "oklch(0.145 0 0)",
    "stone-50": "oklch(0.985 0.001 106.423)",
    "stone-100": "oklch(0.97 0.001 106.424)",
    "stone-200": "oklch(0.923 0.003 48.717)",
    "stone-300": "oklch(0.869 0.005 56.366)",
    "stone-400": "oklch(0.709 0.01 56.259)",
    "stone-500": "oklch(0.553 0.013 58.071)",
    "stone-600": "oklch(0.444 0.011 73.639)",
    "stone-700": "oklch(0.374 0.01 67.558)",
    "stone-800": "oklch(0.268 0.007 34.298)",
    "stone-900": "oklch(0.216 0.006 56.043)",
    "stone-950": "oklch(0.147 0.004 49.25)"
  },
  fontSize: {
    xs: "0.75rem",
    // 12px
    sm: "0.875rem",
    // 14px
    base: "1rem",
    // 16px
    lg: "1.125rem",
    // 18px
    xl: "1.25rem",
    // 20px
    "2xl": "1.5rem",
    // 24px
    "3xl": "1.875rem",
    // 30px
    "4xl": "2.25rem"
    // 36px
  },
  fontWeight: {
    hairline: "100",
    thin: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900"
  },
  fontFamily: {
    sans: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    serif: "Georgia, 'Times New Roman', Times, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace"
  },
  lineHeight: {
    none: "1",
    // equals the element's font-size
    tight: "1.15",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2"
  },
  letterSpacing: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0",
    wide: "0.01em",
    wider: "0.02em"
  },
  spacing: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem"
  },
  borderRadius: {
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    full: "9999px"
  }
};
var Ce = (e, o) => {
  const t = useSlots(), c = ref(null);
  return watchEffect(() => {
    if (o.value) {
      const r = t.default?.();
      (!r || r.length !== 1 && M) && console.warn("[VBox]: asChild expects exactly one child element.");
      const s = r?.[0];
      !isVNode(s) && M && console.warn("[VBox]: asChild child must be a VNode."), s && (c.value = cloneVNode(s, {
        class: [e]
      }));
    }
  }), {
    childNode: c
  };
};
var Q0 = Symbol("aliases");
var H0 = Symbol("class-name-prefix");
var P0 = Symbol("breakpoints");
var Ie = defineComponent({
  __name: "VBox",
  props: {
    pseudos: {},
    hover: {},
    focus: {},
    focusVisible: {},
    focusWithin: {},
    active: {},
    _disabled: {},
    sm: {},
    md: {},
    lg: {},
    xl: {},
    is: {},
    mq: {},
    cq: {},
    declarations: {},
    dark: {},
    asChild: { type: Boolean }
  },
  setup(e) {
    const o = e, t = inject(P0, _0), c = inject(Q0, E0), r = inject(H0, ""), s = `css-${useId()}`, l = r ? `${r}-${s}` : s, n = useAttrs(), { childNode: a } = Ce(
      l,
      computed(() => o.asChild)
    ), h = computed(() => ({ ...o, ...n }));
    return watchEffect(() => {
      const {
        rootStyles: i,
        rootDarkStyles: m,
        pseudoStyles: k,
        selectorBlocks: f,
        breakpointStyles: $,
        containerQueries: w,
        customMediaQueries: O
      } = se({
        obj: h.value,
        aliases: c,
        className: l,
        breakpoints: t
      }), B = le({
        rootStyles: i,
        rootDarkStyles: m,
        pseudoStyles: k,
        selectorBlocks: f,
        breakpointStyles: $,
        containerQueries: w,
        customMediaQueries: O,
        className: l
      });
      k0(B);
    }), (i, m) => o.asChild ? (openBlock(), createBlock(resolveDynamicComponent(unref(a)), normalizeProps(mergeProps({ key: 0 }, unref(a)?.props)), null, 16)) : (openBlock(), createBlock(resolveDynamicComponent(o.is || "div"), {
      key: 1,
      class: normalizeClass(unref(l))
    }, {
      default: withCtx(() => [
        renderSlot(i.$slots, "default")
      ]),
      _: 3
    }, 8, ["class"]));
  }
});
var Me = '*,:before,:after{box-sizing:border-box}html{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";line-height:1.15;-webkit-text-size-adjust:100%;tab-size:4}body{margin:0}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-color:currentcolor}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,[type=button],[type=reset],[type=submit]{-webkit-appearance:button}legend{padding:0}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}';
var Ne = {
  install(e, o) {
    const c = o?.enableDefaultTheme !== false ? Re : {}, r = D0(c, o?.theme ?? {});
    if (Object.keys(r).length > 0) {
      const { normalized: a, colorDarkMap: h } = Oe(r), i = Be({ normalized: a, colorDarkMap: h });
      k0(i);
    }
    o?.cssResets && k0(Me);
    const s = o?.aliases?.values ?? {}, n = (o?.aliases?.strategy ?? "merge") === "replace" ? Object.assign({}, s) : Object.assign({}, E0, s);
    e.provide(P0, o?.breakpoints ?? _0), e.provide(Q0, n), e.provide(H0, o?.classNamePrefix), e.component("VBox", Ie);
  }
};
export {
  Ie as VBox,
  Ne as VBoxPlugin
};
//# sourceMappingURL=@veebox_vue.js.map
