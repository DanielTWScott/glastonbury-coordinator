"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PriorityPicker, PriorityBadge } from "@/components/priority-picker"
import { Star, Clock, MapPin } from "lucide-react"
import type { Act, Priority } from "@/lib/types"

interface MyPicksProps {
  allActs: Act[]
  actPriorities: Record<string, Priority>
  onPriorityChange: (actId: string, priority: Priority) => void
}

export function MyPicks({ allActs, actPriorities, onPriorityChange }: MyPicksProps) {
  const mySelectedActs = allActs.filter((act) => actPriorities[act.id] && actPriorities[act.id] !== "none")

  if (mySelectedActs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No acts selected yet</h3>
          <p className="text-muted-foreground">
            Go to the Schedule tab to start marking acts as "Must See" or "Like to Go"!
          </p>
        </CardContent>
      </Card>
    )
  }

  const groupedByPriority = {
    "must-see": mySelectedActs.filter((act) => actPriorities[act.id] === "must-see"),
    "like-to-go": mySelectedActs.filter((act) => actPriorities[act.id] === "like-to-go"),
  }

  const groupedByDay = mySelectedActs.reduce(
    (acc, act) => {
      if (!acc[act.day]) acc[act.day] = []
      acc[act.day].push(act)
      return acc
    },
    {} as Record<string, Act[]>,
  )

  // Sort days in correct festival order: Wednesday to Monday
  const orderedDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"]

  // Sort function for acts by time (latest first)
  const sortActsByTimeDesc = (a: Act, b: Act) => {
    // Handle TBA times
    if (a.time === "TBA") return 1
    if (b.time === "TBA") return -1

    // Extract start time for comparison
    const aStartTime = a.time.split("-")[0].trim()
    const bStartTime = b.time.split("-")[0].trim()

    // Convert to 24-hour format for better comparison
    const aHour = Number.parseInt(aStartTime.split(":")[0])
    const bHour = Number.parseInt(bStartTime.split(":")[0])

    // Compare hours first (latest first)
    if (aHour !== bHour) {
      return bHour - aHour
    }

    // If hours are the same, compare minutes
    const aMinute = Number.parseInt(aStartTime.split(":")[1] || "0")
    const bMinute = Number.parseInt(bStartTime.split(":")[1] || "0")

    // Compare in reverse order (latest first)
    return bMinute - aMinute
  }

  return (
    <div className="space-y-6">
      {/* Priority Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Star className="h-5 w-5 fill-current" />
              Must See Acts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{groupedByPriority["must-see"].length}</div>
            <p className="text-sm text-red-700">These are your absolute priorities</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Like to Go Acts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{groupedByPriority["like-to-go"].length}</div>
            <p className="text-sm text-blue-700">If time permits and no clashes</p>
          </CardContent>
        </Card>
      </div>

      {/* Acts by Day */}
      {orderedDays.map((day) => {
        if (!groupedByDay[day] || groupedByDay[day].length === 0) return null

        return (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {day}
                <Badge variant="secondary">{groupedByDay[day].length} acts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupedByDay[day].sort(sortActsByTimeDesc).map((act) => {
                  const priority = actPriorities[act.id] || "none"

                  return (
                    <div
                      key={act.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        priority === "must-see" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{act.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {act.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {act.stage}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {act.genre && act.genre !== "TBA" && (
                            <Badge variant="secondary" className="text-xs">
                              {act.genre}
                            </Badge>
                          )}
                          <PriorityBadge priority={priority} />
                        </div>
                      </div>
                      <PriorityPicker
                        currentPriority={priority}
                        onPriorityChange={(newPriority) => onPriorityChange(act.id, newPriority)}
                        size="sm"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
