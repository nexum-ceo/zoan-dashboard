'use client';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VectorIcon from '../../../../../public/icon/vector';
import Adventure from '../../../../../public/image/card/adventure.jpg';
import Boat from '../../../../../public/image/card/boat.jpg';
import HollowKnight from '../../../../../public/image/card/source_hollow-knight-boss.jpg';
import Mario1 from '../../../../../public/image/mario-1.png';
import Mario2 from '../../../../../public/image/mario-2.png';

export default function Category() {
  const router = useRouter();
  const categories: Array<{
    id: string;
    title: string;
    count: string;
    images: StaticImageData[];
  }> = [
    {
      id: 'gaming',
      title: 'Gaming',
      count: '600',
      images: [Mario1, HollowKnight, Adventure, Mario2, Boat],
    },
    {
      id: 'website',
      title: 'Website',
      count: '600',
      images: [Mario1, HollowKnight, Adventure, Mario2, Boat],
    },
    {
      id: '3d',
      title: '3D Game',
      count: '600',
      images: [Mario1, HollowKnight, Adventure, Mario2, Boat],
    },
  ];
  return (
    <>
      <section className="py-2 px-4">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-body-b1 mb-2">Categories</div>
            </div>
            <button
              onClick={() => router.push('/dashboard/community/categories')}
              className="text-paragraph !text-[#272727]/50 flex items-center gap-1.5 cursor-pointer"
            >
              Browse all
              <VectorIcon />
            </button>
          </div>
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-50">
            {categories.map((c) => (
              <button
                key={c.id}
                className="w-full h-50 bg-white border border-[#272727]/10 rounded-xl overflow-hidden text-left cursor-pointer group flex flex-col"
              >
                {/* Image strip */}
                <div className="relative w-full flex-1">
                  <div className="absolute inset-0 flex gap-0">
                    {c.images.slice(0, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className={[
                          'relative h-full shrink-0 transform-gpu transition-transform duration-300 ease-out will-change-transform',
                          idx === 0
                            ? 'w-[15%] origin-left delay-0 group-hover:scale-x-110 group-hover:-translate-x-1'
                            : '',
                          idx === 1
                            ? 'w-[15%] origin-left delay-75 group-hover:scale-x-105'
                            : '',
                          idx === 2
                            ? 'w-[15%] origin-center delay-150 group-hover:scale-x-110'
                            : '',
                          idx === 3
                            ? 'w-[15%] origin-right delay-200 group-hover:scale-x-110 group-hover:translate-x-1'
                            : '',
                          idx === 4
                            ? 'w-[40%] origin-right delay-300 group-hover:scale-x-110 group-hover:translate-x-2'
                            : '',
                        ].join(' ')}
                      >
                        <Image
                          src={img}
                          alt={c.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Meta row */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-paragraph">{c.title}</div>
                    <div className="text-[10px] text-[#272727]/50">
                      {c.count}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#272727]/50">
                    <span>Discovery</span>
                    <VectorIcon />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
