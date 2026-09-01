import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_INSTRUCTORS,
  findInstructorLocally,
  parseInstructorCsv,
  normalizeName,
} from '@/data/instructor-database';
import { InstructorRecord } from '@/types/cpr';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const queryName = searchParams.get('name') || '';
  const sheetUrl = searchParams.get('sheetUrl') || '';

  let records: InstructorRecord[] = DEFAULT_INSTRUCTORS;

  // If a live Google Sheet URL or published CSV link is provided
  if (sheetUrl) {
    try {
      let fetchUrl = sheetUrl;
      // If user pasted a standard Google Spreadsheet edit URL, convert to CSV export format
      if (fetchUrl.includes('/spreadsheets/d/') && !fetchUrl.includes('export?format=csv')) {
        const idMatch = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (idMatch && idMatch[1]) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
        }
      }

      const res = await fetch(fetchUrl, {
        next: { revalidate: 60 },
        headers: { 'User-Agent': 'CPR-Certify-App' },
      });

      if (res.ok) {
        const csvText = await res.text();
        const parsed = parseInstructorCsv(csvText);
        if (parsed.length > 0) {
          records = parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch external Google Sheet, falling back to local records:', err);
    }
  }

  // If no name specified, return full records list for preview
  if (!queryName) {
    return NextResponse.json({
      success: true,
      count: records.length,
      data: records,
    });
  }

  // Search for instructor
  const cleanQuery = normalizeName(queryName);
  const found = findInstructorLocally(cleanQuery, records);

  if (!found) {
    return NextResponse.json({
      success: true,
      eligible: false,
      reason: 'not_found',
      message: `Instructor "${queryName}" was not found in the certification directory.`,
    });
  }

  const isActive = found.status.trim().toLowerCase() === 'active';

  if (!isActive) {
    return NextResponse.json({
      success: true,
      eligible: false,
      reason: 'inactive',
      status: found.status,
      message: `Instructor "${found.name}" status is "${found.status}". Status must be "Active" to purchase eCards.`,
    });
  }

  return NextResponse.json({
    success: true,
    eligible: true,
    instructor: found,
  });
}
