import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

// Try to get more detailed information by checking multiple pages
export async function GET() {
  try {
    const baseUrl = "https://www.glastonburyfestivals.co.uk"
    const pages = ["/line-up/line-up-2025/", "/line-up/", "/artists/", "/performers/", "/music/"]

    const allData = []

    for (const page of pages) {
      try {
        console.log(`Scraping page: ${baseUrl}${page}`)

        const response = await fetch(`${baseUrl}${page}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
          },
        })

        if (response.ok) {
          const html = await response.text()
          const $ = cheerio.load(html)

          // Extract all links that might lead to artist pages
          const artistLinks = []
          $('a[href*="artist"], a[href*="performer"], a[href*="act"]').each((i, el) => {
            const href = $(el).attr("href")
            const text = $(el).text().trim()
            if (href && text && text.length > 1 && text.length < 50) {
              artistLinks.push({ name: text, url: href })
            }
          })

          // Look for structured data (JSON-LD, microdata, etc.)
          const jsonLdScripts = $('script[type="application/ld+json"]')
          const structuredData = []

          jsonLdScripts.each((i, el) => {
            try {
              const jsonData = JSON.parse($(el).html() || "{}")
              structuredData.push(jsonData)
            } catch (e) {
              // Ignore invalid JSON
            }
          })

          // Look for time/schedule information
          const timeElements = []
          $('[class*="time"], [class*="schedule"], [class*="when"]').each((i, el) => {
            const text = $(el).text().trim()
            if (text && /\d{1,2}:\d{2}/.test(text)) {
              timeElements.push(text)
            }
          })

          // Look for stage information
          const stageElements = []
          $('[class*="stage"], [class*="venue"], [class*="location"]').each((i, el) => {
            const text = $(el).text().trim()
            if (text && text.length > 2 && text.length < 30) {
              stageElements.push(text)
            }
          })

          allData.push({
            page,
            title: $("title").text(),
            artistLinks: artistLinks.slice(0, 20),
            structuredData,
            timeElements: timeElements.slice(0, 10),
            stageElements: stageElements.slice(0, 10),
            headings: $("h1, h2, h3")
              .map((i, el) => $(el).text().trim())
              .get()
              .slice(0, 10),
          })
        }
      } catch (pageError) {
        console.log(`Error scraping page ${page}:`, pageError)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      data: allData,
      message: `Scraped ${pages.length} pages for detailed lineup information`,
    })
  } catch (error) {
    console.error("Detailed scraping error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
