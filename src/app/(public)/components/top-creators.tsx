import Image from 'next/image';
import VectorIcon from '../../../../public/icon/vector';
import Creator1 from '../../../../public/image/creators/creator-1.jpg';
import Creator10 from '../../../../public/image/creators/creator-10.jpg';
import Creator11 from '../../../../public/image/creators/creator-11.jpg';
import Creator12 from '../../../../public/image/creators/creator-12.jpg';
import Creator13 from '../../../../public/image/creators/creator-13.png';
import Creator2 from '../../../../public/image/creators/creator-2.png';
import Creator3 from '../../../../public/image/creators/creator-3.jpg';
import Creator4 from '../../../../public/image/creators/creator-4.png';
import Creator5 from '../../../../public/image/creators/creator-5.png';
import Creator6 from '../../../../public/image/creators/creator-6.png';
import Creator7 from '../../../../public/image/creators/creator-7.jpg';
import Creator8 from '../../../../public/image/creators/creator-8.jpg';
import Creator9 from '../../../../public/image/creators/creator-9.jpg';

export default function TopCreators() {
  // Creator images data
  const creators = [
    { id: 1, image: Creator1 },
    { id: 2, image: Creator2 },
    { id: 3, image: Creator3 },
    { id: 4, image: Creator4 },
    { id: 5, image: Creator5 },
    { id: 6, image: Creator6 },
    { id: 7, image: Creator7 },
    { id: 8, image: Creator8 },
    { id: 9, image: Creator9 },
    { id: 10, image: Creator4 },
    { id: 11, image: Creator5 },
    { id: 12, image: Creator5 },
    { id: 13, image: Creator4 },
    { id: 14, image: Creator10 },
    { id: 15, image: Creator11 },
    { id: 16, image: Creator12 },
    { id: 17, image: Creator4 },
    { id: 18, image: Creator13 },
    { id: 19, image: Creator13 },
    { id: 20, image: Creator4 },
    { id: 21, image: Creator7 },
  ];

  return (
    <div className="py-5 px-4 space-y-6 w-full">
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
        <div className="flex-1">
          <div className="flex flex-col gap-0.5 items-end">
            <div className="flex gap-0.5">
              {creators.slice(0, 4).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* White card */}
              <div className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg bg-white transition-transform duration-200 flex items-center justify-center"></div>
              {creators.slice(4, 7).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer  transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {creators.slice(7, 11).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer  transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* White card */}
              <div className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg bg-white  transition-transform duration-200 flex items-center justify-center"></div>
              {creators.slice(11, 14).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer  transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {creators.slice(14, 18).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer  transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-0.5">
              {/* White card */}
              <div className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg bg-white  transition-transform duration-200 flex items-center justify-center"></div>
              {creators.slice(18, 21).map((creator) => (
                <div
                  key={creator.id}
                  className="aspect-square w-44 h-44 2xl:w-60 2xl:h-60 rounded-lg overflow-hidden cursor-pointer  transition-transform duration-200"
                >
                  <Image
                    src={creator.image}
                    alt={`Creator ${creator.id}`}
                    className="w-full h-full object-cover"
                    quality={100}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
