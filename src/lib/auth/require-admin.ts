import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-current-user';

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  return user;
}
