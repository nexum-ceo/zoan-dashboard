import Image from 'next/image';
import VectorIcon from '../../../../../public/icon/vector';

export default function Category() {
  const categories: Array<{
    id: string;
    title: string;
    count: string;
    image: string;
  }> = [
    {
      id: 'gaming',
      title: 'Gaming',
      count: '600',
      image: '/image/mario-1.png',
    },
    {
      id: 'website',
      title: 'Website',
      count: '600',
      image: '/image/mario-2.png',
    },
    {
      id: '3d',
      title: '3D Game',
      count: '600',
      image: '/image/mario-3.png',
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
            <button className="text-paragraph !text-[#272727]/50 flex items-center gap-1.5 cursor-pointer">
              Browse all
              <VectorIcon />
            </button>
          </div>
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((c) => (
              <button
                key={c.id}
                className="w-full bg-white border border-[#272727]/10 rounded-xl overflow-hidden text-left cursor-pointer group"
              >
                {/* Image strip */}
                <div className="relative w-full h-28">
                  <div className="absolute inset-0 grid grid-cols-4 gap-0 transition-transform duration-300 ease-out origin-center group-hover:scale-x-105 will-change-transform">
                    <div className="relative">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative grayscale">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative grayscale">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        className="object-cover"
                      />
                    </div>
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
