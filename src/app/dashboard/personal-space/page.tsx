import ChartSection from '@/app/dashboard/personal-space/components/chart-section';
import ManagementSection from '@/app/dashboard/personal-space/components/managerment-section';

export default function PersonalSpace() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center ">
      {/*Chart Section*/}
      <div className="w-full px-25 space-y-6 py-20 max-w-7xl">
        <ChartSection />
        <ManagementSection />
      </div>
    </div>
  );
}
