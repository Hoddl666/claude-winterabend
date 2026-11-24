export type Limit = { kind: string; percent: number; resetsAt?: string }

export type Stats = {
  /** Kontext-Füllung in Prozent, null vor der ersten Antwort. */
  contextPercent: number | null
  /** Zeitpunkt der letzten Hauptantwort (ms), null vor der ersten. */
  cacheAt: number | null
  /** Lebensdauer des Prompt-Caches in Minuten. */
  cacheTtlMin: number
  /** Jetzt, zuletzt vom Minutentakt gesetzt (ms). */
  now: number
  limits: Limit[]
  /** CSS pixels the left art keeps clear for the sidebar. */
  leftInset: number
}

declare module 'claude-code' {
  interface PluginState {
    winterabend: { stats: Shaped<Stats> }
  }
}
