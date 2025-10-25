import { useState } from 'react';
import { useAuth } from '../components/WhopAuthProvider';
import { Crown, Zap, User, Check, ArrowRight } from 'lucide-react';

export default function SubscriptionManager() {
  const { subscriptionTier } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      interval: 'month',
      features: [
        '1 project per month',
        'Basic offer analysis',
        'Simple avatar builder',
        'Limited competitor analysis'
      ],
      rateLimit: 5,
      icon: <User className="w-6 h-6" />,
      color: 'gray',
      current: subscriptionTier === 'free'
    },
    {
      id: 'pro',
      name: 'Pro Tier',
      price: 29,
      interval: 'month',
      features: [
        '5 projects per month',
        'Advanced AI analysis',
        'Full avatar manifold',
        'Comprehensive competitor intelligence',
        'Launch document generation',
        'Export capabilities'
      ],
      rateLimit: 50,
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      current: subscriptionTier === 'pro'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited projects',
        'Priority AI processing',
        'Advanced analytics',
        'Custom integrations',
        'White-label options',
        'Dedicated support'
      ],
      rateLimit: 200,
      icon: <Crown className="w-6 h-6" />,
      color: 'purple',
      current: subscriptionTier === 'enterprise'
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      // In a real implementation, this would redirect to Whop's payment flow
      console.log(`Upgrading to ${planId} plan`);
      // window.location.href = `https://whop.com/checkout/${planId}`;
    } catch (error) {
      console.error('Failed to upgrade:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50 text-blue-600';
      case 'purple':
        return 'border-purple-200 bg-purple-50 text-purple-600';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600">
          Unlock the full potential of Rapid Launch Agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 ${
              plan.current
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } transition-all duration-200`}
          >
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${getColorClasses(plan.color)}`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {plan.rateLimit} AI analyses per month
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.current || isUpgrading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                plan.current
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.color === 'blue'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : plan.color === 'purple'
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {isUpgrading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : plan.current ? (
                'Current Plan'
              ) : (
                <>
                  {plan.price === 0 ? 'Get Started' : 'Upgrade'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          All plans include access to the Rapid Launch Agent platform and AI-powered analysis tools.
        </p>
      </div>
    </div>
  );
}
