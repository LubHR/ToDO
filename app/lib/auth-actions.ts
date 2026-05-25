'use server';

import { db } from './db';
import { hashPassword, verifyPassword, encryptSession } from './session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signup(state: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!email || !password || !confirmPassword) {
    return { error: 'Будь ласка, заповніть всі поля' };
  }

  if (!email.includes('@')) {
    return { error: 'Некоректний формат email' };
  }

  if (password.length < 6) {
    return { error: 'Пароль має бути не менше 6 символів' };
  }

  if (password !== confirmPassword) {
    return { error: 'Паролі не співпадають' };
  }

  let success = false;
  try {
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { error: 'Користувач з таким email вже існує' };
    }

    const hashedPassword = hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    const session = encryptSession(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    success = true;
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Помилка при реєстрації. Спробуйте ще раз' };
  }

  if (success) {
    redirect('/');
  }
}

export async function login(state: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Будь ласка, введіть email та пароль' };
  }

  let success = false;
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return { error: 'Невірний email або пароль' };
    }

    const session = encryptSession(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const cookieStore = await cookies();

    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });
    success = true;
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Помилка при вході. Спробуйте ще раз' };
  }

  if (success) {
    redirect('/');
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}
