"use client"

import { useState, useEffect } from "react"
import { FestivalSchedule } from "@/components/festival-schedule"
import { MyPicks } from "@/components/my-picks"
import { SearchAndFilter } from "@/components/search-and-filter"
import { StagesOverview } from "@/components/stages-overview"
import { ClashAnalyzer } from "@/components/clash-analyzer"
import { SharingPanel } from "@/components/sharing-panel"
import { GroupCoordination } from "@/components/group-coordination"
import { DataSourceIndicator } from "@/components/data-source-indicator"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Music,
  Users,
  Calendar,
  Heart,
  Search,
  Shuffle,
  Globe,
  MapPin,
  AlertTriangle,
  Share2,
  Check,
  Save,
} from "lucide-react"
import { realGlastonbury2025 } from "@/lib/real-glastonbury-2025"
import { parseSharedLink } from "@/lib/sharing"
import type { Priority, SharedPicks } from "@/lib/types"

export default function GlastonburyCoordinator() {
  // Use localStorage for persistent data
  const [actPriorities, setActPriorities] = useLocalStorage<Record<string, Priority>>("glasto-act-priorities", {})
  const [myName, setMyName] = useLocalStorage<string>("glasto-my-name", "")
  const [sharedPicks, setSharedPicks] = useLocalStorage<SharedPicks[]>("glasto-shared-picks", [])

  // Regular state for UI-only data
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDay, setSelectedDay] = useState<string>("all")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  // Use real Glastonbury data only
  const festivalData = realGlastonbury2025

  // Check for shared picks in URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shared = urlParams.get("shared")

    if (shared) {
      const sharedData = parseSharedLink(window.location.href)
      if (sharedData) {
        setSharedPicks((prev) => {
          const filtered = prev.filter((p) => p.userId !== sharedData.userId)
          return [...filtered, sharedData]
        })
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [setSharedPicks])

  // Show saved message when priorities change
  useEffect(() => {
    if (Object.keys(actPriorities).length > 0) {
      setShowSavedMessage(true)
      const timer = setTimeout(() => setShowSavedMessage(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [actPriorities])

  const handlePriorityChange = (actId: string, priority: Priority) => {
    setActPriorities((prev) => ({
      ...prev,
      [actId]: priority,
    }))
  }

  const handleAddSharedPicks = (picks: SharedPicks) => {
    setSharedPicks((prev) => {
      // Remove existing picks from same user and add new ones
      const filtered = prev.filter((p) => p.userId !== picks.userId)
      return [...filtered, picks]
    })
  }

  const handleImportPicks = (picks: Record<string, Priority>) => {
    setActPriorities(picks)
  }

  const generateRandomPicks = () => {
    const allActIds = festivalData.stages.flatMap((stage) => stage.acts.map((act) => act.id))
    const newPriorities: Record<string, Priority> = {}

    // Generate 3-5 must-see acts
    const mustSeeCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < mustSeeCount; i++) {
      const randomId = allActIds[Math.floor(Math.random() * allActIds.length)]
      if (!newPriorities[randomId]) {
        newPriorities[randomId] = "must-see"
      }
    }

    // Generate 5-8 like-to-go acts
    const likeToGoCount = Math.floor(Math.random() * 4) + 5
    let attempts = 0
    while (Object.values(newPriorities).filter((p) => p === "like-to-go").length < likeToGoCount && attempts < 50) {
      const randomId = allActIds[Math.floor(Math.random() * allActIds.length)]
      if (!newPriorities[randomId]) {
        newPriorities[randomId] = "like-to-go"
      }
      attempts++
    }

    setActPriorities(newPriorities)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all your picks and start fresh?")) {
      setActPriorities({})
      setSharedPicks([])
      setMyName("")
    }
  }

  const allActs = festivalData.stages.flatMap((stage) =>
    stage.acts.map((act) => ({ ...act, stage: stage.name, stageId: stage.id })),
  )

  const actsWithPriorities = allActs.map((act) => ({
    ...act,
    priority: actPriorities[act.id] || ("none" as Priority),
  }))

  const filteredActs = actsWithPriorities.filter((act) => {
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.genre && act.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDay = selectedDay === "all" || act.day === selectedDay
    const matchesStage = selectedStage === "all" || act.stageId === selectedStage
    const matchesGenre = selectedGenre === "all" || act.genre === selectedGenre

    return matchesSearch && matchesDay && matchesStage && matchesGenre
  })

  const totalActs = allActs.length
  const mustSeeCount = Object.values(actPriorities).filter((p) => p === "must-see").length
  const likeToGoCount = Object.values(actPriorities).filter((p) => p === "like-to-go").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-2 sm:p-4">
        <div className="text-center mb-4 sm:mb-8 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Music className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="hidden sm:inline">Glastonbury 2025 Coordinator</span>
            <span className="sm:hidden">Glasto 2025</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base px-2">
            Plan your festival experience and coordinate with friends
          </p>

          {/* Mobile-optimized badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              {festivalData.dates}
            </Badge>
            <Badge variant="outline" className="text-white border-white text-xs">
              <span className="hidden sm:inline">
                {totalActs} Official Acts • {festivalData.stages.length} Stages
              </span>
              <span className="sm:hidden">{totalActs} Acts</span>
            </Badge>
            <Badge variant="default" className="bg-green-600 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Complete Official Lineup</span>
              <span className="sm:hidden">Official</span>
            </Badge>
          </div>

          {/* Mobile-optimized action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomPicks}
              className="flex items-center gap-1 text-xs"
            >
              <Shuffle className="h-3 w-3" />
              <span className="hidden sm:inline">Random Picks</span>
              <span className="sm:hidden">Random</span>
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllData} className="flex items-center gap-1 text-xs">
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>

          {/* Mobile-optimized stats */}
          {(mustSeeCount > 0 || likeToGoCount > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <Badge variant="destructive" className="bg-red-600 text-xs">
                <Heart className="h-3 w-3 mr-1 fill-current" />
                {mustSeeCount} <span className="hidden sm:inline">Must See</span>
              </Badge>
              <Badge variant="default" className="bg-green-600 text-xs">
                <Check className="h-3 w-3 mr-1 stroke-2" />
                {likeToGoCount} <span className="hidden sm:inline">Like to Go</span>
              </Badge>
              {sharedPicks.length > 0 && (
                <Badge variant="outline" className="text-white border-white text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {sharedPicks.length} <span className="hidden sm:inline">Friends Connected</span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Auto-save notification */}
        {showSavedMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Save className="h-4 w-4" />
            <AlertDescription className="text-green-700 text-sm">
              Your picks have been automatically saved! They'll be here when you return.
            </AlertDescription>
          </Alert>
        )}

        <DataSourceIndicator
          isLiveData={true}
          lastUpdated={realGlastonbury2025.lastUpdated}
          source={realGlastonbury2025.source}
          totalActs={totalActs}
          totalStages={festivalData.stages.length}
        />

        <Tabs defaultValue="schedule" className="w-full">
          {/* Mobile-optimized tab list */}
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="schedule" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Schedule</span>
              <span className="sm:hidden">Sched</span>
            </TabsTrigger>
            <TabsTrigger value="my-picks" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Picks ({mustSeeCount + likeToGoCount})</span>
              <span className="sm:hidden">Picks</span>
              {mustSeeCount + likeToGoCount > 0 && (
                <Badge variant="secondary" className="text-xs ml-1 sm:hidden">
                  {mustSeeCount + likeToGoCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="clashes" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clashes</span>
              <span className="sm:hidden">Clash</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Find</span>
            </TabsTrigger>
            <TabsTrigger
              value="stages"
              className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs col-span-4 sm:col-span-1"
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Stages</span>
            </TabsTrigger>
            <TabsTrigger
              value="sharing"
              className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs col-span-2 sm:col-span-1"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Share</span>
            </TabsTrigger>
            <TabsTrigger
              value="group-plan"
              className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs col-span-2 sm:col-span-1"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Group Plan</span>
              <span className="sm:hidden">Group</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <FestivalSchedule
              festivalData={festivalData}
              actPriorities={actPriorities}
              onPriorityChange={handlePriorityChange}
            />
          </TabsContent>

          <TabsContent value="clashes">
            <ClashAnalyzer allActs={actsWithPriorities} />
          </TabsContent>

          <TabsContent value="stages">
            <StagesOverview stages={festivalData.stages} />
          </TabsContent>

          <TabsContent value="search">
            <SearchAndFilter
              allActs={filteredActs}
              myPicks={Object.keys(actPriorities).filter((id) => actPriorities[id] !== "none")}
              onTogglePick={(actId) => {
                const currentPriority = actPriorities[actId] || "none"
                const newPriority = currentPriority === "none" ? "like-to-go" : "none"
                handlePriorityChange(actId, newPriority)
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              selectedStage={selectedStage}
              onStageChange={setSelectedStage}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              stages={festivalData.stages}
            />
          </TabsContent>

          <TabsContent value="my-picks">
            <MyPicks allActs={allActs} actPriorities={actPriorities} onPriorityChange={handlePriorityChange} />
          </TabsContent>

          <TabsContent value="sharing">
            <SharingPanel
              myPicks={actPriorities}
              myName={myName}
              onNameChange={setMyName}
              sharedPicks={sharedPicks}
              onAddSharedPicks={handleAddSharedPicks}
              onImportPicks={handleImportPicks}
            />
          </TabsContent>

          <TabsContent value="group-plan">
            <GroupCoordination allActs={allActs} myPicks={actPriorities} myName={myName} sharedPicks={sharedPicks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
