"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Check, X } from "lucide-react"
import type { Priority } from "@/lib/types"

interface PriorityPickerProps {
  currentPriority: Priority
  onPriorityChange: (priority: Priority) => void
  size?: "sm" | "md" | "lg"
}

export function PriorityPicker({ currentPriority, onPriorityChange, size = "md" }: PriorityPickerProps) {
  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default"
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={currentPriority === "must-see" ? "default" : "outline"}
        size={buttonSize}
        onClick={() => onPriorityChange(currentPriority === "must-see" ? "none" : "must-see")}
        className={currentPriority === "must-see" ? "bg-red-600 hover:bg-red-700" : ""}
      >
        <Heart className={`${iconSize} ${currentPriority === "must-see" ? "fill-current" : ""}`} />
        {size !== "sm" && <span className="ml-1">Must See</span>}
      </Button>

      <Button
        variant={currentPriority === "like-to-go" ? "default" : "outline"}
        size={buttonSize}
        onClick={() => onPriorityChange(currentPriority === "like-to-go" ? "none" : "like-to-go")}
        className={currentPriority === "like-to-go" ? "bg-green-600 hover:bg-green-700" : ""}
      >
        <Check className={`${iconSize} ${currentPriority === "like-to-go" ? "stroke-2" : ""}`} />
        {size !== "sm" && <span className="ml-1">Like to Go</span>}
      </Button>

      {currentPriority !== "none" && (
        <Button variant="ghost" size={buttonSize} onClick={() => onPriorityChange("none")}>
          <X className={iconSize} />
        </Button>
      )}
    </div>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "none") return null

  return (
    <Badge
      variant={priority === "must-see" ? "destructive" : "default"}
      className={priority === "like-to-go" ? "bg-green-600" : ""}
    >
      {priority === "must-see" ? (
        <>
          <Heart className="h-3 w-3 mr-1 fill-current" />
          Must See
        </>
      ) : (
        <>
          <Check className="h-3 w-3 mr-1 stroke-2" />
          Like to Go
        </>
      )}
    </Badge>
  )
}
