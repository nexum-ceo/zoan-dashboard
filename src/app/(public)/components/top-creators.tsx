import Image from 'next/image';
import VectorIcon from '../../../../public/icon/vector';

export default function TopCreators() {
  // Creator images data
  const creators = [
    { id: 1, image: '/image/creators/creator-1.jpg' },
    { id: 2, image: '/image/creators/creator-2.png' },
    { id: 3, image: '/image/creators/creator-3.jpg' },
    { id: 4, image: '/image/creators/creator-4.png' },
    { id: 5, image: '/image/creators/creator-5.png' },
    { id: 6, image: '/image/creators/creator-6.png' },
    { id: 7, image: '/image/creators/creator-7.jpg' },
    { id: 8, image: '/image/creators/creator-8.jpg' },
    { id: 9, image: '/image/creators/creator-9.jpg' },
    { id: 10, image: '/image/creators/creator-10.jpg' },
    { id: 11, image: '/image/creators/creator-11.jpg' },
    { id: 12, image: '/image/creators/creator-12.jpg' },
    { id: 13, image: '/image/creators/creator-13.png' },
  ];

  return (
    <div className="px-6 py-5 space-y-6">
      <div className="flex justify-between">
        <div className="text-body-b1 !text-[20px] leading-6.5">
          Top Creators
        </div>
        <button className="text-paragraph !text-[#272727]/50 flex items-center gap-1.5 cursor-pointer">
          Explore all
          <VectorIcon />
        </button>
      </div>
      <div className="flex justify-between">
        <div className="text-[20px] leading-6 font-medium text-[#272727]/50 w-94">
          Where the best AI-driven games and apps come to life and inspire the
          community.
        </div>

        {/** --- Creators Grid ---  */}
        <div className="grid grid-cols-4 gap-2 w-64">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className="aspect-square w-32 h-32 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <Image
                src={creator.image}
                alt={`Creator ${creator.id}`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
