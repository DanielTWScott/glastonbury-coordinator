export function parseTime(timeString: string): { start: string; end: string } {
  if (timeString === "TBA" || !timeString.includes("-")) {
    return { start: "00:00", end: "00:00" }
  }

  const [start, end] = timeString.split("-")
  return { start: start.trim(), end: end.trim() }
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function isTimeOverlap(time1: string, time2: string): boolean {
  if (time1 === "TBA" || time2 === "TBA") return false

  const { start: start1, end: end1 } = parseTime(time1)
  const { start: start2, end: end2 } = parseTime(time2)

  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  // Check if times overlap
  return start1Min < end2Min && start2Min < end1Min
}

export function getAdjacentTimeSlots(targetTime: string, allTimes: string[]): string[] {
  if (targetTime === "TBA") return []

  const { start: targetStart, end: targetEnd } = parseTime(targetTime)
  const targetStartMin = timeToMinutes(targetStart)
  const targetEndMin = timeToMinutes(targetEnd)

  return allTimes.filter((time) => {
    if (time === "TBA" || time === targetTime) return false

    const { start, end } = parseTime(time)
    const startMin = timeToMinutes(start)
    const endMin = timeToMinutes(end)

    // Adjacent means ending when target starts or starting when target ends
    return endMin === targetStartMin || startMin === targetEndMin
  })
}
