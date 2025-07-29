"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Image from "next/image"

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export default function HeroCountdown({ actionButton }: { actionButton: React.ReactNode }) {
    // Data target per il countdown (puoi modificarla)
    const targetDate = new Date("2025-12-01T08:00:00").getTime()

    // Array delle immagini di sfondo
    const backgroundImages = [
        '/jap_2.jpg', 
        '/jap_3.jpeg'
    ]

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })
    const [isFinished, setIsFinished] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const difference = targetDate - now

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                })
            } else {
                setIsFinished(true)
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    // Effetto per il cambio automatico delle immagini di sfondo ogni 5 secondi
    useEffect(() => {
        const imageTimer = setInterval(() => {
            setIsFading(true)
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) => 
                    (prevIndex + 1) % backgroundImages.length
                )
                setIsFading(false)
            }, 300) // Metà della transizione per cambiare l'immagine
        }, 5000) // Cambia immagine ogni 5 secondi

        return () => clearInterval(imageTimer)
    }, [backgroundImages.length])

    return (
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            {/* Immagini di sfondo con Next.js Image */}
            {backgroundImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex && !isFading ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={image}
                        alt={`Background image ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        quality={85}
                        sizes="100vw"
                    />
                    {/* Overlay scuro */}
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            ))}

            <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
                {!isFinished ? (
                    <>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12">
                            Countdown al Viaggio
                        </h1>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                    {timeLeft.days.toString().padStart(2, "0")}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg uppercase tracking-wider">Giorni</div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                    {timeLeft.hours.toString().padStart(2, "0")}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg uppercase tracking-wider">Ore</div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                    {timeLeft.minutes.toString().padStart(2, "0")}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg uppercase tracking-wider">Minuti</div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 border border-white/20">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                    {timeLeft.seconds.toString().padStart(2, "0")}
                                </div>
                                <div className="text-sm sm:text-base md:text-lg uppercase tracking-wider">Secondi</div>
                            </div>
                        </div>

                        <p className="mt-8 sm:mt-12 text-lg sm:text-xl md:text-2xl opacity-90">
                            La tua avventura inizia il {format(targetDate, 'dd/MM/yyyy')}
                        </p>
                        <div className="mt-8 sm:mt-12">
                            {actionButton}
                        </div>
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-pulse">
                            🎉 Buon Viaggio! 🎉
                        </h1>
                            <p className="text-xl sm:text-2xl md:text-3xl opacity-90">È arrivato il momento della tua avventura!</p>
                            <div className="mt-8 sm:mt-12">
                                {actionButton}
                            </div>
                    </div>
                )}
            </div>

        </div>
    )
}
