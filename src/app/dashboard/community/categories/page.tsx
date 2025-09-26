'use client';
import CategoriesCard from '@/app/dashboard/community/categories/components/categories-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ChevronRight from '../../../../../public/icon/chevron-right';
import Search from '../../../../../public/icon/search';

export default function CategoriesPage() {
  const router = useRouter();
  return (
    <div className="py-10">
      <div className="px-25 py-10 space-y-6">
        <Button
          variant={'secondary'}
          className="!p-2"
          onClick={() => router.push('/dashboard/community')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        {/* Header */}
        <div>
          <div className="text-tag-label flex items-center gap-1">
            <button
              type="button"
              onClick={() => router.push('/dashboard/community')}
              className="text-[#272727]/50 hover:text-[#272727] cursor-pointer"
            >
              Community
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary-brand-darker-green">Categories</span>
          </div>
          <div className="flex justify-between">
            <div className="text-body-b1 flex items-center">
              All AI agents categories
            </div>

            <div className="relative w-80 h-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
              <Input
                placeholder="Search all AI agents"
                className="w-full h-10 pl-10 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <CategoriesCard />
      </div>
    </div>
  );
}
