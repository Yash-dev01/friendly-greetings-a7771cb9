import { GraduationCap, Users, Briefcase, Calendar, Gamepad2, Bot, Award, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';

interface HomeProps {
  onGetStarted: () => void;
}

export function Home({ onGetStarted }: HomeProps) {
  const features = [
    {
      icon: Users,
      title: 'Alumni Network',
      description: 'Connect with thousands of alumni across various industries and career paths',
      color: 'bg-blue-500'
    },
    {
      icon: Briefcase,
      title: 'Job Opportunities',
      description: 'Access exclusive job postings from alumni and partner companies',
      color: 'bg-green-500'
    },
    {
      icon: Calendar,
      title: 'Events & Reunions',
      description: 'Stay updated with campus events, reunions, and networking opportunities',
      color: 'bg-purple-500'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get instant help with our intelligent AI helper for jobs, FAQs, and more',
      color: 'bg-pink-500'
    },
    {
      icon: Gamepad2,
      title: 'Interactive Games',
      description: 'Challenge yourself with brain games and compete on leaderboards',
      color: 'bg-orange-500'
    },
    {
      icon: Award,
      title: 'Mentorship Program',
      description: 'Students can connect with alumni mentors for guidance and support',
      color: 'bg-cyan-500'
    }
  ];

  const stats = [
    { label: 'Alumni Members', value: '5,000+' },
    { label: 'Job Postings', value: '250+' },
    { label: 'Success Stories', value: '1,200+' },
    { label: 'Active Mentors', value: '300+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">IdeaBind</h1>
            </div>
            <Button onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Connect. Engage. Grow.
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the premier alumni engagement platform connecting students, alumni, and administrators
              in a unified digital space designed for growth and collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onGetStarted} className="text-lg">
                Join Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <img
              src="https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Alumni networking"
              className="rounded-2xl shadow-2xl mx-auto"
            />
          </motion.div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed to enhance alumni engagement through
              community interaction, learning, and gamified participation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <div className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-4xl font-bold text-white mb-6">
                  For Students
                </h3>
                <ul className="space-y-4 text-white text-lg">
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Connect with alumni mentors for career guidance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Access exclusive job opportunities from the alumni network</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Learn from success stories and alumni experiences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Participate in interactive games and challenges</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-4xl font-bold text-white mb-6">
                  For Alumni
                </h3>
                <ul className="space-y-4 text-white text-lg">
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Give back by mentoring the next generation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Share job opportunities and help students succeed</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Stay connected with your alma mater community</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
                    <span>Access exclusive events and networking opportunities</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of alumni and students already connected on IdeaBind
            </p>
            <Button size="lg" onClick={onGetStarted} className="text-lg">
              Join the Community
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-6 h-6" />
                <span className="text-xl font-bold">IdeaBind</span>
              </div>
              <p className="text-gray-400">
                Connecting alumni, students, and administrators in a unified digital space.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Support</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 IdeaBind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
