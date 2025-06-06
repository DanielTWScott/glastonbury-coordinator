"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Share2, Copy, Download, Upload, Users, Heart, Check } from "lucide-react"
import { generateShareableLink, parseSharedLink, exportToPicks, importFromPicks } from "@/lib/sharing"
import type { Priority, SharedPicks } from "@/lib/types"

interface SharingPanelProps {
  myPicks: Record<string, Priority>
  myName: string
  onNameChange: (name: string) => void
  sharedPicks: SharedPicks[]
  onAddSharedPicks: (picks: SharedPicks) => void
  onImportPicks: (picks: Record<string, Priority>) => void
}

export function SharingPanel({
  myPicks,
  myName,
  onNameChange,
  sharedPicks,
  onAddSharedPicks,
  onImportPicks,
}: SharingPanelProps) {
  const [shareLink, setShareLink] = useState("")
  const [importLink, setImportLink] = useState("")
  const [importJson, setImportJson] = useState("")
  const [showCopied, setShowCopied] = useState(false)

  const handleGenerateLink = () => {
    if (!myName.trim()) {
      alert("Please enter your name first!")
      return
    }

    const link = generateShareableLink(myPicks, myName.trim())
    setShareLink(link)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleImportLink = () => {
    const shared = parseSharedLink(importLink)
    if (shared) {
      onAddSharedPicks(shared)
      setImportLink("")
    } else {
      alert("Invalid share link!")
    }
  }

  const handleImportJson = () => {
    const picks = importFromPicks(importJson)
    if (picks) {
      onImportPicks(picks)
      setImportJson("")
    } else {
      alert("Invalid JSON format!")
    }
  }

  const handleExportJson = () => {
    const json = exportToPicks(myPicks)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${myName || "my"}-glastonbury-picks.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const myPicksCount = Object.values(myPicks).filter((p) => p !== "none").length
  const mustSeeCount = Object.values(myPicks).filter((p) => p === "must-see").length
  const likeToGoCount = Object.values(myPicks).filter((p) => p === "like-to-go").length

  return (
    <div className="space-y-6">
      {/* My Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Festival Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Name</label>
            <Input
              placeholder="Enter your name for sharing"
              value={myName}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{myPicksCount}</div>
              <div className="text-sm text-muted-foreground">Total Picks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{mustSeeCount}</div>
              <div className="text-sm text-muted-foreground">Must See</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{likeToGoCount}</div>
              <div className="text-sm text-muted-foreground">Like to Go</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Your Picks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Picks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateLink} className="w-full">
            Generate Shareable Link
          </Button>

          {shareLink && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {showCopied && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-700">
                    Link copied to clipboard! Share it with your friends.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleExportJson} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Friends' Picks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Friends' Picks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">From Share Link</label>
            <div className="flex gap-2">
              <Input
                placeholder="Paste friend's share link here"
                value={importLink}
                onChange={(e) => setImportLink(e.target.value)}
              />
              <Button onClick={handleImportLink} disabled={!importLink.trim()}>
                Import
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">From JSON</label>
            <div className="space-y-2">
              <Textarea
                placeholder="Paste JSON picks here"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                rows={3}
              />
              <Button onClick={handleImportJson} disabled={!importJson.trim()} className="w-full">
                Import to My Picks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friends' Picks */}
      {sharedPicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends' Picks ({sharedPicks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedPicks.map((friend) => {
                const friendPicksCount = Object.values(friend.picks).filter((p) => p !== "none").length
                const friendMustSee = Object.values(friend.picks).filter((p) => p === "must-see").length
                const friendLikeToGo = Object.values(friend.picks).filter((p) => p === "like-to-go").length

                return (
                  <div key={friend.userId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{friend.userName}</h4>
                      <Badge variant="secondary">{friendPicksCount} picks</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-current text-red-600" />
                        <span>{friendMustSee} Must See</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-2 text-green-600" />
                        <span>{friendLikeToGo} Like to Go</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated: {new Date(friend.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
