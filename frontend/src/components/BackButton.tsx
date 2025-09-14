"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 left-4 z-50 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm text-white/80 transition-colors hover:text-white"
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </button>
  );
}
