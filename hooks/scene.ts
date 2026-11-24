// Winterabend: a snowy night drawn as one SVG string from the live session figures.
// The art keeps to the two margins beside the conversation; the sky, the mountains and the snow run behind everything.
import type { Stats } from '../types'

const FONT = "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
/** How far the whole scene sits below where it was first drawn, in scene units. */
const SHIFT = 120
const SNOW = '#f2f5ff'
const SNOW_SHADE = '#c9d2f2'

/** A small seeded random, so the snow and the stars stay where they were between redraws. */
function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const r1 = (n: number) => Math.round(n * 10) / 10

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function resetLabel(iso: string | undefined, withDay: boolean): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return withDay ? `${WEEKDAYS[d.getDay()]} ${time}` : time
}

// ---------- the far world: sky, stars, mountains, forest line ----------

function stars(): string {
  const rnd = seeded(7)
  let out = ''
  for (let i = 0; i < 60; i++) {
    const x = r1(rnd() * 1600)
    const y = r1(rnd() * 520)
    const r = r1(0.8 + rnd() * 1.4)
    const tw = i % 3 === 0 ? ` class="tw" style="animation-delay:${r1(rnd() * 6)}s"` : ''
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8eeff" opacity="${r1(0.3 + rnd() * 0.5)}"${tw}/>`
  }
  return out
}

function forestLine(y: number, seed: number, color: string, h: number): string {
  const rnd = seeded(seed)
  let d = ''
  for (let x = -40; x < 1640; x += 18 + rnd() * 22) {
    const th = h * (0.6 + rnd() * 0.6)
    const w = th * 0.32
    d += `M${r1(x)} ${y} L${r1(x + w)} ${y} L${r1(x + w / 2)} ${r1(y - th)}Z`
  }
  return `<path d="${d}" fill="${color}"/><rect x="-40" y="${y}" width="1680" height="400" fill="${color}"/>`
}

function backdrop(): string {
  return `
<path d="M-40 640 L90 520 L170 580 L300 450 L420 560 L520 500 L640 600 L760 470 L880 560 L990 490 L1120 600 L1240 480 L1360 570 L1480 470 L1640 560 V1300 H-40Z" fill="#26346e"/>
<path d="M300 450 L262 486 L300 476 L338 490Z M760 470 L726 500 L760 492 L790 504Z M1240 480 L1206 510 L1240 502 L1272 514Z M1480 470 L1450 496 L1482 490 L1510 500Z" fill="#7c8cc6" opacity="0.6"/>
<path d="M-40 680 L120 590 L240 650 L380 560 L520 660 L660 580 L800 670 L940 580 L1080 660 L1220 590 L1360 670 L1500 580 L1640 650 V1300 H-40Z" fill="#1f2c60"/>
<path d="M120 590 L240 650 M380 560 L520 660 M660 580 L800 670 M940 580 L1080 660 M1220 590 L1360 670 M1500 580 L1640 650" stroke="#3a4b8c" stroke-width="3" opacity="0.7"/>
${forestLine(770, 31, '#1a2552', 70)}
${forestLine(800, 37, '#16204a', 54)}
<path d="M-40 830 Q300 800 640 828 T1300 820 T1640 826 V1300 H-40Z" fill="#9aa6d8"/>
<path d="M-40 880 Q280 852 600 876 T1240 866 T1640 878 V1300 H-40Z" fill="#c3cbee"/>`
}

// ---------- snow in the air ----------

function snowLayer(seed: number, count: number, rMin: number, rMax: number, cls: string): string {
  const rnd = seeded(seed)
  let flakes = ''
  for (let i = 0; i < count; i++) {
    const x = r1(rnd() * 1600)
    const y = r1(rnd() * 1000)
    const r = r1(rMin + rnd() * (rMax - rMin))
    flakes += `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${r1(y - 1000)}" r="${r}"/>`
  }
  return `<g class="${cls}" fill="#ffffff">${flakes}</g>`
}

