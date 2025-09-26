import CommunitySection from '@/app/(public)/components/community-section';
import TopCreators from '@/app/(public)/components/top-creators';
import { PlaygroundInput } from '@/app/dashboard/playground/components';
import OptionButtons from '@/components/ui/option-buttons';

export default function HomePage() {
  return (
    <div className="my-container flex flex-col gap-9 items-center">
      {/** ---  AI Chat Section ---  */}
      <div className="max-w-7xl w-full">
        <div className="text-body-b1 text-center mb-6">
          What should we build today?
        </div>

        {/* Input Area */}
        <PlaygroundInput value={''} disabled={false} />

        {/* AI Suggestion */}
        <div className="mt-6">
          <OptionButtons />
        </div>
      </div>

      <div className="max-w-7xl w-full">
        {/** --- Community Section ---  */}
        <CommunitySection />

        {/** --- Top Creators Section ---  */}
        <TopCreators />
      </div>
    </div>
  );
}
