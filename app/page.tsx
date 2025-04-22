'use client';

import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { Features } from './components/landing/Features';
import { Footer } from './components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Prepare for success in 3 simple steps
              </p>
            </div>
            
            <div className="mt-16">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {[
                  {
                    title: "Practice with AI",
                    description: "Start a mock interview with our AI visa officer. Experience realistic questions tailored to your specific B1 visa purpose.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    ),
                    number: "01",
                  },
                  {
                    title: "Get Personalized Feedback",
                    description: "Receive detailed feedback on your answers, with specific suggestions for improvement and a performance score.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    number: "02",
                  },
                  {
                    title: "Track Your Progress",
                    description: "Monitor your improvement over time with performance analytics and identify areas that need more practice.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    number: "03",
                  },
                ].map((step, index) => (
                  <div key={index} className="mt-10 lg:mt-0">
                    <div className="relative">
                      <div className="absolute flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white">
                        {step.icon}
                      </div>
                      <div className="absolute -right-4 -top-4 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-lg font-bold">
                        {step.number}
                      </div>
                      <div className="pl-20">
                        <h3 className="text-xl font-medium text-gray-900">{step.title}</h3>
                        <p className="mt-2 text-base text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Success stories from our users
              </p>
            </div>
            
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "Michael Johnson",
                    role: "Software Engineer",
                    content: "The mock interviews were incredibly realistic. I felt much more confident during my actual interview, and my B1 visa was approved!",
                    image: "https://randomuser.me/api/portraits/men/32.jpg",
                  },
                  {
                    name: "Sarah Williams",
                    role: "Business Consultant",
                    content: "After practicing with this AI tool, I knew exactly what to expect. The feedback was spot-on and helped me improve my weak areas.",
                    image: "https://randomuser.me/api/portraits/women/44.jpg",
                  },
                  {
                    name: "David Chen",
                    role: "Marketing Director",
                    content: "I was nervous about my B1 visa interview, but after several practice sessions, my confidence grew significantly. Highly recommend!",
                    image: "https://randomuser.me/api/portraits/men/77.jpg",
                  },
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-8">
                      <div className="flex items-center">
                        <img className="h-12 w-12 rounded-full" src={testimonial.image} alt={testimonial.name} />
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-gray-600 italic">"{testimonial.content}"</p>
                      </div>
                      <div className="mt-4 flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Pricing</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Choose the plan that's right for your visa preparation needs
              </p>
            </div>
            
            <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "Perfect for a quick practice session",
                  features: [
                    "3 practice interviews",
                    "Basic feedback",
                    "Limited resource access",
                    "Email support"
                  ],
                  cta: "Get Started",
                  highlighted: false
                },
                {
                  name: "Premium",
                  price: "$29",
                  description: "Best for comprehensive preparation",
                  features: [
                    "Unlimited practice interviews",
                    "Detailed feedback & analysis",
                    "Full resource library access",
                    "Interview scenario variations",
                    "Performance tracking",
                    "Priority support"
                  ],
                  cta: "Start Free Trial",
                  highlighted: true
                },
                {
                  name: "Enterprise",
                  price: "Contact us",
                  description: "For immigration consultants & agencies",
                  features: [
                    "Everything in Premium",
                    "Multiple user accounts",
                    "Custom interview scenarios",
                    "Admin dashboard",
                    "Client management tools",
                    "Dedicated account manager"
                  ],
                  cta: "Contact Sales",
                  highlighted: false
                }
              ].map((plan, index) => (
                <div key={index} className={`rounded-lg shadow-lg divide-y divide-gray-200 ${plan.highlighted ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="p-6">
                    {plan.highlighted && (
                      <p className="absolute top-0 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </p>
                    )}
                    <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                    <p className="mt-4">
                      <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                      {plan.price !== "Contact us" && <span className="text-base font-medium text-gray-500">/month</span>}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                    <button
                      type="button"
                      className={`mt-6 w-full ${
                        plan.highlighted 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      } border border-transparent rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                  <div className="pt-6 pb-8 px-6">
                    <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex">
                          <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-3 text-sm text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
