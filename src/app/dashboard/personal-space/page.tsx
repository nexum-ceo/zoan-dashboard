import ChartSection from '@/app/dashboard/personal-space/components/chart-section';
import ManagermentSection from '@/app/dashboard/personal-space/components/managerment-section';

export default function PersonalSpace() {
  return (
    <div className="flex-1 flex flex-col px-25 space-y-6 py-20">
      {/*Chart Section*/}
      <ChartSection />
      <ManagermentSection />
    </div>
  );
}
