import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { TrendingUp, MapPin, Activity, Pill, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { number: '+4', label: 'Années de données', icon: '📊' },
    { number: '+100', label: 'Départements analysés', icon: '🗺️' },
    { number: '7', label: 'Sources de données', icon: '⚡' },
  ]

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Analyse des besoins',
      description: 'Analyse des tendances historiques et indicateurs avancés',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Optimisation géographique',
      description: 'Identification des zones sous-vaccinées',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: 'Anticipation des campagnes',
      description: 'Prévision au vue des prochaines campagnes de vaccination',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: 'Distribution optimale',
      description: 'Gestion intelligente des stocks de vaccins',
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center items-center mt-16 pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      id="accueil"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Animated Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 -z-10 animate-[patternMove_20s_ease-in-out_infinite]" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className={`max-w-7xl w-full text-center z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Hero Text */}
        <div className="mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm text-white/90 font-medium">Plateforme d'optimisation vaccinale</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight">
            <span className="block animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Optimisation de la stratégie vaccinale
            </span>
            <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: '0.2s' }}>
              contre la grippe
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Prédiction des besoins, optimisation de la distribution et amélioration 
            de l'accès aux soins grâce à l'analyse de données publiques
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="group bg-white text-blue-600 hover:bg-white/90 text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              asChild
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                Explorer le tableau de bord
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-white/90 bg-white/10 backdrop-blur-md text-white font-semibold hover:bg-white/20 hover:border-white text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              asChild
            >
              <Link to="/prediction" className="flex items-center gap-2">
                Découvrir les prédictions
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className={cn(
                "bg-white/10 backdrop-blur-md border-white/20 text-white shadow-xl hover:bg-white/20 transition-all duration-500 min-w-[150px] group cursor-pointer",
                "hover:scale-110 hover:shadow-2xl hover:-translate-y-2",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-white/90">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={cn(
                "bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer overflow-hidden relative",
                "hover:-translate-y-3 hover:scale-105",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              {/* Gradient Overlay on Hover */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                feature.gradient
              )} />
              
              <CardContent className="p-6 text-center relative z-10">
                <div className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br mb-4 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg",
                  `bg-gradient-to-br ${feature.gradient}`
                )}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
