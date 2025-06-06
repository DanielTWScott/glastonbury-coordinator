import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface ScrapedAct {
  id: string
  name: string
  time: string
  day: string
  stage: string
  genre?: string
}

interface ScrapedStage {
  id: string
  name: string
  acts: ScrapedAct[]
}

export async function GET() {
  try {
    console.log("Starting Glastonbury lineup scrape...")

    // Fetch the main lineup page
    const response = await fetch("https://www.glastonburyfestivals.co.uk/line-up/line-up-2025/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    console.log("HTML loaded, parsing content...")

    const stages: ScrapedStage[] = []
    const acts: ScrapedAct[] = []

    // Look for common selectors that might contain lineup information
    const possibleSelectors = [
      ".lineup-item",
      ".artist-item",
      ".act-item",
      ".performer",
      ".lineup-entry",
      '[class*="lineup"]',
      '[class*="artist"]',
      '[class*="act"]',
      "h1, h2, h3, h4, h5, h6", // Headers that might contain artist names
      ".entry-content p",
      ".content p",
      "main p",
    ]

    let foundContent = false

    // Try different selectors to find lineup content
    for (const selector of possibleSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector: ${selector}`)

        elements.each((index, element) => {
          const text = $(element).text().trim()
          if (text && text.length > 2 && text.length < 100) {
            console.log(`Content found: ${text}`)
            foundContent = true

            // Try to extract artist names from text
            // Look for patterns that might indicate artists
            const lines = text.split("\n").filter((line) => line.trim().length > 0)
            lines.forEach((line, lineIndex) => {
              const cleanLine = line.trim()
              if (
                cleanLine &&
                !cleanLine.toLowerCase().includes("glastonbury") &&
                !cleanLine.toLowerCase().includes("festival") &&
                !cleanLine.toLowerCase().includes("lineup") &&
                cleanLine.length > 2 &&
                cleanLine.length < 50
              ) {
                acts.push({
                  id: `scraped-${acts.length + 1}`,
                  name: cleanLine,
                  time: "TBA",
                  day: "TBA",
                  stage: "TBA",
                  genre: "TBA",
                })
              }
            })
          }
        })

        if (foundContent) break
      }
    }

    // Also try to get the page title and meta description for context
    const pageTitle = $("title").text()
    const metaDescription = $('meta[name="description"]').attr("content") || ""

    console.log(`Page title: ${pageTitle}`)
    console.log(`Meta description: ${metaDescription}`)

    // Look for any text that might contain artist names
    const bodyText = $("body").text()
    const words = bodyText
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          word.length < 30 &&
          /^[A-Za-z\s&'-]+$/.test(word) &&
          !["the", "and", "for", "with", "from", "this", "that", "will", "have", "been", "are", "was", "were"].includes(
            word.toLowerCase(),
          ),
      )

    // Get unique potential artist names
    const uniqueWords = [...new Set(words)].slice(0, 50)
    console.log("Potential artist names found:", uniqueWords.slice(0, 10))

    // If we didn't find structured data, create a response with what we found
    if (acts.length === 0 && uniqueWords.length > 0) {
      uniqueWords.forEach((word, index) => {
        acts.push({
          id: `potential-${index + 1}`,
          name: word,
          time: "TBA",
          day: "TBA",
          stage: "TBA",
          genre: "TBA",
        })
      })
    }

    // Create a default stage structure
    const defaultStage: ScrapedStage = {
      id: "scraped-lineup",
      name: "Scraped Lineup",
      acts: acts.slice(0, 20), // Limit to first 20 to avoid too much noise
    }

    stages.push(defaultStage)

    const scrapedData = {
      name: "Glastonbury 2025 (Scraped)",
      dates: "June 25-29, 2025",
      stages: stages,
      metadata: {
        pageTitle,
        metaDescription,
        scrapedAt: new Date().toISOString(),
        totalActsFound: acts.length,
        source: "https://www.glastonburyfestivals.co.uk/line-up/line-up-2025/",
      },
    }

    console.log(`Scraping complete. Found ${acts.length} potential acts.`)

    return NextResponse.json({
      success: true,
      data: scrapedData,
      message: `Successfully scraped ${acts.length} potential acts from Glastonbury website`,
    })
  } catch (error) {
    console.error("Scraping error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to scrape Glastonbury lineup. The website structure may have changed or be protected.",
      },
      { status: 500 },
    )
  }
}
