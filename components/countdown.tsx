"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export default function Countdown({ date }: { date?: string }) {
    const targetDate = new Date(date || "2025-12-01T08:00:00").getTime()

    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })
    const [isFinished, setIsFinished] = useState(false)

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

    const TimeCard = ({ label, value }: { label: string, value: number }) => {
        return (
            <div className="bg-white rounded-lg shadow-md p-2 text-center border">
                <div className="text-3xl md:text-4xl font-bold text-red-700 mb-2">
                    {value.toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wider">
                    {label}
                </div>
            </div>
        )
    }   

    return (
        <div className="w-full mx-auto space-y-4 ">
            {!isFinished ? (
                <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
                        <TimeCard label="Giorni" value={timeLeft.days} />
                        <TimeCard label="Ore" value={timeLeft.hours} />
                        <TimeCard label="Minuti" value={timeLeft.minutes} />
                        <TimeCard label="Secondi" value={timeLeft.seconds} />
                </div>
            ) : (
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                        È arrivato il momento!
                    </h3>
                    <p className="text-gray-600">
                        Buon viaggio in Giappone! 🇯🇵
                    </p>
                </div>
            )}
            <div className="text-center mb-8">
                <p className="text-gray-600">
                    La tua avventura inizia il {format(targetDate, 'dd MMMM yyyy', { locale: it })}
                </p>
            </div>
        </div>
    )
} 