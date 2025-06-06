export interface Act {
  id: string
  name: string
  time: string
  day: string
  genre: string
  stage?: string
  stageId?: string
}

export interface Stage {
  id: string
  name: string
  acts: Act[]
}

export interface FestivalData {
  name: string
  dates: string
  stages: Stage[]
  lastUpdated?: string
  source?: string
}

export type Priority = "must-see" | "like-to-go" | "none"

export interface ActPriority {
  actId: string
  priority: Priority
}

export interface TimeSlot {
  day: string
  time: string
  startTime: string
  endTime: string
}

export interface Clash {
  timeSlot: TimeSlot
  acts: (Act & { priority: Priority })[]
  mustSeeCount: number
  likeToGoCount: number
}
