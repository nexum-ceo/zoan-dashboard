import ChartSection from '@/app/dashboard/personal-space/components/chart-section';
import ManagermentSection from '@/app/dashboard/personal-space/components/managerment-section';

export default function PersonalSpace() {
  return (
    <div className="h-full bg-background transition-colors duration-200">
      <div className="my-container space-y-6">
        {/*Chart Section*/}
        <ChartSection />
        <ManagermentSection />
      </div>
    </div>
  );
}
