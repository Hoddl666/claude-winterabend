import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Stats } from '../types'
import { makeColors } from './make-colors.js'
import { sceneAlt, sceneSvg } from './scene'

const SCENE = 'winterabend'

const stats = atom({ plugin: 'winterabend', key: 'stats' } as const, {
  contextPercent: null,
  cacheAt: null,
  cacheTtlMin: 60,
  now: 0,
  limits: [],
  leftInset: 300,
} as Stats, { shape: 'stats-2' })

// Deep winter blue, with warm candle light as the accent.
const { theme, problems } = makeColors({
  label: 'Winterabend',
  only: 'dark',
  roles: { accent: '#e8a23a', danger: '#e2453a', success: '#4fae6a', warning: '#e0a400', pro: '#9a7be0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0d1532',
        'surface-1': '#131d40',
        'surface-2': '#18234a',
        'surface-3': '#1c2850',
        'text-primary': '#eef2ff',
        'text-secondary': '#c8d0ee',
        'text-muted': '#a3adcf',
      },
    },
  },
})

// Thin glass, so the night shows through the sidebar and behind the chat too.
const BASE: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE, glass: { blur: 3, tint: '#0b1430', opacity: 0.38 } },
}

// The chat itself in the season's colours: a cranberry bubble with a snow cap for the person,
// frosted night-blue cards for Claude's words and the tool rows.
const LOOK: ThemeSetArgs = {
  ...BASE,
  style: {
    UserMessage: {
      backgroundColor: '#8c1d2c',
      color: '#fff6ee',
      radius: 18,
      paddingTop: 20,
      fill: { vector: { viewBox: 96, slice: 32, paths: [
        { d: 'M0 18Q0 6 12 6H84Q96 6 96 18V84Q96 96 84 96H12Q0 96 0 84Z', color: '#8c1d2c' },
        { d: 'M2 18Q4 2 18 4Q30 -2 44 4Q58 -1 70 4Q86 0 94 14Q96 22 88 20Q78 14 66 18Q54 12 42 18Q30 13 18 19Q6 24 2 18Z', color: '#f4f7ff' },
      ] } },
    },
    AssistantMessage: { backgroundColor: '#101a3ee6', color: '#eef2ff', radius: 16, padding: 14, borderColor: '#2b3a73', borderWidth: 1 },
    ToolUse: { color: '#dfe6ff', backgroundColor: '#16224af0', radius: 10, paddingX: 10 },
  },
}

async function setLook($: EngineInterface) {
  try {
    return await $.theme.set(LOOK)
  } catch (error) {
    $.ui.log(String(error))
    return await $.theme.set(BASE)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.toast(unpainted)

    const now = await $.clock.now()
    const usage = await $.session.usage()
    const saved = await $.store.get('leftInset')
    await update($, stats, s => ({
      ...s,
      now,
      leftInset: typeof saved === 'number' ? saved : s.leftInset,
      contextPercent: usage.context.percent ?? s.contextPercent,
      limits: usage.rateLimits.map(l => ({ kind: l.kind, percent: l.percentUsed, resetsAt: l.resetsAt })),
    }))

    const set = await setLook($)
    if (!set.isDrawn) $.ui.status(set.reason)
    await $.command.register({ name: 'winterabend', description: 'Das Winterabend-Theme (wieder) einschalten' })

    // Once a minute, so the cache candle burns down and "kalt" shows in time.
    $.clock.every(60_000, async () => {
      const t = await $.clock.now()
      await update($, stats, s => ({ ...s, now: t }))
    })

    return next(e)
  })

  on('command.run', { command: 'winterabend' }, async ($, e) => {
    // "/winterabend rand 260" moves the left art to start 260 px from the window edge.
    const m = /^\s*rand\s+(\d{1,4})\s*$/i.exec(e.args)
    if (m) {
      const px = Math.min(1200, Number(m[1]))
      await $.store.set('leftInset', px)
      await update($, stats, s => ({ ...s, leftInset: px }))
      return { text: `Die linke Seite beginnt jetzt ${px} px vom Fensterrand.` }
    }
    const set = await setLook($)
    return { text: set.isDrawn ? 'Winterabend ist eingeschaltet. Mit „/winterabend rand 260“ verschiebst du die linke Seite.' : `Winterabend gesetzt, aber nicht gezeichnet: ${set.reason}` }
  })

  on('session.measure', async ($, e, next) => {
    const now = await $.clock.now()
    await update($, stats, s => ({
      ...s,
      now,
      contextPercent: e.context.percent ?? s.contextPercent,
      limits: e.rateLimits.map(l => ({ kind: l.kind, percent: l.percentUsed, resetsAt: l.resetsAt })),
    }))
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (e.agentId === undefined && result.usage) {
      const u = result.usage
      const ttl = (u.ephemeral_1h_input_tokens ?? 0) > 0 ? 60 : (u.ephemeral_5m_input_tokens ?? 0) > 0 ? 5 : undefined
      const now = await $.clock.now()
      await update($, stats, s => ({ ...s, now, cacheAt: now, cacheTtlMin: ttl ?? s.cacheTtlMin }))
    }
    return result
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    if (e.props.scene !== SCENE) return next(e)
    const { Svg } = $.ui.resolve(e)
    const s = await read($, stats)
    return <Svg source={sceneSvg(s)} alt={sceneAlt(s)} isInteractive />
  })
}
