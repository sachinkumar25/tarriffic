import SectorBreakdown from '@/components/SectorBreakdown';

export default function SectorPage() {
  return (
    <main className="w-screen h-screen p-4 sm:p-8 md:p-12 flex items-center justify-center">
      <div className="w-full h-full max-w-7xl mx-auto">
        <SectorBreakdown />
      </div>
    </main>
  );
}
