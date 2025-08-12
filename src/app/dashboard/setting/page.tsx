import ProviderTable from '@/app/dashboard/setting/provider-table';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXTAUTH_URL + `/setting`;
  return {
    title: 'Setting',
    description: 'Setting your provider and API token',
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
    },
  };
}

export default function SettingPage() {
  return (
    <div className="w-full h-full bg-sidebar flex flex-col p-4">
      <div className="p-4 flex items-center justify-between text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        <span>Your list providers</span>
      </div>

      <div className="w-full flex-1 flex flex-row gap-3 pt-3">
        <ProviderTable />
      </div>
    </div>
  );
}
