"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PriorityBadge } from "@/components/priority-picker"
import { AlertTriangle, Clock, MapPin, Lightbulb, CheckCircle } from "lucide-react"
import type { Act, Priority, Clash } from "@/lib/types"
import { getAdjacentTimeSlots } from "@/lib/time-utils"

interface ClashAnalyzerProps {
  allActs: (Act & { priority: Priority })[]
}

export function ClashAnalyzer({ allActs }: ClashAnalyzerProps) {
  const priorityActs = allActs.filter((act) => act.priority !== "none")

  // Add this right after the priorityActs definition for debugging
  console.log("Priority acts:", priorityActs.length)
  console.log("Sample priority acts:", priorityActs.slice(0, 5))

  // Group acts by day and time to find clashes
  const clashes: Clash[] = []
  const timeSlots = new Map<string, (Act & { priority: Priority })[]>()

  // Group acts by day-time combination
  priorityActs.forEach((act) => {
    const key = `${act.day}-${act.time}`
    if (!timeSlots.has(key)) {
      timeSlots.set(key, [])
    }
    timeSlots.get(key)!.push(act)
  })

  // Find clashes (multiple acts at same time)
  timeSlots.forEach((acts, key) => {
    if (acts.length > 1) {
      const [day, time] = key.split("-", 2)
      const mustSeeCount = acts.filter((act) => act.priority === "must-see").length
      const likeToGoCount = acts.filter((act) => act.priority === "like-to-go").length

      clashes.push({
        timeSlot: { day, time, startTime: time.split("-")[0], endTime: time.split("-")[1] || "" },
        acts,
        mustSeeCount,
        likeToGoCount,
      })
    }
  })

  // Also check for overlapping time slots (more sophisticated clash detection)
  const overlappingClashes: Clash[] = []
  const actsByDay = priorityActs.reduce(
    (acc, act) => {
      if (!acc[act.day]) acc[act.day] = []
      acc[act.day].push(act)
      return acc
    },
    {} as Record<string, (Act & { priority: Priority })[]>,
  )

  Object.entries(actsByDay).forEach(([day, dayActs]) => {
    for (let i = 0; i < dayActs.length; i++) {
      for (let j = i + 1; j < dayActs.length; j++) {
        const act1 = dayActs[i]
        const act2 = dayActs[j]

        // Check if times overlap
        if (act1.time !== "TBA" && act2.time !== "TBA" && act1.time !== act2.time) {
          const overlap = checkTimeOverlap(act1.time, act2.time)
          if (overlap) {
            // Check if we already have this clash
            const existingClash = overlappingClashes.find(
              (clash) => clash.acts.some((a) => a.id === act1.id) && clash.acts.some((a) => a.id === act2.id),
            )

            if (!existingClash) {
              const acts = [act1, act2]
              const mustSeeCount = acts.filter((act) => act.priority === "must-see").length
              const likeToGoCount = acts.filter((act) => act.priority === "like-to-go").length

              overlappingClashes.push({
                timeSlot: {
                  day,
                  time: `${act1.time} / ${act2.time}`,
                  startTime: act1.time.split("-")[0],
                  endTime: act2.time.split("-")[1] || "",
                },
                acts,
                mustSeeCount,
                likeToGoCount,
              })
            }
          }
        }
      }
    }
  })

  // Combine exact time clashes and overlapping clashes
  const allClashes = [...clashes, ...overlappingClashes]

  // Helper function to check if two time ranges overlap
  function checkTimeOverlap(time1: string, time2: string): boolean {
    if (time1 === "TBA" || time2 === "TBA") return false

    const parseTime = (timeStr: string) => {
      const [start, end] = timeStr.split("-")
      if (!start || !end) return null

      const parseTimeToMinutes = (time: string) => {
        const [hours, minutes] = time.trim().split(":").map(Number)
        return hours * 60 + minutes
      }

      return {
        start: parseTimeToMinutes(start),
        end: parseTimeToMinutes(end),
      }
    }

    const range1 = parseTime(time1)
    const range2 = parseTime(time2)

    if (!range1 || !range2) return false

    // Check if ranges overlap
    return range1.start < range2.end && range2.start < range1.end
  }

  // Find adjacent opportunities for must-see acts
  const mustSeeActs = priorityActs.filter((act) => act.priority === "must-see")
  const adjacentOpportunities: Array<{
    mustSeeAct: Act & { priority: Priority }
    adjacentActs: (Act & { priority: Priority })[]
  }> = []

  mustSeeActs.forEach((mustSeeAct) => {
    const sameDayActs = priorityActs.filter(
      (act) => act.day === mustSeeAct.day && act.id !== mustSeeAct.id && act.priority === "like-to-go",
    )

    const adjacent = sameDayActs.filter((act) => {
      const allSameDayTimes = sameDayActs.map((a) => a.time)
      return getAdjacentTimeSlots(mustSeeAct.time, allSameDayTimes).includes(act.time)
    })

    if (adjacent.length > 0) {
      adjacentOpportunities.push({
        mustSeeAct,
        adjacentActs: adjacent,
      })
    }
  })

  // Sort clashes by severity (must-see clashes first)
  const sortedClashes = allClashes.sort((a, b) => {
    if (a.mustSeeCount !== b.mustSeeCount) {
      return b.mustSeeCount - a.mustSeeCount
    }
    return b.likeToGoCount - a.likeToGoCount
  })

  if (priorityActs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No acts selected</h3>
          <p className="text-muted-foreground">
            Start marking acts as "Must See" or "Like to Go" to see clash analysis and recommendations!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Festival Plan Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{mustSeeActs.length}</div>
              <div className="text-sm text-muted-foreground">Must See Acts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {priorityActs.filter((act) => act.priority === "like-to-go").length}
              </div>
              <div className="text-sm text-muted-foreground">Like to Go Acts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{sortedClashes.length}</div>
              <div className="text-sm text-muted-foreground">Time Clashes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{adjacentOpportunities.length}</div>
              <div className="text-sm text-muted-foreground">Adjacent Opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Clashes */}
      {sortedClashes.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Schedule Clashes ({sortedClashes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedClashes.map((clash, index) => (
              <Alert key={index} className={clash.mustSeeCount > 1 ? "border-red-200 bg-red-50" : ""}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {clash.timeSlot.day} {clash.timeSlot.time}
                  {clash.mustSeeCount > 1 && (
                    <Badge variant="destructive">Critical: {clash.mustSeeCount} Must-See Acts</Badge>
                  )}
                  {clash.mustSeeCount <= 1 && clash.likeToGoCount > 1 && (
                    <Badge variant="secondary">Minor: {clash.likeToGoCount} Like-to-Go Acts</Badge>
                  )}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    {clash.acts.map((act) => (
                      <div key={act.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium">{act.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {act.stage}
                            {act.genre && act.genre !== "TBA" && (
                              <Badge variant="outline" className="text-xs">
                                {act.genre}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <PriorityBadge priority={act.priority} />
                      </div>
                    ))}
                    {clash.mustSeeCount > 1 && (
                      <div className="text-sm text-red-700 font-medium mt-2">
                        ⚠️ You need to choose between {clash.mustSeeCount} must-see acts!
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Adjacent Opportunities */}
      {adjacentOpportunities.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations ({adjacentOpportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adjacentOpportunities.map((opportunity, index) => (
              <Alert key={index} className="border-green-200 bg-white">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Perfect timing around {opportunity.mustSeeAct.name}</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 bg-red-50 rounded border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{opportunity.mustSeeAct.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {opportunity.mustSeeAct.day} {opportunity.mustSeeAct.time} • {opportunity.mustSeeAct.stage}
                          </div>
                        </div>
                        <PriorityBadge priority={opportunity.mustSeeAct.priority} />
                      </div>
                    </div>

                    <div className="text-sm font-medium text-green-700">
                      ✨ You can also catch these acts before/after:
                    </div>

                    {opportunity.adjacentActs.map((act) => (
                      <div key={act.id} className="p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{act.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {act.day} {act.time} • {act.stage}
                            </div>
                          </div>
                          <PriorityBadge priority={act.priority} />
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Clashes Message */}
      {sortedClashes.length === 0 && priorityActs.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="text-green-800">Perfect Schedule! 🎉</AlertTitle>
          <AlertDescription className="text-green-700">
            Great news! None of your selected acts clash with each other. You can see all your must-see and like-to-go
            acts without any conflicts.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
