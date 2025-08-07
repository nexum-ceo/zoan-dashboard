import { Button } from '@/components/ui/button';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { Clock, Sparkles, Users } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon with animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <IconBuildingCommunity className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-3 h-3 text-yellow-800" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Community Hub
          <span className="block text-2xl md:text-3xl font-normal text-gray-600 mt-2">
            Coming Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          We&apos;re building an amazing community space where you can connect,
          share, and collaborate with other AI enthusiasts and developers.
        </p>

        {/* Features preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-sm text-gray-600">
              Meet like-minded developers and AI enthusiasts
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
            <p className="text-sm text-gray-600">
              Share your AI agents and discover amazing creations
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <IconBuildingCommunity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-sm text-gray-600">
              Work together on exciting AI projects
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Expected Launch
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            September 2025
          </div>
          <p className="text-sm text-gray-600">
            We&apos;re working hard to bring you the best community experience
          </p>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Want to be notified when we launch?
          </p>
          <Button className="px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Join Waitlist
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-float-delayed"></div>
      </div>
    </div>
  );
}
