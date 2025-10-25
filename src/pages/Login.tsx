import { useAuth } from '../components/WhopAuthProvider';
import { Rocket, Zap, Target, Users, TrendingUp, Shield } from 'lucide-react';

export default function Login() {
  const { login, isLoading } = useAuth();

  const features = [
    {
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      title: "72-Hour Launch",
      description: "Transform your idea into a business in less than 72 hours"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes your offer, avatar, and competitors"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Strategic Positioning",
      description: "Find your unique positioning in the market"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Avatar Intelligence",
      description: "Deep psychological profiling of your ideal customer"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-red-500" />,
      title: "Market Intelligence",
      description: "Comprehensive competitor analysis and market insights"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Launch Document",
      description: "38-section comprehensive marketing brief"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Rapid Launch Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your idea into a business in less than 72 hours using AI-powered marketing automation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Get Started
              </h2>
              <p className="text-gray-600">
                Sign in with Whop to access the Rapid Launch Agent
              </p>
            </div>

            <button
              onClick={login}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Sign in with Whop
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500">
            Powered by Whop • Built with AI
          </p>
        </div>
      </div>
    </div>
  );
}