/**
 * A wide, flat snowfield in soft lavender bands, as in the reference video.
 * Its surface rises as the context window fills: low at 0 %, up past the bases of tree and cabin at 100 %.
 */
function drift(percent: number | null): string {
  const p = Math.max(0, Math.min(100, percent ?? 0)) / 100
  const top = r1(985 - p * 105)
  const h = 1400 - top
  const at = (f: number) => r1(top + h * f)
  return `<path d="M-400 ${r1(top + 3)} Q400 ${r1(top - 3)} 800 ${top} T2000 ${r1(top + 2)} V1400 H-400Z" fill="#c6cbea"/>
<path d="M-400 ${r1(top + 3)} Q400 ${r1(top - 3)} 800 ${top} T2000 ${r1(top + 2)} V${r1(top + 8)} H-400Z" fill="#dde2f6"/>
<ellipse cx="300" cy="${at(0.07)}" rx="520" ry="10" fill="#b4bce2" opacity="0.7"/>
<ellipse cx="1320" cy="${at(0.06)}" rx="460" ry="9" fill="#b4bce2" opacity="0.7"/>
<path d="M-400 ${at(0.14)} Q800 ${at(0.12)} 2000 ${at(0.14)} V1400 H-400Z" fill="#aeb6df"/>
<path d="M-400 ${at(0.2)} Q800 ${at(0.18)} 2000 ${at(0.2)} V1400 H-400Z" fill="#b9c0e6"/>
<ellipse cx="800" cy="${at(0.24)}" rx="900" ry="12" fill="#c8cef0" opacity="0.6"/>`
}

// ---------- pieces used on both sides ----------

/** A pine with snow lying in clumps on every tier. */
function snowyPine(x: number, base: number, s: number): string {
  const tiers = [
    { y: -40, w: 46 },
    { y: -82, w: 38 },
    { y: -120, w: 29 },
    { y: -152, w: 19 },
  ]
  let g = `<rect x="-5" y="-40" width="10" height="42" fill="#3a2616"/>`
  for (const t of tiers) {
    g += `<path d="M${-t.w} ${t.y} Q0 ${t.y + 10} ${t.w} ${t.y} L${r1(t.w * 0.25)} ${t.y - 52} L${-r1(t.w * 0.25)} ${t.y - 52}Z" fill="#1c4636"/>`
  }
  g += `<path d="M0 -196 L16 -150 L-16 -150Z" fill="#1c4636"/>`
  for (const t of tiers) {
    const n = Math.max(2, Math.round(t.w / 13))
    for (let i = 0; i < n; i++) {
      const cx = r1(-t.w + 8 + ((2 * t.w - 16) / (n - 1 || 1)) * i)
      g += `<ellipse cx="${cx}" cy="${t.y - 4}" rx="${r1(t.w / n + 4)}" ry="9" fill="${SNOW}"/>`
    }
    g += `<ellipse cx="0" cy="${t.y - 34}" rx="${r1(t.w * 0.35 + 4)}" ry="7" fill="${SNOW}"/>`
  }
  g += `<ellipse cx="0" cy="-176" rx="8" ry="10" fill="${SNOW}"/>`
  return `<g transform="translate(${x} ${base}) scale(${s})">${g}</g>`
}

function groundMound(x0: number, x1: number, y: number, side: 'left' | 'right'): string {
  // A bank of snow that rolls down into the valley on the side facing the conversation.
  if (side === 'left') {
    return `<path d="M${x0} ${y + 6} Q${r1((x0 + x1) / 2)} ${y - 20} ${x1 - 60} ${y + 6} Q${x1} ${y + 18} ${x1 + 120} ${y + 90} Q${x1 + 200} ${y + 140} ${x1 + 320} 1300 H${x0}Z" fill="${SNOW_SHADE}"/>
<path d="M${x0} ${y + 30} Q${r1((x0 + x1) / 2)} ${y + 8} ${x1} ${y + 40} Q${x1 + 120} ${y + 90} ${x1 + 240} 1300 H${x0}Z" fill="#e3e9fb"/>`
  }
  return `<path d="M${x1} ${y + 6} Q${r1((x0 + x1) / 2)} ${y - 20} ${x0 + 60} ${y + 6} Q${x0} ${y + 18} ${x0 - 120} ${y + 90} Q${x0 - 200} ${y + 140} ${x0 - 320} 1300 H${x1}Z" fill="${SNOW_SHADE}"/>
<path d="M${x1} ${y + 30} Q${r1((x0 + x1) / 2)} ${y + 8} ${x0} ${y + 40} Q${x0 - 120} ${y + 90} ${x0 - 240} 1300 H${x1}Z" fill="#e3e9fb"/>`
}

