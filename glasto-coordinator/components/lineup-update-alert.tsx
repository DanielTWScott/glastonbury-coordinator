"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"

interface LineupUpdateAlertProps {
  lastUpdated: string
}

export function LineupUpdateAlert({ lastUpdated }: LineupUpdateAlertProps) {
  return (
    <Alert className="mb-6 bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Lineup Updated!</AlertTitle>
      <AlertDescription className="text-green-700">
        <p>
          The Pyramid Stage lineup has been updated with the official Glastonbury 2025 schedule. Other stages will be
          updated as information becomes available.
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm">
          <Clock className="h-3 w-3" />
          <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          <Badge variant="outline" className="ml-2 bg-white">
            Pyramid Stage Complete
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  )
}
