"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Star } from "lucide-react"

interface Act {
  id: string
  name: string
  time: string
  day: string
  genre: string
  stage: string
}

interface Friend {
  id: string
  name: string
  picks: string[]
}

interface FriendsListProps {
  friends: Friend[]
  allActs: Act[]
  myPicks: string[]
}

export function FriendsList({ friends, allActs, myPicks }: FriendsListProps) {
  const getCommonPicks = (friendPicks: string[]) => {
    return friendPicks.filter((pick) => myPicks.includes(pick))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Festival Crew
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {friends.map((friend) => {
              const commonPicks = getCommonPicks(friend.picks)
              const friendActs = allActs.filter((act) => friend.picks.includes(act.id))

              return (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-sm text-muted-foreground">{friend.picks.length} acts selected</p>
                    </div>
                  </div>

                  {commonPicks.length > 0 && (
                    <div className="mb-4">
                      <Badge variant="default" className="mb-2">
                        {commonPicks.length} shared picks
                      </Badge>
                      <div className="space-y-1">
                        {commonPicks.map((pickId) => {
                          const act = allActs.find((a) => a.id === pickId)
                          return act ? (
                            <div key={pickId} className="text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {act.name}
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Their picks:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {friendActs.map((act) => (
                        <div key={act.id} className="text-xs text-muted-foreground">
                          {act.name} • {act.day} {act.time}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