// ---------- the sign with the robin ----------

function robin(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
<path d="M-26 6 Q-46 2 -50 -6 Q-36 -4 -24 -2Z" fill="#5a3a22"/>
<ellipse cx="0" cy="0" rx="28" ry="24" fill="#7a5233"/>
<ellipse cx="10" cy="6" rx="18" ry="17" fill="#e2562c"/>
<ellipse cx="6" cy="16" rx="14" ry="8" fill="#f3e7d6"/>
<path d="M-18 -4 Q-6 6 8 -2 Q-4 14 -20 8Z" fill="#5f3e25"/>
<circle cx="18" cy="-12" r="15" fill="#7a5233"/>
<circle cx="24" cy="-8" r="10" fill="#e2562c"/>
<circle cx="23" cy="-15" r="3" fill="#1a1010"/><circle cx="24" cy="-16" r="1" fill="#ffffff"/>
<path d="M31 -12 L42 -9 L31 -6Z" fill="#e8a23a"/>
<path d="M-4 22 L-6 30 M6 22 L5 30" stroke="#d08a3a" stroke-width="2.5" stroke-linecap="round"/>
<path d="M5 -24 Q8 -44 -2 -52 Q-8 -56 -10 -50 Q2 -50 10 -40 Q22 -42 33 -22Z" fill="#d6283a"/>
<path d="M8 -26 Q10 -38 4 -46" stroke="#a81c2c" stroke-width="2" fill="none" opacity="0.6"/>
<circle cx="-10" cy="-50" r="5.5" fill="#ffffff"/>
<path d="M1 -22 Q18 -32 36 -22 Q37 -16 34 -15 Q18 -24 3 -16 Q0 -18 1 -22Z" fill="#ffffff"/>
</g>`
}

function board(x: number, y: number, w: number, h: number, extra: number): string {
  const t = r1(extra)
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="url(#w-wood)" stroke="#3b2414" stroke-width="3"/>
<path d="M${x + 6} ${r1(y + h / 2)} H${x + w - 6}" stroke="#4a2d18" stroke-width="1.5" opacity="0.4"/>
<path d="M${r1(x - 4 - t / 3)} ${y + 5} Q${x + 8} ${r1(y - 9 - t)} ${r1(x + w * 0.3)} ${r1(y - 3 - t)} Q${r1(x + w * 0.55)} ${r1(y - 11 - t)} ${r1(x + w * 0.8)} ${r1(y - 4 - t)} Q${x + w} ${r1(y - 10 - t)} ${r1(x + w + 4 + t / 3)} ${y + 5} Q${r1(x + w / 2)} ${y + 10} ${r1(x - 4 - t / 3)} ${y + 5}Z" fill="${SNOW}"/>`
}

