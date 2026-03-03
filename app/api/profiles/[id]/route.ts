import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const { userId } = updates;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const getStmt = db.prepare('SELECT data FROM profiles WHERE id = ? AND userId = ?');
    const existing: any = getStmt.get(id, userId);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const profile = JSON.parse(existing.data);
    const updatedProfile = { ...profile, ...updates };

    const updateStmt = db.prepare('UPDATE profiles SET data = ? WHERE id = ? AND userId = ?');
    updateStmt.run(JSON.stringify(updatedProfile), id, userId);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const deleteStmt = db.prepare('DELETE FROM profiles WHERE id = ? AND userId = ?');
    const result = deleteStmt.run(id, userId);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor.' }, { status: 500 });
  }
}
