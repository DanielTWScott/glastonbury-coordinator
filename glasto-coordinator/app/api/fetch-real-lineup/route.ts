import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Fetching real Glastonbury 2025 lineup...")

    const response = await fetch("https://www.glastonburyfestivals.co.uk/line-up/line-up-2025/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    // For now, let's return the HTML content so we can see what's available
    // In a real implementation, we'd parse this with cheerio

    return NextResponse.json({
      success: true,
      htmlLength: html.length,
      preview: html.substring(0, 1000),
      message: "Successfully fetched Glastonbury 2025 page",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching lineup:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to fetch real lineup data",
      },
      { status: 500 },
    )
  }
}
