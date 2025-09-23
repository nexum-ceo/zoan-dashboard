import TopCreators from '@/app/(public)/components/top-creators';
import CommunitySection from '@/app/dashboard/playground/components/community';
import PersonalSpace from '@/app/dashboard/playground/components/personal-space';

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
            {/** --- Personal Space Section ---  */}
            <PersonalSpace />

            {/** --- Community Section ---  */}
            <CommunitySection />

            {/** --- Top Creators Section ---  */}
            <TopCreators />
          </div>
        </div>
      </>
      );
    </>
  );
}
