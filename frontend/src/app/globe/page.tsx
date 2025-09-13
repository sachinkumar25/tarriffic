import MapboxGlobe from '@/components/MapboxGlobe'
import SupplyChainBackdrop from '@/components/SupplyChainBackdrop'

export default function GlobePage() {
  return (
    <div className="relative isolate w-screen h-screen bg-black">
      <SupplyChainBackdrop />
      <div className="relative z-10 w-full h-full grid place-items-center">
        <div className="w-[90vw] h-[90vh] max-w-[90vh] max-h-[90vw] rounded-full">
          <MapboxGlobe transparentBackground />
        </div>
      </div>
    </div>
  )
}