function stocking(id: string, x: number, y: number, label: string, percent: number, reset: string): string {
  const pct = Math.max(0, Math.min(100, percent))
  const fillTop = r1(28 + 82 * (1 - pct / 100))
  const body = 'M0 28 H40 V72 Q42 84 56 86 Q70 88 70 98 Q70 110 52 110 H14 Q0 108 0 92Z'
  return `<g transform="translate(${x} ${y}) scale(0.6)">
<path d="M20 ${r1(-(y + 400) / 0.6)} V0" stroke="#c9a46a" stroke-width="3"/>
<clipPath id="${id}"><path d="${body}"/></clipPath>
<path d="${body}" fill="#5e1520" stroke="#3a0b12" stroke-width="2"/>
<rect x="-2" y="${fillTop}" width="76" height="120" fill="${pct >= 80 ? '#ff5a4f' : '#d6283a'}" clip-path="url(#${id})"/>
<rect x="-4" y="0" width="48" height="30" rx="8" fill="${SNOW}"/>
<text x="20" y="21" text-anchor="middle" font-size="15" font-weight="800" fill="#7d1a24">${label}</text>
<text x="24" y="66" text-anchor="middle" font-size="21" font-weight="800" fill="#ffffff">${Math.round(pct)}%</text>
${reset ? `<text x="34" y="132" text-anchor="middle" font-size="15" font-weight="700" fill="#e6ecff">↻ ${reset}</text>` : ''}
</g>`
}

function sign(s: Stats): string {
  const fill = (s.contextPercent ?? 0) / 100
  const ctx = s.contextPercent === null ? '–' : `${Math.round(s.contextPercent)}%`
  const left = s.cacheAt === null ? null : Math.max(0, Math.ceil((s.cacheAt + s.cacheTtlMin * 60_000 - s.now) / 60_000))
  const cacheText = left === null ? '–' : left === 0 ? 'kalt' : `${left}m`
  const burn = left === null ? 1 : left / s.cacheTtlMin
  const candleH = r1(10 + 30 * burn)
  const candleTop = r1(316 - candleH)
  const flame = left === 0 ? '' : `<circle cx="108" cy="${r1(candleTop - 12)}" r="20" fill="url(#w-glow)"/><g class="flick"><path d="M108 ${r1(candleTop - 3)} Q101 ${r1(candleTop - 12)} 108 ${r1(candleTop - 23)} Q115 ${r1(candleTop - 12)} 108 ${r1(candleTop - 3)}Z" fill="#ffcf4a"/><path d="M108 ${r1(candleTop - 5)} Q105 ${r1(candleTop - 10)} 108 ${r1(candleTop - 16)} Q111 ${r1(candleTop - 10)} 108 ${r1(candleTop - 5)}Z" fill="#fff4c2"/></g>`

  const five = s.limits.find(l => l.kind === 'five_hour')
  const week = s.limits.find(l => l.kind === 'seven_day')
  const socks: string[] = []
  if (five) socks.push(stocking('w-st-a', 244, 160, '5 Std', five.percent, resetLabel(five.resetsAt, false)))
  if (week) socks.push(stocking('w-st-b', 296, 160, 'Woche', week.percent, resetLabel(week.resetsAt, true)))

  return `<g font-family="${FONT}">
<path d="M96 -400 V168 M204 -400 V168" stroke="#c9a46a" stroke-width="3"/>
${robin(150, r1(136 - fill * 12))}
${board(70, 165, 160, 84, fill * 14)}
<text x="150" y="222" text-anchor="middle" font-size="50" font-weight="800" fill="#fff4e0" stroke="#3b2414" stroke-width="1.5" paint-order="stroke">${ctx}</text>
<text x="150" y="241" text-anchor="middle" font-size="15" font-weight="700" fill="#ffe7c2">Kontext</text>
<path d="M112 249 V264 M188 249 V264" stroke="#c9a46a" stroke-width="3"/>
${board(88, 264, 124, 62, fill * 10)}
<rect x="100" y="${candleTop}" width="16" height="${candleH}" rx="3" fill="#f6efe2"/>
<path d="M97 316 H119 Q121 324 108 326 Q95 324 97 316Z" fill="#8a5a2e"/>
${flame}
<text x="170" y="304" text-anchor="middle" font-size="34" font-weight="800" fill="#fff4e0" stroke="#3b2414" stroke-width="1.5" paint-order="stroke">${cacheText}</text>
<text x="170" y="320" text-anchor="middle" font-size="12" font-weight="700" fill="#ffe7c2">Cache</text>
${socks.join('\n')}
</g>`
}

// ---------- left: tall tree, snowman, lamp ----------

