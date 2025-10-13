import ActivitySection from '@/app/dashboard/profile/components/activity-section';
import ProfileSidebar from '@/app/dashboard/profile/components/profile-sidebar';
import Globe from '../../../../public/icon/globe';

export default function ProfilePage() {
  return (
    <div className="flex flex-col py-10 pr-3 items-center">
      <div className="flex items-start justify-between gap-13 px-25 py-10 max-w-7xl">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Main */}
        <main className="space-y-4 w-fit">
          <ActivitySection />

          <section className="bg-white p-2 border border-dashed border-[#272727]/10 rounded-lg space-y-3">
            <div className="font-medium text-sm leading-4.5 text-[#272727]">
              Show case
            </div>
            <div className="text-center pt-[177px] pb-[148px] flex flex-col items-center justify-center">
              <div className="p-1 border border-[#272727]/10 rounded-md">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-sm text-[#272727]/20 font-medium">
                No community submissions to display.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
