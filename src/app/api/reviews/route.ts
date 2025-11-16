import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k-r.by/api';

export async function GET() {
  try {
    const url = `${API_BASE_URL}/reviews`;
    const resp = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!resp.ok) {
      throw new Error(`Backend returned ${resp.status}`);
    }
    
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Error proxying reviews:', e);
    return NextResponse.json(
      { success: false, error: e.message, data: [] },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
