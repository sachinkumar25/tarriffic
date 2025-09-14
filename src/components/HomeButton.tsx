"use client";

import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className="absolute top-4 right-8 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
    >
      <Home size={16} />
      <span>Home</span>
    </button>
  );
}
