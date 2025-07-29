import Countdown from "@/components/countdown"

export default function ProtectedPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          We are going to Japan!
        </h1>
      </div>

      <Countdown />
    </div>
  )
}
