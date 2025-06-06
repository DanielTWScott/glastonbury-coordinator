"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, Database, Clock, ExternalLink } from "lucide-react"

interface DataSourceIndicatorProps {
  isLiveData: boolean
  lastUpdated?: string
  source?: string
  totalActs: number
  totalStages: number
}

export function DataSourceIndicator({
  isLiveData,
  lastUpdated,
  source,
  totalActs,
  totalStages,
}: DataSourceIndicatorProps) {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isLiveData ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Database className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <h3 className="font-semibold text-sm">{isLiveData ? "Live Glastonbury Data" : "Demo Festival Data"}</h3>
                <p className="text-xs text-muted-foreground">
                  {isLiveData ? "Pre-scraped from official Glastonbury website" : "Comprehensive demo data for testing"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{totalActs} Acts</div>
              <div className="text-xs text-muted-foreground">{totalStages} Stages</div>
            </div>

            {isLiveData && (
              <Badge variant="default" className="bg-green-600">
                <Globe className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
        </div>

        {isLiveData && (lastUpdated || source) && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </div>
              )}
              {source && (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
