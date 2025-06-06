"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriorityPicker, PriorityBadge } from "@/components/priority-picker"
import { Clock, MapPin } from "lucide-react"
import type { Act, Priority } from "@/lib/types"

interface FestivalScheduleProps {
  festivalData: {
    name: string
    dates: string
    stages: Array<{
      id: string
      name: string
      acts: Act[]
    }>
  }
  actPriorities: Record<string, Priority>
  onPriorityChange: (actId: string, priority: Priority) => void
}

export function FestivalSchedule({ festivalData, actPriorities, onPriorityChange }: FestivalScheduleProps) {
  const days = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"]

  // Sort acts by time, but in reverse order (latest first)
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
    <Tabs defaultValue="Wednesday" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        {days.map((day) => (
          <TabsTrigger key={day} value={day} className="text-xs">
            {day.slice(0, 3)}
          </TabsTrigger>
        ))}
      </TabsList>

      {days.map((day) => (
        <TabsContent key={day} value={day}>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {festivalData.stages.map((stage) => {
              const dayActs = stage.acts.filter((act) => act.day === day)
              if (dayActs.length === 0) return null

              // Sort acts by time (latest first)
              const sortedActs = [...dayActs].sort(sortActsByTimeDesc)

              return (
                <Card key={`${day}-${stage.id}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {stage.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sortedActs.map((act) => {
                      const priority = actPriorities[act.id] || "none"

                      return (
                        <div
                          key={act.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            priority === "must-see"
                              ? "bg-red-50 border-red-200"
                              : priority === "like-to-go"
                                ? "bg-blue-50 border-blue-200"
                                : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium">{act.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {act.time}
                              </div>
                            </div>
                            <PriorityPicker
                              currentPriority={priority}
                              onPriorityChange={(newPriority) => onPriorityChange(act.id, newPriority)}
                              size="sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {act.genre && act.genre !== "TBA" && (
                              <Badge variant="secondary" className="text-xs">
                                {act.genre}
                              </Badge>
                            )}
                            <PriorityBadge priority={priority} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