function tree(): string {
  const cx = 165
  let body = `<rect x="${cx - 9}" y="740" width="18" height="30" fill="#5a3a22"/>`
  const rnd = seeded(23)
  const balls = ['#e23b3b', '#f2c14e', '#4f8fe8', '#e23b3b', '#f2c14e']
  let snow = ''
  let deco = ''
  for (let i = 0; i < 7; i++) {
    const tip = 432 + i * 44
    const bottom = tip + 66
    const half = 26 + i * 13
    body += `<path d="M${cx} ${tip} L${cx + half} ${bottom} Q${cx} ${bottom + 12} ${cx - half} ${bottom}Z" fill="${i % 2 ? '#1f5a3c' : '#226343'}"/>`
    const n = 3 + i
    for (let k = 0; k < n; k++) {
      const px = cx - half + 6 + ((2 * half - 12) / (n - 1)) * k
      snow += `<ellipse cx="${r1(px)}" cy="${r1(bottom - 2 + (k % 2) * 3)}" rx="${r1(half / n + 5)}" ry="8" fill="${SNOW}"/>`
    }
    for (let k = 0; k < 2 + Math.floor(i / 2); k++) {
      const yy = tip + 30 + rnd() * 34
      const span = ((yy - tip) / 72) * half * 0.8
      const xx = cx + (rnd() * 2 - 1) * span
      deco += `<circle cx="${r1(xx)}" cy="${r1(yy)}" r="${r1(4.5 + rnd() * 2)}" fill="${balls[(i + k) % balls.length]}"/>`
    }
    for (let k = 0; k < 2 + i; k++) {
      const yy = tip + 20 + rnd() * 46
      const span = ((yy - tip) / 72) * half * 0.85
      const xx = cx + (rnd() * 2 - 1) * span
      deco += `<circle cx="${r1(xx)}" cy="${r1(yy)}" r="2.6" fill="#ffe9a6" class="tw" style="animation-delay:${r1(rnd() * 4)}s"/>`
    }
  }
  const star = `<circle cx="${cx}" cy="418" r="34" fill="url(#w-glow)" class="tw"/><path d="M${cx} 396 L${cx + 6} 411 L${cx + 22} 412 L${cx + 10} 422 L${cx + 14} 438 L${cx} 429 L${cx - 14} 438 L${cx - 10} 422 L${cx - 22} 412 L${cx - 6} 411Z" fill="#ffd34d" stroke="#e0a400" stroke-width="1.5"/>`
  return body + deco + snow + star
}

function snowman(x: number, y: number): string {
  return `<g transform="translate(${x} ${y}) scale(0.42)">
<ellipse cx="0" cy="50" rx="44" ry="38" fill="${SNOW}"/>
<ellipse cx="0" cy="-8" rx="30" ry="28" fill="${SNOW}"/>
<circle cx="0" cy="-50" r="22" fill="${SNOW}"/>
<rect x="-20" y="-96" width="40" height="30" rx="3" fill="#1a1a24"/><rect x="-30" y="-70" width="60" height="7" rx="3" fill="#1a1a24"/><rect x="-20" y="-78" width="40" height="6" fill="#d6283a"/>
<circle cx="-8" cy="-55" r="3" fill="#1a1a24"/><circle cx="8" cy="-55" r="3" fill="#1a1a24"/>
<path d="M0 -48 L22 -44 L0 -42Z" fill="#f08a24"/>
<path d="M-26 -28 Q0 -16 26 -28 L24 -20 Q0 -8 -24 -20Z" fill="#d6283a"/>
<circle cx="0" cy="-6" r="3.5" fill="#1a1a24"/><circle cx="0" cy="10" r="3.5" fill="#1a1a24"/>
</g>`
}

function lamp(x: number, base: number): string {
  return `<g transform="translate(${x} ${base})">
<rect x="-3" y="-120" width="6" height="120" fill="#2a2a38"/>
<path d="M-12 -120 H12 L9 -148 H-9Z" fill="#ffe7a0"/>
<path d="M-15 -148 H15 L0 -162Z" fill="#2a2a38"/><path d="M-17 -150 Q0 -170 17 -150Z" fill="${SNOW}"/>
<circle cx="0" cy="-134" r="34" fill="url(#w-glow)" class="tw"/>
<path d="M-10 -114 Q0 -106 10 -114 L7 -96 Q0 -102 -7 -96Z" fill="#d6283a"/>
</g>`
}

