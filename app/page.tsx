"use client"

import { useState, useEffect } from "react"

const Page = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: "🤌",
      title: "Mischievous AI",
      description: "20+ years of coding wisdom with a playful twist",
    },
    {
      icon: "📁",
      title: "File Context",
      description: "Attach files with @filename for smart code analysis",
    },
    {
      icon: "🚀",
      title: "Quick Actions",
      description: "Explain, debug, test, and optimize code instantly",
    },
    {
      icon: "🧠",
      title: "Smart Suggestions",
      description: "Battle-tested solutions from years of experience",
    },
    {
      icon: "⚡",
      title: "Real-time Help",
      description: "Get instant answers while you code",
    },
    {
      icon: "🔧",
      title: "Code Generation",
      description: "Generate boilerplate, tests, and documentation",
    },
  ]

  const developers = [
    {
      name: "Tanya Singh",
      role: "Lead Developer",
      email: "tanyasinghsaini@gmail.com",
      github: "tanyaaa05",
      linkedin: "tanya-singh",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Glitchy 🤌
              </span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-purple-300 transition-colors">
                Features
              </a>
              <a href="#team" className="hover:text-purple-300 transition-colors">
                Team
              </a>
              <a href="#contact" className="hover:text-purple-300 transition-colors">
                Contact
              </a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section
          className={`container mx-auto px-6 py-20 text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 animate-pulse">
                Glitchy 🤌
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              Your mischievous AI coding companion with <span className="text-purple-400 font-semibold">20+ years</span>{" "}
              of development wisdom
            </p>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-purple-500/30">
              <p className="text-lg text-gray-200 mb-4">
                🚀 <strong>Ready to code?</strong> Open VS Code and run:
              </p>
              <div className="bg-black/50 rounded-md p-4 font-mono text-green-400 text-left">
                <span className="text-gray-500"># Open Command Palette (Ctrl/Cmd + Shift + P)</span>
                <br />
                <span className="text-purple-400">&gt;</span> Start Glitchy 🤌
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Get Started
              </button>
              <button className="border border-purple-400 hover:bg-purple-400/20 px-8 py-3 rounded-full font-semibold transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Why Developers Love Glitchy 🤌
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-purple-300">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-300 mb-2">20+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-300 mb-2">50+</div>
                <div className="text-gray-300">Languages Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">1000+</div>
                <div className="text-gray-300">Problems Solved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-300 mb-2">24/7</div>
                <div className="text-gray-300">Always Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Meet the Team
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {dev.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-300">{dev.name}</h3>
                <p className="text-gray-400 mb-4">{dev.role}</p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${dev.email}`}
                    className="block text-sm text-gray-300 hover:text-purple-300 transition-colors"
                  >
                    📧 {dev.email}
                  </a>
                  <div className="flex justify-center space-x-4">
                    <a
                      href={`https://github.com/${dev.github}`}
                      className="text-gray-400 hover:text-purple-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🐙 GitHub
                    </a>
                    <a
                      href={`https://linkedin.com/in/${dev.linkedin}`}
                      className="text-gray-400 hover:text-purple-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💼 LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Get in Touch
              </span>
            </h2>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Have questions, feedback, or want to contribute? We'd love to hear from you!
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">📧 General Inquiries</h4>
                    <a
                      href="mailto:hello@glitchy.dev"
                      className="text-gray-300 hover:text-purple-300 transition-colors"
                    >
                      tanyasinghsaini+hello@gmail.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">🐛 Bug Reports</h4>
                    <a href="mailto:bugs@glitchy.dev" className="text-gray-300 hover:text-purple-300 transition-colors">
                      tanyasinghsaini+bugs@gmail.com
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">💡 Feature Requests</h4>
                    <a
                      href="mailto:features@glitchy.dev"
                      className="text-gray-300 hover:text-purple-300 transition-colors"
                    >
                      tanyasinghsaini+features@gmail.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-300 mb-2">🤝 Partnerships</h4>
                    <a
                      href="mailto:partnerships@glitchy.dev"
                      className="text-gray-300 hover:text-purple-300 transition-colors"
                    >
                      tanyasinghsaini+partnerships@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-purple-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Glitchy 🤌
              </span>
            </div>
            <p className="text-gray-400 mb-4">Making coding more fun, one mischievous suggestion at a time</p>
            <div className="flex justify-center space-x-6">
              <a href="https://github.com/glitchy-ai" className="text-gray-400 hover:text-purple-300 transition-colors">
                🐙 GitHub
              </a>
              <a
                href="https://twitter.com/glitchy_ai"
                className="text-gray-400 hover:text-purple-300 transition-colors"
              >
                🐦 Twitter
              </a>
              <a href="https://discord.gg/glitchy" className="text-gray-400 hover:text-purple-300 transition-colors">
                💬 Discord
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-6">© 2024 Glitchy AI. Made with 💜 for developers everywhere.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Page
