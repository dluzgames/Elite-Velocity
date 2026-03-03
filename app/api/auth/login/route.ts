import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Preencha todos os campos.' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT id, name, email, password FROM users WHERE email = ?');
    const user: any = stmt.get(email);

    if (user && user.password === password) {
      return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    }

    return NextResponse.json({ success: false, error: 'Email ou senha inválidos.' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Erro no servidor.' }, { status: 500 });
  }
}
