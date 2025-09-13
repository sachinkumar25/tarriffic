import MapboxGlobe from '@/components/MapboxGlobe'
import SupplyChainBackdrop from '@/components/SupplyChainBackdrop'

export default function GlobePage() {
  return (
    <div className="relative isolate w-screen h-screen bg-black">
      <SupplyChainBackdrop />
      <div className="relative z-10 w-full h-full">
        <MapboxGlobe transparentBackground />
      </div>
    </div>
  )
}
