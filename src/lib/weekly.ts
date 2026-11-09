import { CHALLENGES } from '../data/challenges'
import type { Challenge } from '../data/types'

/** ISO-ish week number for soft weekly rotation (cosmetic only). */
export function weekNumber(date = new Date()) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const dayNum = new Date(utc).getUTCDay() || 7
  const thursday = new Date(utc)
  thursday.setUTCDate(new Date(utc).getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1))
  return Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function weeklyChallenge(date = new Date()): Challenge {
  const week = weekNumber(date)
  return CHALLENGES[week % CHALLENGES.length]!
}

export function daysLeftInWeek(date = new Date()) {
  const day = date.getDay() // 0 Sun
  // Soft “week” ends Sunday night — days remaining including today
  return day === 0 ? 1 : 8 - day
}