// ---------- right: moon, A-frame cabin ----------

function moon(): string {
  return `<circle cx="1490" cy="236" r="80" fill="url(#w-moon-glow)"/>
<circle cx="1490" cy="236" r="37" fill="#f3eed6"/>
<circle cx="1478" cy="226" r="6" fill="#e2dbbb"/><circle cx="1500" cy="250" r="8" fill="#e2dbbb"/><circle cx="1504" cy="222" r="3.5" fill="#e2dbbb"/>
<circle cx="1336" cy="185" r="3.5" fill="#ffffff"/><circle cx="1346" cy="185" r="3.5" fill="#ffffff"/><circle cx="1494" cy="184" r="3" fill="#ffffff" class="tw"/>`
}

function cabin(extra: number): string {
  const t = r1(extra)
  const ax = 1488
  let lights = ''
  for (let i = 1; i <= 9; i++) {
    const f = i / 10
    lights += `<circle cx="${r1(ax - 84 * f)}" cy="${r1(500 + 236 * f)}" r="3.2" fill="#ffd34d" class="tw" style="animation-delay:${r1(i * 0.31)}s"/>`
    lights += `<circle cx="${r1(ax + 84 * f)}" cy="${r1(500 + 236 * f)}" r="3.2" fill="#ffb347" class="tw" style="animation-delay:${r1(i * 0.27 + 1)}s"/>`
  }
  return `<g>
<rect x="1528" y="566" width="22" height="80" fill="#6a6d80"/><rect x="1524" y="556" width="30" height="14" rx="5" fill="${SNOW}"/>
<g fill="#cfd8ee" opacity="0.5">
<circle class="smoke" cx="1539" cy="540" r="10"/>
<circle class="smoke" cx="1539" cy="540" r="9" style="animation-delay:3s"/>
<circle class="smoke" cx="1539" cy="540" r="8" style="animation-delay:6s"/>
</g>
<path d="M${ax} 512 L1418 762 H1558Z" fill="#7a4520"/>
<path d="M1440 600 V762 M1460 560 V762 M1516 560 V762 M1536 600 V762" stroke="#5a2f17" stroke-width="2" opacity="0.7"/>
<path d="M${ax} 556 L1450 686 H1526Z" fill="url(#w-win)" stroke="#3b2414" stroke-width="4"/>
<path d="M${ax} 556 V686 M1462 646 H1514 M1474 606 H1502" stroke="#3b2414" stroke-width="3"/>
<circle cx="${ax}" cy="640" r="90" fill="url(#w-glow)" class="tw"/>
<rect x="1436" y="686" width="104" height="10" fill="#4a2a14"/>
<path d="M1440 696 V712 M1456 696 V712 M1472 696 V712 M1488 696 V712 M1504 696 V712 M1520 696 V712 M1536 696 V712 M1436 712 H1540" stroke="#4a2a14" stroke-width="3"/>
<rect x="1452" y="722" width="18" height="22" fill="#ffcf6a" stroke="#3b2414" stroke-width="2"/><rect x="1506" y="722" width="18" height="22" fill="#ffcf6a" stroke="#3b2414" stroke-width="2"/>
<rect x="1479" y="724" width="18" height="38" rx="2" fill="#a8282c"/>
<path d="M${ax} ${r1(482 - t)} L${r1(1396 - t / 2)} 754 L1414 760 L${ax} ${r1(512)} L1562 760 L${r1(1580 + t / 2)} 754Z" fill="${SNOW}"/>
<path d="M${r1(1396 - t / 2)} 754 Q1392 772 1404 776 Q1412 770 1414 760Z M${r1(1580 + t / 2)} 754 Q1584 772 1572 776 Q1564 770 1562 760Z" fill="${SNOW}"/>
<path d="M${ax} ${r1(482 - t)} Q${ax - 30} ${r1(520 - t)} ${r1(1450 - t / 3)} 590 M${ax} ${r1(482 - t)} Q${ax + 28} ${r1(524 - t)} ${r1(1528 + t / 3)} 594" stroke="${SNOW_SHADE}" stroke-width="3" fill="none" opacity="0.8"/>
${lights}
</g>`
}

