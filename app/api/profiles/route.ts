import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT id, data FROM profiles WHERE userId = ?');
    const rows = stmt.all(userId);

    const profiles: Record<string, any> = {};
    for (const row of rows as any[]) {
      profiles[row.id] = JSON.parse(row.data);
    }

    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error('Fetch profiles error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    
    if (!profile.id || !profile.userId) {
      return NextResponse.json({ success: false, error: 'Profile ID and User ID are required' }, { status: 400 });
    }

    // Check if user exists to avoid FOREIGN KEY constraint failure
    const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(profile.userId);
    if (!userCheck) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado. Faça login novamente.' }, { status: 404 });
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO profiles (id, userId, data) VALUES (?, ?, ?)');
    stmt.run(profile.id, profile.userId, JSON.stringify(profile));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save profile error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor ao salvar perfil.' }, { status: 500 });
  }
}
