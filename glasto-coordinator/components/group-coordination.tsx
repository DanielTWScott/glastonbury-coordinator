"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "@/components/priority-picker"
import { Users, Heart, Clock, MapPin } from "lucide-react"
import type { Act, Priority, SharedPicks } from "@/lib/types"

interface GroupCoordinationProps {
  allActs: Act[]
  myPicks: Record<string, Priority>
  myName: string
  sharedPicks: SharedPicks[]
}

export function GroupCoordination({ allActs, myPicks, myName, sharedPicks }: GroupCoordinationProps) {
  // Create a comprehensive view of who wants to see what
  const actInterest = allActs
    .map((act) => {
      const myPriority = myPicks[act.id] || "none"
      const friendsInterested: Array<{ name: string; priority: Priority }> = []

      sharedPicks.forEach((friend) => {
        const friendPriority = friend.picks[act.id] || "none"
        if (friendPriority !== "none") {
          friendsInterested.push({
            name: friend.userName,
            priority: friendPriority,
          })
        }
      })

      const totalInterested = (myPriority !== "none" ? 1 : 0) + friendsInterested.length
      const mustSeeCount =
        (myPriority === "must-see" ? 1 : 0) + friendsInterested.filter((f) => f.priority === "must-see").length
      const likeToGoCount =
        (myPriority === "like-to-go" ? 1 : 0) + friendsInterested.filter((f) => f.priority === "like-to-go").length

      return {
        act,
        myPriority,
        friendsInterested,
        totalInterested,
        mustSeeCount,
        likeToGoCount,
      }
    })
    .filter((item) => item.totalInterested > 0)

  // Sort by interest level (must-see first, then total interest)
  const sortedByInterest = actInterest.sort((a, b) => {
    if (a.mustSeeCount !== b.mustSeeCount) {
      return b.mustSeeCount - a.mustSeeCount
    }
    return b.totalInterested - a.totalInterested
  })

  // Group by day for better organization
  const groupedByDay = sortedByInterest.reduce(
    (acc, item) => {
      if (!acc[item.act.day]) acc[item.act.day] = []
      acc[item.act.day].push(item)
      return acc
    },
    {} as Record<string, typeof sortedByInterest>,
  )

  const orderedDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"]

  if (sortedByInterest.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No group interests yet</h3>
          <p className="text-muted-foreground">
            Import your friends' picks to see which acts you all want to see together!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Coordination Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{sortedByInterest.length}</div>
              <div className="text-sm text-muted-foreground">Acts with Interest</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {sortedByInterest.filter((item) => item.mustSeeCount > 1).length}
              </div>
              <div className="text-sm text-muted-foreground">Group Must-Sees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {sortedByInterest.filter((item) => item.totalInterested >= 3).length}
              </div>
              <div className="text-sm text-muted-foreground">Popular Acts (3+ people)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{sharedPicks.length + 1}</div>
              <div className="text-sm text-muted-foreground">Total People</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="space-y-4">
                {groupedByDay[day].map((item) => (
                  <div
                    key={item.act.id}
                    className={`p-4 border rounded-lg ${
                      item.mustSeeCount > 1
                        ? "bg-red-50 border-red-200"
                        : item.totalInterested >= 3
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.act.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.act.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.act.stage}
                          </div>
                        </div>
                        {item.act.genre && item.act.genre !== "TBA" && (
                          <Badge variant="outline" className="text-xs mt-2">
                            {item.act.genre}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.mustSeeCount > 1 ? "destructive" : "secondary"}
                          className={item.totalInterested >= 3 ? "bg-blue-600 text-white" : ""}
                        >
                          {item.totalInterested} interested
                        </Badge>
                        {item.mustSeeCount > 1 && (
                          <Badge variant="destructive">
                            <Heart className="h-3 w-3 mr-1 fill-current" />
                            Group Priority
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Who's interested */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Who's interested:</h5>
                      <div className="flex flex-wrap gap-2">
                        {/* My interest */}
                        {item.myPriority !== "none" && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <span className="text-sm font-medium">{myName || "You"}</span>
                            <PriorityBadge priority={item.myPriority} />
                          </div>
                        )}

                        {/* Friends' interest */}
                        {item.friendsInterested.map((friend, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <span className="text-sm font-medium">{friend.name}</span>
                            <PriorityBadge priority={friend.priority} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special indicators */}
                    {item.mustSeeCount > 1 && (
                      <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-800">
                        🔥 <strong>Group Must-See!</strong> {item.mustSeeCount} people have this as a priority
                      </div>
                    )}

                    {item.totalInterested >= 3 && item.mustSeeCount <= 1 && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                        ⭐ <strong>Popular Choice!</strong> {item.totalInterested} people want to see this
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
