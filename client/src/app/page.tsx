import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Greyrock PO',
}

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </div>
  );
}
