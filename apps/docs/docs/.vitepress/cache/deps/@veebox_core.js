// ../../node_modules/.pnpm/@veebox+core@0.0.13/node_modules/@veebox/core/dist/index.es.js
var n0 = /* @__PURE__ */ new Map();
var J = (e, o) => {
  const r = `${e}::${o}`;
  if (n0.has(r)) return n0.get(r);
  const c = CSS.supports(`${e}: ${o}`);
  return n0.set(r, c), c;
};
var E0 = (e) => {
  try {
    return document.createDocumentFragment().querySelector(e), true;
  } catch {
    return false;
  }
};
var L = (e) => Object.prototype.toString.call(e) === "[object Object]";
var M = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var I0 = (e) => e.replace(
  /([A-Za-z])\-([a-z])/g,
  (o, r, c) => r + c.toUpperCase()
);
var K0 = {
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
var M0 = /\b(cl|fs|fw|ff|lh|ls|sp|br|bs|z)-([a-zA-Z0-9-_]+)\b/g;
var v = (e) => !e || typeof e != "string" ? e : e.replace(
  M0,
  (o, r, c, t, i) => {
    const s = K0[r], n = i.lastIndexOf("var(", t);
    if (n !== -1) {
      const l = i.indexOf(")", n);
      if (l !== -1 && l >= t + o.length - 1)
        return o;
    }
    return s ? `var(--${s}-${c})` : o;
  }
);
var B = true;
var d0 = /* @__PURE__ */ new Map();
var U = (e, o) => {
  const r = d0.get(e);
  if (r) return r;
  const c = I0(e), i = o[c] ?? c;
  return d0.set(e, i), i;
};
var P = (e, o) => {
  let r = {};
  const c = {};
  if (!e || !L(e))
    return { rootStyleRecord: r, nestedStyleRecord: c };
  for (const [t, i] of Object.entries(e))
    if (L(i)) {
      if (!E0(t))
        continue;
      let s = {};
      for (const [n, l] of Object.entries(i)) {
        const h = M(
          n
        );
        let a = String(l);
        h === "content" && !/^['"]/.test(a) && (a = `"${a}"`);
        const p = v(a), f = U(h, o), u = M(f);
        J(u, p) && (s[u] = p);
      }
      c[t] = s;
    } else {
      const s = M(
        t
      );
      let n = String(i);
      s === "content" && !/^['"]/.test(n) && (n = `"${n}"`);
      const l = v(n), h = U(s, o), a = M(h);
      J(a, l) && (r[a] = l);
    }
  return { rootStyleRecord: r, nestedStyleRecord: c };
};
var p0 = (e, o, r) => {
  if (!e) return;
  const c = {}, t = {};
  for (const [i, s] of Object.entries(e)) {
    if (!i.startsWith("@media ")) {
      B && console.warn(
        `[VBox] Invalid mq key "${i}". It must start with "@media".`
      );
      continue;
    }
    const { rootStyleRecord: n, nestedStyleRecord: l } = P(
      s,
      o
    );
    c[i] = n;
    for (const [h, a] of Object.entries(l))
      t[`mbp::${i}::${h}`] = a;
  }
  return {
    customMediaQueries: c,
    selectorBlocks: t
  };
};
var g0 = (e, o, r) => {
  if (!e) return;
  const c = {}, t = {};
  for (const [i, s] of Object.entries(e)) {
    if (!i.startsWith("@container ")) {
      B && console.warn(
        `[VBox] Invalid cq key "${i}". It must start with "@container".`
      );
      continue;
    }
    const { rootStyleRecord: n, nestedStyleRecord: l } = P(
      s,
      o
    );
    c[i] = n;
    for (const [h, a] of Object.entries(l))
      t[`cbp::${i}::${h}`] = a;
  }
  return {
    containerQueries: c,
    selectorBlocks: t
  };
};
var te = ({
  obj: e,
  aliases: o,
  className: r,
  breakpoints: c
}) => {
  let t = {};
  const i = {}, s = {}, n = {};
  let l = {}, h = {}, a = {};
  for (const [p, f] of Object.entries(e)) {
    if (!f) continue;
    const u = U(p, o), y = M(
      u
    ), j = String(f), z = v(j), V = U(y, o), x = M(V);
    if (J(x, z) && (t[x] = z), u === "declarations") {
      const { rootStyleRecord: b, nestedStyleRecord: C } = P(
        f,
        o
      );
      Object.assign(t, b);
      for (const [O, $] of Object.entries(C))
        a[O] = $;
      continue;
    }
    if (u === "dark" && typeof f == "object") {
      const { rootStyleRecord: b, nestedStyleRecord: C } = P(
        f,
        o
      );
      Object.assign(i, b);
      for (const [O, $] of Object.entries(C))
        a[`dark::${O}`] = $;
      continue;
    }
    if ([
      "hover",
      "focus",
      "focusVisible",
      "focusWithin",
      "active",
      "_disabled"
    ].includes(u)) {
      const b = u === "_disabled" ? u.slice(1) : u;
      if (typeof f == "object") {
        const { rootStyleRecord: C, nestedStyleRecord: O } = P(
          f,
          o
        );
        s[b] = C;
        for (const [$, d] of Object.entries(O)) {
          const t0 = $.includes("&") ? $.replace(/&/g, `.${r}:${b}`) : `.${r}:${b} ${$}`;
          a[t0] = d;
        }
      }
      continue;
    }
    if (u === "pseudos" && typeof f == "object") {
      for (const [b, C] of Object.entries(f)) {
        if (!b.startsWith(":")) {
          B && console.warn(
            `[VBox] Invalid pseudo selector "${b}". It must start with ":" or "::"`
          );
          continue;
        }
        const { rootStyleRecord: O, nestedStyleRecord: $ } = P(
          C,
          o
        );
        s[b] = O;
        for (const [d, u0] of Object.entries($)) {
          const t0 = d.includes("&") ? d.replace(/&/g, `.${r}${b}`) : `.${r}${b} ${d}`;
          a[t0] = u0;
        }
      }
      continue;
    }
    if (u === "mq") {
      l = {
        ...l,
        ...p0(f, o)?.customMediaQueries
      }, a = {
        ...a,
        ...p0(f, o)?.selectorBlocks
      };
      continue;
    }
    if (u === "cq") {
      h = {
        ...h,
        ...g0(f, o)?.containerQueries
      }, a = {
        ...a,
        ...g0(f, o)?.selectorBlocks
      };
      continue;
    }
    if (["sm", "md", "lg", "xl", "2xl"].includes(u)) {
      const b = u;
      if (typeof f == "object") {
        const { rootStyleRecord: C, nestedStyleRecord: O } = P(
          f,
          o
        );
        n[c[b]] = C;
        for (const [$, d] of Object.entries(O))
          a[`bp::${c[b]}::${$}`] = d;
      }
      continue;
    }
  }
  return {
    rootStyles: t,
    rootDarkStyles: i,
    pseudoStyles: s,
    breakpointStyles: n,
    customMediaQueries: l,
    containerQueries: h,
    selectorBlocks: a
  };
};
var T = (e) => Object.entries(e).map(([o, r]) => `${o}: ${r};`).join(" ");
var ne = ({
  rootStyles: e,
  rootDarkStyles: o,
  pseudoStyles: r,
  selectorBlocks: c,
  breakpointStyles: t,
  customMediaQueries: i,
  containerQueries: s,
  className: n
}) => {
  let l = `.${n} { ${T(e)} }`;
  L(o) && Object.keys(o).length > 0 && (l += `
html.dark { .${n} { ${T(o)} } }`);
  for (const [h, a] of Object.entries(r)) {
    const p = h.startsWith(":") ? "" : ":";
    l += `
.${n}${p}${M(h)} { ${T(a)} }`;
    for (const [f, u] of Object.entries(c))
      f.startsWith(`.${n}${p}${h}`) && (l += `
${f} { ${T(u)} }`);
  }
  for (const [h, a] of Object.entries(t))
    l += `
@media (min-width: ${h}) { .${n} { ${T(a)} } }`;
  for (const [h, a] of Object.entries(i))
    l += `
${h} { .${n} { ${T(a)} } }`;
  for (const [h, a] of Object.entries(s))
    l += `
${h} { .${n} { ${T(a)} } }`;
  for (const [h, a] of Object.entries(c)) {
    const p = Object.entries(a).map(([u, y]) => {
      const j = M(u);
      let z = String(y);
      return j === "content" && !/^['"]/.test(z) && (z = `"${z}"`), `${j}: ${z};`;
    }).join(" "), f = h.includes("&") ? h.replace(/&/g, `.${n}`) : `.${n} ${h}`;
    if (!/^[\s\S]*\S[\s\S]*$/.test(f)) {
      B && console.warn(`[VBox] Skipping invalid selector: "${h}"`);
      continue;
    }
    if (f.startsWith("bp::")) {
      const [, u, y] = f.split("::");
      l += `
@media (min-width: ${u}) { ${y} { ${p} } }`;
    } else if (f.startsWith("mbp::")) {
      const [, u, y] = f.split("::");
      l += `
${u} { ${y} { ${p} } }`;
    } else if (f.startsWith("cbp::")) {
      const [, u, y] = f.split("::");
      l += `
${u} { ${y} { ${p} } }`;
    } else if (f.startsWith("dark::")) {
      const [, u] = f.split("::");
      l += `
html.dark { ${u} { ${p} } }`;
    } else
      l += `
${f} { ${p} }`;
  }
  return l;
};
var m = "-ms-";
var F = "-moz-";
var g = "-webkit-";
var w0 = "comm";
var h0 = "rule";
var k0 = "decl";
var B0 = "@import";
var W0 = "@namespace";
var x0 = "@keyframes";
var A0 = "@layer";
var S0 = Math.abs;
var f0 = String.fromCharCode;
var l0 = Object.assign;
function T0(e, o) {
  return S(e, 0) ^ 45 ? (((o << 2 ^ S(e, 0)) << 2 ^ S(e, 1)) << 2 ^ S(e, 2)) << 2 ^ S(e, 3) : 0;
}
function j0(e) {
  return e.trim();
}
function K(e, o) {
  return (e = o.exec(e)) ? e[0] : e;
}
function k(e, o, r) {
  return e.replace(o, r);
}
function G(e, o, r) {
  return e.indexOf(o, r);
}
function S(e, o) {
  return e.charCodeAt(o) | 0;
}
function _(e, o, r) {
  return e.slice(o, r);
}
function E(e) {
  return e.length;
}
function O0(e) {
  return e.length;
}
function H(e, o) {
  return o.push(e), e;
}
function P0(e, o) {
  return e.map(o).join("");
}
function b0(e, o) {
  return e.filter(function(r) {
    return !K(r, o);
  });
}
var o0 = 1;
var D = 1;
var C0 = 0;
var R = 0;
var w = 0;
var Q = "";
function r0(e, o, r, c, t, i, s, n) {
  return { value: e, root: o, parent: r, type: c, props: t, children: i, line: o0, column: D, length: s, return: "", siblings: n };
}
function W(e, o) {
  return l0(r0("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, o);
}
function q(e) {
  for (; e.root; )
    e = W(e.root, { children: [e] });
  H(e, e.siblings);
}
function _0() {
  return w;
}
function q0() {
  return w = R > 0 ? S(Q, --R) : 0, D--, w === 10 && (D = 1, o0--), w;
}
function I() {
  return w = R < C0 ? S(Q, R++) : 0, D++, w === 10 && (D = 1, o0++), w;
}
function A() {
  return S(Q, R);
}
function N() {
  return R;
}
function c0(e, o) {
  return _(Q, e, o);
}
function Z(e) {
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
function D0(e) {
  return o0 = D = 1, C0 = E(Q = e), R = 0, [];
}
function Q0(e) {
  return Q = "", e;
}
function s0(e) {
  return j0(c0(R - 1, a0(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function H0(e) {
  for (; (w = A()) && w < 33; )
    I();
  return Z(e) > 2 || Z(w) > 3 ? "" : " ";
}
function F0(e, o) {
  for (; --o && I() && !(w < 48 || w > 102 || w > 57 && w < 65 || w > 70 && w < 97); )
    ;
  return c0(e, N() + (o < 6 && A() == 32 && I() == 32));
}
function a0(e) {
  for (; I(); )
    switch (w) {
      // ] ) " '
      case e:
        return R;
      // " '
      case 34:
      case 39:
        e !== 34 && e !== 39 && a0(w);
        break;
      // (
      case 40:
        e === 41 && a0(e);
        break;
      // \
      case 92:
        I();
        break;
    }
  return R;
}
function L0(e, o) {
  for (; I() && e + w !== 57; )
    if (e + w === 84 && A() === 47)
      break;
  return "/*" + c0(o, R - 1) + "*" + f0(e === 47 ? e : I());
}
function U0(e) {
  for (; !Z(A()); )
    I();
  return c0(e, R);
}
function Z0(e) {
  return Q0(X("", null, null, null, [""], e = D0(e), 0, [0], e));
}
function X(e, o, r, c, t, i, s, n, l) {
  for (var h = 0, a = 0, p = s, f = 0, u = 0, y = 0, j = 1, z = 1, V = 1, x = 0, b = "", C = t, O = i, $ = c, d = b; z; )
    switch (y = x, x = I()) {
      // (
      case 40:
        if (y != 108 && S(d, p - 1) == 58) {
          G(d += k(s0(x), "&", "&\f"), "&\f", S0(h ? n[h - 1] : 0)) != -1 && (V = -1);
          break;
        }
      // " ' [
      case 34:
      case 39:
      case 91:
        d += s0(x);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        d += H0(y);
        break;
      // \
      case 92:
        d += F0(N() - 1, 7);
        continue;
      // /
      case 47:
        switch (A()) {
          case 42:
          case 47:
            H(G0(L0(I(), N()), o, r, l), l), (Z(y || 1) == 5 || Z(A() || 1) == 5) && E(d) && _(d, -1, void 0) !== " " && (d += " ");
            break;
          default:
            d += "/";
        }
        break;
      // {
      case 123 * j:
        n[h++] = E(d) * V;
      // } ; \0
      case 125 * j:
      case 59:
      case 0:
        switch (x) {
          // \0 }
          case 0:
          case 125:
            z = 0;
          // ;
          case 59 + a:
            V == -1 && (d = k(d, /\f/g, "")), u > 0 && (E(d) - p || j === 0 && y === 47) && H(u > 32 ? y0(d + ";", c, r, p - 1, l) : y0(k(d, " ", "") + ";", c, r, p - 2, l), l);
            break;
          // @ ;
          case 59:
            d += ";";
          // { rule/at-rule
          default:
            if (H($ = m0(d, o, r, h, a, t, n, b, C = [], O = [], p, i), i), x === 123)
              if (a === 0)
                X(d, o, $, $, C, i, p, n, O);
              else {
                switch (f) {
                  // c(ontainer)
                  case 99:
                    if (S(d, 3) === 110) break;
                  // l(ayer)
                  case 108:
                    if (S(d, 2) === 97) break;
                  default:
                    a = 0;
                  // d(ocument) m(edia) s(upports)
                  case 100:
                  case 109:
                  case 115:
                }
                a ? X(e, $, $, c && H(m0(e, $, $, 0, 0, t, n, b, t, C = [], p, O), O), t, O, p, n, c ? C : O) : X(d, $, $, $, [""], O, 0, n, O);
              }
        }
        h = a = u = 0, j = V = 1, b = d = "", p = s;
        break;
      // :
      case 58:
        p = 1 + E(d), u = y;
      default:
        if (j < 1) {
          if (x == 123)
            --j;
          else if (x == 125 && j++ == 0 && q0() == 125)
            continue;
        }
        switch (d += f0(x), x * j) {
          // &
          case 38:
            V = a > 0 ? 1 : (d += "\f", -1);
            break;
          // ,
          case 44:
            n[h++] = (E(d) - 1) * V, V = 1;
            break;
          // @
          case 64:
            A() === 45 && (d += s0(I())), f = A(), a = p = E(b = d += U0(N())), x++;
            break;
          // -
          case 45:
            y === 45 && E(d) == 2 && (j = 0);
        }
    }
  return i;
}
function m0(e, o, r, c, t, i, s, n, l, h, a, p) {
  for (var f = t - 1, u = t === 0 ? i : [""], y = O0(u), j = 0, z = 0, V = 0; j < c; ++j)
    for (var x = 0, b = _(e, f + 1, f = S0(z = s[j])), C = e; x < y; ++x)
      (C = j0(z > 0 ? u[x] + " " + b : k(b, /&\f/g, u[x]))) && (l[V++] = C);
  return r0(e, o, r, t === 0 ? h0 : n, l, h, a, p);
}
function G0(e, o, r, c) {
  return r0(e, o, r, w0, f0(_0()), _(e, 2, -2), 0, c);
}
function y0(e, o, r, c, t) {
  return r0(e, o, r, k0, _(e, 0, c), _(e, c + 1, -1), c, t);
}
function z0(e, o, r) {
  switch (T0(e, o)) {
    // color-adjust
    case 5103:
      return g + "print-" + e + e;
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
      return g + e + e;
    // mask-composite
    case 4855:
      return g + e.replace("add", "source-over").replace("substract", "source-out").replace("intersect", "source-in").replace("exclude", "xor") + e;
    // tab-size
    case 4789:
      return F + e + e;
    // appearance, user-select, transform, hyphens, text-size-adjust
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return g + e + F + e + m + e + e;
    // writing-mode
    case 5936:
      switch (S(e, o + 11)) {
        // vertical-l(r)
        case 114:
          return g + e + m + k(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        // vertical-r(l)
        case 108:
          return g + e + m + k(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        // horizontal(-)tb
        case 45:
          return g + e + m + k(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
    // flex, flex-direction, scroll-snap-type, writing-mode
    case 6828:
    case 4268:
    case 2903:
      return g + e + m + e + e;
    // order
    case 6165:
      return g + e + m + "flex-" + e + e;
    // align-items
    case 5187:
      return g + e + k(e, /(\w+).+(:[^]+)/, g + "box-$1$2" + m + "flex-$1$2") + e;
    // align-self
    case 5443:
      return g + e + m + "flex-item-" + k(e, /flex-|-self/g, "") + (K(e, /flex-|baseline/) ? "" : m + "grid-row-" + k(e, /flex-|-self/g, "")) + e;
    // align-content
    case 4675:
      return g + e + m + "flex-line-pack" + k(e, /align-content|flex-|-self/g, "") + e;
    // flex-shrink
    case 5548:
      return g + e + m + k(e, "shrink", "negative") + e;
    // flex-basis
    case 5292:
      return g + e + m + k(e, "basis", "preferred-size") + e;
    // flex-grow
    case 6060:
      return g + "box-" + k(e, "-grow", "") + g + e + m + k(e, "grow", "positive") + e;
    // transition
    case 4554:
      return g + k(e, /([^-])(transform)/g, "$1" + g + "$2") + e;
    // cursor
    case 6187:
      return k(k(k(e, /(zoom-|grab)/, g + "$1"), /(image-set)/, g + "$1"), e, "") + e;
    // background, background-image
    case 5495:
    case 3959:
      return k(e, /(image-set\([^]*)/, g + "$1$`$1");
    // justify-content
    case 4968:
      return k(k(e, /(.+:)(flex-)?(.*)/, g + "box-pack:$3" + m + "flex-pack:$3"), /space-between/, "justify") + g + e + e;
    // justify-self
    case 4200:
      if (!K(e, /flex-|baseline/)) return m + "grid-column-align" + _(e, o) + e;
      break;
    // grid-template-(columns|rows)
    case 2592:
    case 3360:
      return m + k(e, "template-", "") + e;
    // grid-(row|column)-start
    case 4384:
    case 3616:
      return r && r.some(function(c, t) {
        return o = t, K(c.props, /grid-\w+-end/);
      }) ? ~G(e + (r = r[o].value), "span", 0) ? e : m + k(e, "-start", "") + e + m + "grid-row-span:" + (~G(r, "span", 0) ? K(r, /\d+/) : +K(r, /\d+/) - +K(e, /\d+/)) + ";" : m + k(e, "-start", "") + e;
    // grid-(row|column)-end
    case 4896:
    case 4128:
      return r && r.some(function(c) {
        return K(c.props, /grid-\w+-start/);
      }) ? e : m + k(k(e, "-end", "-span"), "span ", "") + e;
    // (margin|padding)-inline-(start|end)
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return k(e, /(.+)-inline(.+)/, g + "$1$2") + e;
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
      if (E(e) - 1 - o > 6)
        switch (S(e, o + 1)) {
          // (m)ax-content, (m)in-content
          case 109:
            if (S(e, o + 4) !== 45)
              break;
          // (f)ill-available, (f)it-content
          case 102:
            return k(e, /(.+:)(.+)-([^]+)/, "$1" + g + "$2-$3$1" + F + (S(e, o + 3) == 108 ? "$3" : "$2-$3")) + e;
          // (s)tretch
          case 115:
            return ~G(e, "stretch", 0) ? z0(k(e, "stretch", "fill-available"), o, r) + e : e;
        }
      break;
    // grid-(column|row)
    case 5152:
    case 5920:
      return k(e, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(c, t, i, s, n, l, h) {
        return m + t + ":" + i + h + (s ? m + t + "-span:" + (n ? l : +l - +i) + h : "") + e;
      });
    // position: sticky
    case 4949:
      if (S(e, o + 6) === 121)
        return k(e, ":", ":" + g) + e;
      break;
    // display: (flex|inline-flex|grid|inline-grid)
    case 6444:
      switch (S(e, S(e, 14) === 45 ? 18 : 11)) {
        // (inline-)?fle(x)
        case 120:
          return k(e, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + g + (S(e, 14) === 45 ? "inline-" : "") + "box$3$1" + g + "$2$3$1" + m + "$2box$3") + e;
        // (inline-)?gri(d)
        case 100:
          return k(e, ":", ":" + m) + e;
      }
      break;
    // scroll-margin, scroll-margin-(top|right|bottom|left)
    case 5719:
    case 2647:
    case 2135:
    case 3927:
    case 2391:
      return k(e, "scroll-", "scroll-snap-") + e;
  }
  return e;
}
function e0(e, o) {
  for (var r = "", c = 0; c < e.length; c++)
    r += o(e[c], c, e, o) || "";
  return r;
}
function N0(e, o, r, c) {
  switch (e.type) {
    case A0:
      if (e.children.length) break;
    case B0:
    case W0:
    case k0:
      return e.return = e.return || e.value;
    case w0:
      return "";
    case x0:
      return e.return = e.value + "{" + e0(e.children, c) + "}";
    case h0:
      if (!E(e.value = e.props.join(","))) return "";
  }
  return E(r = e0(e.children, c)) ? e.return = e.value + "{" + r + "}" : "";
}
function X0(e) {
  var o = O0(e);
  return function(r, c, t, i) {
    for (var s = "", n = 0; n < o; n++)
      s += e[n](r, c, t, i) || "";
    return s;
  };
}
function Y0(e, o, r, c) {
  if (e.length > -1 && !e.return)
    switch (e.type) {
      case k0:
        e.return = z0(e.value, e.length, r);
        return;
      case x0:
        return e0([W(e, { value: k(e.value, "@", "@" + g) })], c);
      case h0:
        if (e.length)
          return P0(r = e.props, function(t) {
            switch (K(t, c = /(::plac\w+|:read-\w+)/)) {
              // :read-(only|write)
              case ":read-only":
              case ":read-write":
                q(W(e, { props: [k(t, /:(read-\w+)/, ":" + F + "$1")] })), q(W(e, { props: [t] })), l0(e, { props: b0(r, c) });
                break;
              // :placeholder
              case "::placeholder":
                q(W(e, { props: [k(t, /:(plac\w+)/, ":" + g + "input-$1")] })), q(W(e, { props: [k(t, /:(plac\w+)/, ":" + F + "$1")] })), q(W(e, { props: [k(t, /:(plac\w+)/, m + "input-$1")] })), q(W(e, { props: [t] })), l0(e, { props: b0(r, c) });
                break;
            }
            return "";
          });
    }
}
var i0 = /* @__PURE__ */ new Map();
var $0 = (e) => {
  if (i0.has(e)) return i0.get(e);
  const o = e0(
    Z0(e),
    X0([Y0, N0])
  );
  return i0.set(e, o), o;
};
var J0 = (e) => {
  if (typeof window > "u") return;
  const o = "vbox-style-sheet";
  let r = document.getElementById(o);
  if (r) {
    const t = $0(e);
    r.textContent += t;
    return;
  }
  r = document.createElement("style"), r.id = o;
  const c = $0(e);
  r.textContent += c, document.head.appendChild(r);
};
var v0 = (e = {}, o) => {
  if (!o) return { ...e };
  const r = { ...e };
  for (const c of Object.keys(o)) {
    const t = e[c], i = o[c];
    L(t) && L(i) ? r[c] = v0(t, i) : r[c] = i;
  }
  return r;
};
var ee = [
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
var Y = (e) => typeof e == "string" && e.startsWith("$");
var R0 = (e) => e ? e.replace(/^\$/, "").split(".") : [];
var V0 = (e, o, r = []) => {
  const c = R0(o), [t, i] = c, s = e?.[t]?.[i];
  if (s === void 0)
    return B && console.warn(`[VBox] Unknown token reference: ${o}`), o;
  const n = `${t}.${i}`;
  return r.includes(n) ? (B && console.warn(
    `[VBox] Circular token reference detected: ${[...r, n].join(" → ")}`
  ), o) : typeof s == "string" && Y(s) ? V0(e, s, [...r, n]) : s;
};
var se = (e) => {
  const o = {}, r = {};
  for (const c of ee) {
    const t = e[c];
    if (t) {
      o[c] = {};
      for (const [i, s] of Object.entries(t))
        if (c === "color") {
          if (typeof s == "string" && !Y(s)) {
            o.color[i] = s;
            continue;
          }
          if (typeof s == "string" && Y(s)) {
            const n = R0(s), [, l] = n;
            o.color[i] = `var(--color-${l})`;
            continue;
          }
          if (s && typeof s == "object") {
            const n = s, l = n.default;
            if (l && typeof l == "string")
              o.color[i] = l;
            else {
              B && console.warn(`[VBox] Invalid default value for color.${i}`);
              continue;
            }
            n.dark && typeof n.dark == "string" && (r[i] = n.dark);
            continue;
          }
          B && console.warn(`[VBox] Unsupported color value for ${i}:`, s);
          continue;
        } else if (s && typeof s == "string" && Y(s)) {
          const n = V0(e, s);
          o[c][i] = n;
        } else
          o[c][i] = s;
    }
  }
  return { normalized: o, colorDarkMap: r };
};
var ie = (e) => {
  const { normalized: o, colorDarkMap: r } = e;
  let c = ":root{", t = "html.dark{";
  for (const [s, n] of Object.entries(o))
    for (const [l, h] of Object.entries(n)) {
      const a = s.replace(
        /[A-Z]/g,
        (p) => `-${p.toLowerCase()}`
      );
      c += `--${a}-${l}: ${h};`, s === "color" && r[l] && (t += `--${a}-${l}: ${r[l]};`);
    }
  return c += "}", t += "}", t === "html.dark{}" ? `${c}` : `${c}
${t}`;
};
var oe = {
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
var le = {
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
var ae = {
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
var re = (e) => {
  let o = 5381;
  for (let r = 0; r < e.length; r++)
    o = o * 33 ^ e.charCodeAt(r);
  return (o >>> 0).toString(16);
};
var ce = (e) => JSON.stringify(e, Object.keys(e).sort(), 2);
var he = (e, o) => {
  const r = typeof e == "string", c = r ? e : "vbox-kf", t = r ? o : e;
  if (!t || typeof t != "object") {
    B && console.error("[VBox] keyframes: rules object is required.");
    return;
  }
  const i = ce(t), s = re(i), n = `${c}-${s}`;
  let l = `@keyframes ${n} {
`;
  for (const h of Object.keys(t)) {
    const a = t[h];
    l += `  ${h} {
`;
    for (const p in a) {
      const f = U(p, oe), u = M(f), y = v(
        a[p]
      );
      J(u, y) && (l += `    ${u}: ${y};
`);
    }
    l += `  }
`;
  }
  return l += "}", J0(l), n;
};
function ke(e) {
  return e;
}
export {
  oe as DefaultAliases,
  le as DefaultBreakpoints,
  ae as DefaultTheme,
  B as __DEV__,
  ie as buildCSSVariables,
  ne as buildCssString,
  v0 as deepMerge,
  ke as defineConfig,
  J0 as injectCSS,
  J as isValidCssDeclaration,
  E0 as isValidCssSelector,
  he as keyframes,
  se as normalizeTheme,
  te as parseStyleObject,
  V0 as resolveToken
};
//# sourceMappingURL=@veebox_core.js.map
