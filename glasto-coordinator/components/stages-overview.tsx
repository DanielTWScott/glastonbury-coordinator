"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Music, Users, Clock } from "lucide-react"

interface Stage {
  id: string
  name: string
  acts: any[]
}

interface StagesOverviewProps {
  stages: Stage[]
}

export function StagesOverview({ stages }: StagesOverviewProps) {
  const getStageDescription = (stageId: string) => {
    const descriptions: Record<string, string> = {
      pyramid: "The iconic main stage - home to the biggest headliners and legendary performances",
      other: "The second stage featuring major acts and breakthrough artists",
      "west-holts": "Showcasing world music, electronic acts, and diverse global sounds",
      park: "Intimate performances in a beautiful woodland setting",
      woodsies: "Alternative and indie acts in a forest clearing",
      acoustic: "Stripped-back performances and singer-songwriters",
      avalon: "A mix of established and emerging artists across all genres",
      "shangri-la": "Electronic music and late-night party vibes",
      glade: "Underground electronic music and dance culture",
      arcadia: "Spectacular electronic performances with incredible production",
      "lonely-hearts": "Electronic music and club culture",
      levels: "House, techno, and electronic dance music",
      iicon: "Cutting-edge electronic and experimental sounds",
      kinetic: "High-energy electronic music and rave culture",
      "left-field": "Political activism, folk, and alternative voices",
    }
    return descriptions[stageId] || "A unique stage with diverse programming"
  }

  const getStageGenres = (acts: any[]) => {
    const genres = acts.map((act) => act.genre).filter((genre) => genre && genre !== "TBA")
    const uniqueGenres = [...new Set(genres)]
    return uniqueGenres.slice(0, 4) // Show top 4 genres
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">All Festival Stages</h2>
        <p className="text-muted-foreground">Explore all {stages.length} stages across Glastonbury 2025</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => {
          const genres = getStageGenres(stage.acts)
          const totalActs = stage.acts.length

          return (
            <Card key={stage.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  {stage.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{getStageDescription(stage.id)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span className="text-sm font-medium">{totalActs} Acts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">All Days</span>
                  </div>
                </div>

                {genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Main Genres:</p>
                    <div className="flex flex-wrap gap-1">
                      {genres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {stage.acts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Featured Acts:</p>
                    <div className="space-y-1">
                      {stage.acts.slice(0, 3).map((act) => (
                        <div key={act.id} className="text-sm text-muted-foreground flex items-center justify-between">
                          <span className="font-medium">{act.name}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{act.day}</span>
                          </div>
                        </div>
                      ))}
                      {stage.acts.length > 3 && (
                        <p className="text-xs text-muted-foreground">+{stage.acts.length - 3} more acts</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Complete Festival Coverage</h3>
            <p className="text-muted-foreground mb-4">
              From the iconic Pyramid Stage to intimate acoustic venues, Glastonbury 2025 offers something for every
              music lover
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stages.length}</div>
                <div className="text-sm text-muted-foreground">Total Stages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {stages.reduce((total, stage) => total + stage.acts.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Acts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-muted-foreground">Festival Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-muted-foreground">Music</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
