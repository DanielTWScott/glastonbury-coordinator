import type { Priority } from "./types"

export interface SharedPicks {
  userId: string
  userName: string
  picks: Record<string, Priority>
  lastUpdated: string
}

export function generateShareableLink(picks: Record<string, Priority>, userName: string): string {
  const data = {
    userName,
    picks,
    timestamp: Date.now(),
  }

  // In a real app, this would be a proper sharing service
  // For demo purposes, we'll encode it in the URL
  const encoded = btoa(JSON.stringify(data))
  return `${window.location.origin}${window.location.pathname}?shared=${encoded}`
}

export function parseSharedLink(url: string): SharedPicks | null {
  try {
    const urlParams = new URLSearchParams(new URL(url).search)
    const shared = urlParams.get("shared")

    if (!shared) return null

    const decoded = JSON.parse(atob(shared))
    return {
      userId: `shared-${decoded.timestamp}`,
      userName: decoded.userName,
      picks: decoded.picks,
      lastUpdated: new Date(decoded.timestamp).toISOString(),
    }
  } catch (error) {
    console.error("Failed to parse shared link:", error)
    return null
  }
}

export function exportToPicks(picks: Record<string, Priority>): string {
  return JSON.stringify(picks, null, 2)
}

export function importFromPicks(jsonString: string): Record<string, Priority> | null {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("Failed to import picks:", error)
    return null
  }
}
