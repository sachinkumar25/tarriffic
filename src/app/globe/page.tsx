import MapboxGlobe from '@/components/MapboxGlobe'

export default function GlobePage() {
  return (
    <div className="relative isolate w-screen h-screen">
      <div className="relative z-10 w-full h-full">
        <MapboxGlobe transparentBackground />
      </div>
    </div>
  )
}
