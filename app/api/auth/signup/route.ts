import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Preencha todos os campos.' }, { status: 400 });
    }

    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = checkStmt.get(email);

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Este email já está cadastrado.' }, { status: 400 });
    }

    const id = uuidv4();
    const insertStmt = db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)');
    insertStmt.run(id, name, email, password);

    return NextResponse.json({ success: true, user: { id, name, email } });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor.' }, { status: 500 });
  }
}