// ---------- the whole scene ----------

export function sceneSvg(s: Stats): string {
  const inset = Math.max(0, Math.round(s.leftInset))
  const fill = (s.contextPercent ?? 0) / 100
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<defs>
<linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1434"/><stop offset="0.6" stop-color="#16245a"/><stop offset="1" stop-color="#25387a"/></linearGradient>
<radialGradient id="w-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
<radialGradient id="w-moon-glow"><stop offset="0.4" stop-color="#fff6d8" stop-opacity="0.3"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
<linearGradient id="w-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5530"/><stop offset="1" stop-color="#683b1d"/></linearGradient>
<linearGradient id="w-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2a640"/></linearGradient>
</defs>
<style>
.tw{animation:tw 4s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:1}50%{opacity:0.45}}
.fb{animation:fall 48s linear infinite}
.fc{animation:fall 34s linear infinite}
@keyframes fall{from{transform:translateY(0)}to{transform:translateY(1000px)}}
.flick{transform-box:fill-box;transform-origin:50% 100%;animation:flick 1.6s ease-in-out infinite alternate}
@keyframes flick{from{transform:scale(1,1)}to{transform:scale(0.9,1.08)}}
.smoke{animation:smoke 9s ease-out infinite;opacity:0}
@keyframes smoke{0%{transform:translate(0,0) scale(0.6);opacity:0}15%{opacity:0.8}100%{transform:translate(-40px,-130px) scale(2.2);opacity:0}}
</style>
<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
<rect x="-400" y="-600" width="2400" height="2000" fill="url(#w-sky)"/>
${stars()}
<g transform="translate(0 ${SHIFT})">${backdrop()}</g>
</svg>

<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMin meet">
<g transform="translate(0 ${SHIFT})">${moon()}</g>
</svg>

<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMax meet">
<g transform="translate(0 ${SHIFT})">
${groundMound(1240, 1640, 748, 'right')}
${snowyPine(1350, 770, 0.95)}${snowyPine(1310, 790, 0.7)}${snowyPine(1600, 760, 0.95)}
${cabin(fill * 16)}
${snowyPine(1395, 800, 0.55)}</g>
</svg>

<svg x="${inset}" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMinYMax meet" overflow="visible">
<g transform="translate(0 ${SHIFT})">
${groundMound(-700, 380, 752, 'left')}
${snowyPine(36, 770, 0.9)}${snowyPine(330, 762, 0.75)}
${tree()}
${snowman(238, 742)}
${lamp(288, 772)}
${snowyPine(372, 790, 0.5)}</g>
</svg>

<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
${drift(s.contextPercent)}
</svg>

<svg x="${inset}" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMinYMin meet">
<g transform="translate(0 ${SHIFT})">${sign(s)}</g>
</svg>

<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
${snowLayer(12, 38, 2.2, 3.2, 'fb')}
${snowLayer(13, 24, 3.4, 4.6, 'fc')}
</svg>
</svg>`
}

export function sceneAlt(s: Stats): string {
  const parts = [`Kontext ${s.contextPercent === null ? 'noch leer' : `${Math.round(s.contextPercent)} Prozent`}`]
  for (const l of s.limits) parts.push(`${l.kind === 'five_hour' ? '5-Stunden-Limit' : l.kind === 'seven_day' ? 'Wochenlimit' : 'Limit'} ${Math.round(l.percent)} Prozent`)
  return `Verschneite Winternacht mit Rotkehlchen-Schild, Christbaum, Schneemann, Laterne, Mond und Hütte. ${parts.join(', ')}.`
}
