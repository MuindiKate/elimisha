import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between 
      max-w-5xl mx-auto">
        <span className="text-xl font-bold text-green-600">Elimisha</span>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 
            font-medium transition-colors">
            Sign in
          </Link>
          <Link href="/signup"
            className="text-sm bg-green-600 hover:bg-green-700 text-white 
            font-medium px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 
        text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          🇰🇪 Built for Kenyan students
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 
        max-w-3xl mx-auto">
          Find bursaries and scholarships{' '}
          <span className="text-green-600">matched to you</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Hundreds of bursaries exist across county governments, CDFs, 
          universities, and NGOs. Elimisha finds the ones you actually 
          qualify for — before the deadline passes.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup"
            className="bg-green-600 hover:bg-green-700 text-white font-medium 
            px-8 py-3 rounded-xl text-base transition-colors">
            Find my bursaries →
          </Link>
          <Link href="/bursaries"
            className="text-gray-500 hover:text-gray-900 font-medium 
            px-8 py-3 rounded-xl text-base border border-gray-200 
            hover:border-gray-300 transition-colors">
            Browse all
          </Link>
        </div>
      </section>

      {/* Problem section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            The problem with finding bursaries in Kenya
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Most students who qualify for funding never access it — 
            not because it doesn't exist, but because they never found out in time.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: 'Scattered information',
                desc: 'County websites, CDF offices, WhatsApp groups, notice boards — bursary info lives everywhere and nowhere.'
              },
              {
                icon: '⏰',
                title: 'Missed deadlines',
                desc: 'Students find out about bursaries after applications have already closed. No reminders, no tracking.'
              },
              {
                icon: '🔍',
                title: 'No eligibility matching',
                desc: 'You have to read through dozens of bursaries to find the few you actually qualify for. Hours wasted.'
              },
            ].map(item => (
              <div key={item.title}
                className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How Elimisha works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Set up your profile',
                desc: 'Tell us your county, institution, course, year of study, and household income. Takes 2 minutes.'
              },
              {
                step: '02',
                title: 'Get matched',
                desc: 'Our AI scans every bursary and ranks them by how well they fit your profile and eligibility.'
              },
              {
                step: '03',
                title: 'Apply before deadlines',
                desc: 'Track your applications and get SMS or email reminders before deadlines close.'
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-green-100 mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="bg-green-600 py-16 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: '100+', label: 'Bursaries tracked' },
            { value: '47', label: 'Counties covered' },
            { value: 'Free', label: 'Always free for students' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </p>
              <p className="text-green-100 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Don't miss another deadline
          </h2>
          <p className="text-gray-500 mb-8">
            Join students across Kenya finding funding they never knew existed.
          </p>
          <Link href="/signup"
            className="inline-block bg-green-600 hover:bg-green-700 text-white 
            font-medium px-8 py-3 rounded-xl text-base transition-colors">
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between 
        flex-wrap gap-4">
          <span className="text-green-600 font-bold">Elimisha</span>
          <p className="text-xs text-gray-400">
            Built by Catherine Muindi · Nairobi, Kenya
          </p>
          <div className="flex gap-4">
            <Link href="/bursaries"
              className="text-xs text-gray-400 hover:text-gray-600">
              Browse
            </Link>
            <Link href="/signup"
              className="text-xs text-gray-400 hover:text-gray-600">
              Sign up
            </Link>
            <Link href="/login"
              className="text-xs text-gray-400 hover:text-gray-600">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}