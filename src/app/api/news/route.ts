import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch from Google News RSS (Search: 'online scams india', last 7 days)
        const response = await fetch(
            'https://news.google.com/rss/search?q=cyber+fraud+india+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed');
        }

        const xmlText = await response.text();
        const news = parseRSS(xmlText);

        return NextResponse.json({ success: true, news });
    } catch (error) {
        console.error('News API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch news', news: [] },
            { status: 500 }
        );
    }
}

// Simple XML Parser for RSS feeds without external dependencies
function parseRSS(xml: string) {
    const items = [];
    // Match <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 3) {
        const itemContent = match[1];

        // Extract fields
        const title = extractTag(itemContent, 'title');
        const link = extractTag(itemContent, 'link');
        const pubDateRaw = extractTag(itemContent, 'pubDate');
        const source = extractTag(itemContent, 'source'); // Usually inside <source> tag

        // Format Date (e.g., "Mon, 05 Feb 2026..." -> "2h ago" or "Feb 05")
        const date = formatDate(pubDateRaw);

        // Determine type based on keywords
        let type = 'Alert';
        if (title.toLowerCase().includes('scam')) type = 'Scam Alert';
        else if (title.toLowerCase().includes('fraud')) type = 'Fraud Alert';
        else if (title.toLowerCase().includes('arrest')) type = 'Enforcement';
        else if (title.toLowerCase().includes('police')) type = 'Police';
        else if (title.toLowerCase().includes('bank')) type = 'Banking';
        else if (title.toLowerCase().includes('upi')) type = 'UPI Safety';

        items.push({
            title: cleanTitle(title),
            link,
            date,
            source: cleanSource(source),
            type
        });
    }

    return items;
}

function extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i');
    const match = regex.exec(xml);
    return match ? match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
}

function cleanTitle(title: string): string {
    // Remove source from title if present (e.g. "Scam Alert - Times of India")
    return title.split(' - ')[0].trim();
}

function cleanSource(source: string): string {
    return source || 'News';
}

function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
