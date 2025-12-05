import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Heart, ArrowUpRight, ArrowUp } from 'lucide-react'

const Footer = () => {

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden z-40" id="contact">
      {/* Animated Background */}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4 group">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              GrippeGuard
            </h3>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-end items-end gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-slate-400">
              <p>© 2025 GrippeGuard - Hackathon Epitech X Présidence de la République</p>
              <span className="hidden md:inline">•</span>
              <p className="flex items-center gap-1 group">
                Fait par : Mehdi, Samy, Robin, Salah, Jaures
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
