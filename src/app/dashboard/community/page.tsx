import AIDappStudioSection from '@/app/dashboard/community/components/ai-dapp-studio';
import Community from '@/app/dashboard/community/components/community';

export default function CommunityPage() {
  return (
    <>
      <>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative py-20 bg-white">
          <div className="px-25 py-20 pb-6">
            {/* Messages */}
            <div>header</div>
            {/* Input Area */}

            {/* AI Suggestion */}
            <div className="mt-6">
              <div>option buttons</div>
            </div>
          </div>

          <div className="py-20 pt-6 2xl:px-30 sm:px-12 w-full">
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
