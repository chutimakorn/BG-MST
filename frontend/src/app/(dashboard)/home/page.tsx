'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, X, Sparkles } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, []) // ลบ router ออกจาก dependencies

  const handleGiftClick = () => {
    // Show fireworks animation
    setShowFireworks(true)
    
    // Create multiple fireworks
    const newFireworks = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setFireworks(newFireworks)

    // Show video after fireworks start
    setTimeout(() => {
      setShowVideo(true)
      setShowFireworks(false)
    }, 1000)
  }

  const closeVideo = () => {
    setShowVideo(false)
    setFireworks([])
  }

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="mt-4 text-black dark:text-white">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vibrant Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Bright Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 dark:from-pink-600/40 dark:via-purple-600/40 dark:to-blue-600/40"></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/50 via-transparent to-rose-200/50 animate-gradient"></div>
        
        {/* Floating Sparkles */}
        {[...Array(30)].map((_, i) => (
          <Sparkles
            key={`sparkle-${i}`}
            className="absolute text-yellow-400/60 dark:text-yellow-300/40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              animation: `float-sparkle ${3 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Colorful Bubbles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${30 + Math.random() * 80}px`,
              height: `${30 + Math.random() * 80}px`,
              background: `radial-gradient(circle at 30% 30%, ${
                ['rgba(255, 182, 193, 0.4)', 'rgba(173, 216, 230, 0.4)', 'rgba(255, 218, 185, 0.4)', 'rgba(221, 160, 221, 0.4)'][Math.floor(Math.random() * 4)]
              }, transparent)`,
              animation: `float-bubble ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Fireworks Animation */}
      {showFireworks && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {fireworks.map((fw) => (
            <div
              key={fw.id}
              className="absolute"
              style={{
                left: `${fw.x}%`,
                top: `${fw.y}%`,
              }}
            >
              {/* Firework particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff6bff', '#6bffa3'][Math.floor(Math.random() * 5)],
                    animation: `firework-particle 1s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                    transform: `rotate(${i * 30}deg)`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Welcome Message */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="mb-4 text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 drop-shadow-lg">
            ยินดีต้อนรับ
          </h1>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 drop-shadow-md">
            {user.fullName} 🎉
          </p>
        </div>

        {/* Gift Box */}
        <div className="relative mb-12">
          <button
            onClick={handleGiftClick}
            className="group relative transform transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          >
            {/* Gift Box Container */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse"></div>
              
              {/* Gift Icon */}
              <div className="relative bg-gradient-to-br from-red-500 to-pink-500 p-12 rounded-3xl shadow-2xl transform rotate-0 group-hover:rotate-12 transition-transform duration-300">
                <Gift className="w-32 h-32 text-white drop-shadow-2xl animate-bounce-slow" strokeWidth={2.5} />
                
                {/* Ribbon */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-yellow-300 opacity-80"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-yellow-300 opacity-80"></div>
                
                {/* Bow */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full shadow-lg"></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-300 rounded-full"></div>
              </div>
            </div>

            {/* Click Me Text */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 animate-bounce">
                คลิกเพื่อเปิดของขวัญ! 🎁
              </p>
            </div>
          </button>
        </div>

        {/* Motivational Text */}
        <div className="text-center space-y-4 mt-20">
          <h2 
            className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 animate-pulse drop-shadow-2xl"
            style={{
              fontFamily: "'Kanit', 'Sarabun', sans-serif",
              textShadow: '0 0 40px rgba(236, 72, 153, 0.5)',
            }}
          >
            สู้ๆ
          </h2>
          
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 drop-shadow-lg animate-fade-in-up">
            อย่าไปเครียดมากนะเจ้าหมูตูบบ ✨💖
          </p>
        </div>
      </div>

      {/* Video Popup Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl">
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>

            {/* Video Container */}
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl border-4 border-white/50 bg-black">
              <video
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain"
              >
                <source
                  src="https://res.cloudinary.com/dpmzwengk/video/upload/v1764484232/lv_7504645578047917365_20251130132631_xjttca.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 text-yellow-400 animate-spin-slow">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-4 -right-4 text-pink-400 animate-bounce">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float-sparkle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes float-bubble {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-30px) translateX(20px);
          }
          50% {
            transform: translateY(-60px) translateX(-20px);
          }
          75% {
            transform: translateY(-30px) translateX(20px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes firework-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 100px), var(--ty, 100px)) scale(0);
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Firework particle directions */
        div[style*="firework-particle"] {
          --tx: calc(cos(var(--angle, 0deg)) * 150px);
          --ty: calc(sin(var(--angle, 0deg)) * 150px);
        }
      `}</style>
    </div>
  )
}
