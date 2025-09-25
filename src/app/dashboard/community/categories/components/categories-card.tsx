import Image from 'next/image';
import GamePad from '../../../../../../public/icon/game-pad';

type CategoryItem = {
  id: number;
  title: string;
  description: string;
  agentsCount: number;
  images: {
    main: string;
    left: string;
    right: string;
  };
};

const categories: CategoryItem[] = Array.from({ length: 12 }).map(
  (_, index) => ({
    id: index + 1,
    title: index % 3 === 0 ? 'Gaming' : index % 3 === 1 ? 'Website' : '3D Game',
    description: 'Designs and optimizes database schemas and queries',
    agentsCount: 600,
    images: {
      main: '/image/card/source_hollow-knight-boss.jpg',
      left: '/image/card/adventure.jpg',
      right: '/image/mario-2.png',
    },
  }),
);

export default function CategoriesCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {categories.map((item) => (
        <div
          key={item.id}
          className="border border-[#EDEDED] rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow"
        >
          <div className="">
            <div className="w-full h-40 relative overflow-hidden">
              <Image
                src={item.images.main}
                alt={item.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                priority={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div className="relative h-24 overflow-hidden">
                <Image
                  src={item.images.left}
                  alt={`${item.title} left`}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="relative h-24 overflow-hidden">
                <Image
                  src={item.images.right}
                  alt={`${item.title} right`}
                  fill
                  className="object-cover object-center"
                />{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="px-4 py-3">
            {' '}
            <div className="flex items-center justify-between">
              {' '}
              <div className="flex items-center gap-2">
                <GamePad className="w-4 h-4 stroke-primary-brand-darker-green" />
                <div className="text-paragraph font-medium !text-[14px]">
                  {item.title}
                </div>
              </div>
              <div className="text-tag-label text-[#272727]/50">
                {item.agentsCount} AI Agents
              </div>
            </div>
            <div className="text-paragraph !text-[#272727]/50 mt-2">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
