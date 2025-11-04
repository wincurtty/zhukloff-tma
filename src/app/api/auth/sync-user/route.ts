import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Временно возвращаем успех без Supabase
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in sync-user:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}