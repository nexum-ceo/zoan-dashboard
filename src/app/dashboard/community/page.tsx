import AIDappStudioSection from '@/app/dashboard/community/components/ai-dapp-studio';
import Category from '@/app/dashboard/community/components/category';
import Community from '@/app/dashboard/community/components/community';
import { Input } from '@/components/ui/input';
import Search from '../../../../public/icon/search';

export default function CommunityPage() {
  return (
    <>
      <>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center relative py-10 bg-white">
          <div className="px-25 py-10 pb-6 w-full">
            {/* Messages */}
            <div className="text-body-b1 text-center mb-2">
              Discover the best apps, components and
              <br />
              starters from the community.
            </div>
            <div className="text-paragraph !text-[#272727]/50 text-center mb-4">
              Discover and install AI agents created by the community
            </div>
            {/* Input Area */}
            <div className="relative w-[50%] mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
              <Input
                placeholder="Search all AI agents"
                className="w-full h-10 pl-10 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
              />
            </div>
          </div>

          <div className="py-20 pt-6 2xl:px-30 sm:px-12 w-full">
            <div className="mt-6">
              <Category />
            </div>
            {/** --- Community Section ---  */}
            <Community />

            {/** --- AIDappStudio Section ---  */}
            <AIDappStudioSection />
          </div>
        </div>
      </>
    </>
  );
}
