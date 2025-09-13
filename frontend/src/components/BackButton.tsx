"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 right-8 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </button>
  );
}
