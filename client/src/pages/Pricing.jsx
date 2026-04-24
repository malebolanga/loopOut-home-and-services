import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: "basic",
      name: "Basic Access",
      description: "Perfect for individuals starting to explore services.",
      monthlyPrice: "Free",
      annualPrice: "Free",
      isPopular: false,
      buttonText: "Get Started",
      features: [
        { name: "Browse all verified listings", included: true },
        { name: "Contact up to 5 service providers/mo", included: true },
        { name: "Basic user profile", included: true },
        { name: "Save favorite properties", included: true },
        { name: "Verified Service Badge", included: false },
        { name: "Priority Support via AI", included: false },
        { name: "Promote your own listings", included: false },
      ]
    },
    {
      id: "pro",
      name: "loopOut PRO",
      description: "Ideal for active service providers and real estate agents.",
      monthlyPrice: "$15",
      annualPrice: "$12",
      isPopular: true,
      buttonText: "Upgrade to PRO",
      features: [
        { name: "Everything in Basic", included: true },
        { name: "Unlimited provider contacts", included: true },
        { name: "Verified Professional Badge", included: true },
        { name: "Rank higher in search results", included: true },
        { name: "List up to 5 properties/services", included: true },
        { name: "Access to Smart Search insights", included: true },
        { name: "Zero booking fees", included: false },
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For agencies and large scale businesses.",
      monthlyPrice: "$49",
      annualPrice: "$39",
      isPopular: false,
      buttonText: "Contact Sales",
      features: [
        { name: "Everything in PRO", included: true },
        { name: "Unlimited listings & services", included: true },
        { name: "Zero booking fees", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "API access for integrations", included: true },
        { name: "Custom contracts & invoicing", included: true },
        { name: "Homepage featured spots", included: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] pt-24 pb-16 px-6 sm:px-12 lg:px-24 font-sans">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#222222] tracking-tight mb-6">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E61E4D] to-[#D70466]">Pricing</span>
          </h1>
          <p className="text-lg text-[#717171]">
            Whether you are a home seeker, a trusted helper, or a real estate agency, we have a plan built precisely for your needs.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-[15px] font-medium ${!isAnnual ? 'text-[#222222]' : 'text-[#717171]'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-8 w-[60px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#DDDDDD] transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E61E4D] focus-visible:ring-offset-2"
              role="switch"
              aria-checked={isAnnual}
            >
              <div
                className={`absolute inset-0 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[#E61E4D]' : 'bg-[#DDDDDD]'}`}
              />
              <span
                className={`transform transition duration-300 ease-in-out absolute left-0 inline-block h-7 w-7 rounded-full bg-white shadow ring-0 ${isAnnual ? 'translate-x-[28px]' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-[15px] font-medium ${isAnnual ? 'text-[#222222]' : 'text-[#717171]'}`}>
              Annual Billing <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={`relative bg-white rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${plan.isPopular ? 'shadow-[0_20px_40px_-15px_rgba(230,30,77,0.3)] border-2 border-[#E61E4D]' : 'shadow-lg border border-gray-100'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-[#222222] mb-2">{plan.name}</h3>
              <p className="text-[#717171] text-sm mb-6 min-h-[40px]">{plan.description}</p>
              
              <div className="mb-8">
                {plan.monthlyPrice === "Free" ? (
                  <span className="text-4xl font-extrabold text-[#222222]">Free</span>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-[#222222]">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                    <span className="text-[#717171] ml-2 font-medium">/ month</span>
                  </div>
                )}
                {isAnnual && plan.monthlyPrice !== "Free" && (
                  <p className="text-sm text-[#717171] mt-1">Billed annually (${parseInt(plan.annualPrice.slice(1)) * 12}/year)</p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <FiCheckCircle className="text-[#E61E4D] text-xl shrink-0 mt-0.5" />
                    ) : (
                      <FiX className="text-gray-300 text-xl shrink-0 mt-0.5" />
                    )}
                    <span className={`text-[15px] leading-snug ${feature.included ? 'text-[#222222]' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link to={plan.id === "enterprise" ? "/contact" : "/sign-up"}>
                <button
                  className={`w-full py-4 rounded-xl font-semibold text-[15px] transition-all duration-200 ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white hover:shadow-lg'
                      : 'bg-white border-2 border-[#EBEBEB] text-[#222222] hover:border-[#222222] hover:bg-gray-50'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
