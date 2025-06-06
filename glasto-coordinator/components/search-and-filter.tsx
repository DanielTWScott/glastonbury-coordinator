"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Clock, MapPin, Search, Filter } from "lucide-react"

interface Act {
  id: string
  name: string
  time: string
  day: string
  genre: string
  stage: string
  stageId: string
}

interface Stage {
  id: string
  name: string
  acts: any[]
}

interface SearchAndFilterProps {
  allActs: Act[]
  myPicks: string[]
  onTogglePick: (actId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedDay: string
  onDayChange: (day: string) => void
  selectedStage: string
  onStageChange: (stage: string) => void
  selectedGenre: string
  onGenreChange: (genre: string) => void
  stages: Stage[]
}

export function SearchAndFilter({
  allActs,
  myPicks,
  onTogglePick,
  searchQuery,
  onSearchChange,
  selectedDay,
  onDayChange,
  selectedStage,
  onStageChange,
  selectedGenre,
  onGenreChange,
  stages,
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const days = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"]
  const genres = [...new Set(allActs.map((act) => act.genre))].sort()

  const clearFilters = () => {
    onSearchChange("")
    onDayChange("all")
    onStageChange("all")
    onGenreChange("all")
  }

  const activeFiltersCount = [selectedDay, selectedStage, selectedGenre].filter((f) => f !== "all").length

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Search & Filter Acts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search acts, genres..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 sm:grid-cols-3 p-4 border rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium mb-2 block">Day</label>
                <Select value={selectedDay} onValueChange={onDayChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All days</SelectItem>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Stage</label>
                <Select value={selectedStage} onValueChange={onStageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stages</SelectItem>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Genre</label>
                <Select value={selectedGenre} onValueChange={onGenreChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Search Results ({allActs.length} acts)</CardTitle>
        </CardHeader>
        <CardContent>
          {allActs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No acts found matching your criteria</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {allActs.map((act) => (
                <div
                  key={act.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    myPicks.includes(act.id) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">{act.name}</h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {act.day} {act.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{act.stage}</span>
                      </div>
                    </div>
                    <Button
                      variant={myPicks.includes(act.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => onTogglePick(act.id)}
                      className="flex-shrink-0"
                    >
                      <Star className={`h-4 w-4 ${myPicks.includes(act.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {act.genre}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
