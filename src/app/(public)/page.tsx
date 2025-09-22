import CommunitySection from '@/app/(public)/components/community-section';
import TopCreators from '@/app/(public)/components/top-creators';
import { PlaygroundInput } from '@/app/dashboard/playground/components';
import OptionButtons from '@/components/ui/option-buttons';

export default function HomePage() {
  return (
    <div className="my-container flex flex-col gap-9">
      {/** ---  AI Chat Section ---  */}
      <div>
        <div className="text-body-b1 text-center">
          What should we build today?
        </div>

        {/* Input Area */}
        <PlaygroundInput value={''} disabled={false} />

        {/* AI Suggestion */}
        <div className="mt-2">
          <OptionButtons />
        </div>
      </div>

      {/** --- Community Section ---  */}
      <CommunitySection />

      {/** --- Top Creators Section ---  */}
      <TopCreators />
    </div>
  );
}
