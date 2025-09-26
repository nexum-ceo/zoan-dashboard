import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLabel } from '@tabler/icons-react';
import { ArrowUpRight, Dot, Star } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
import History from '../../../../../public/icon/history';
import VectorIcon from '../../../../../public/icon/vector';
type CommunityProject = {
  id: string;
  title: string;
  category: string;
  creator: string;
  installs: string;
  rating: number;
  tags: string[];
  description: string;
  image: string;
};

type CommunitySectionProps = {
  projects?: CommunityProject[];
};

// Group Avatar Component using shadcn Avatar
const GroupAvatar: FC = () => {
  const avatars = [
    { color: 'bg-red-500', initial: 'R' },
    { color: 'bg-orange-500', initial: 'O' },
    { color: 'bg-green-500', initial: 'G' },
    { color: 'bg-blue-500', initial: 'B' },
    { color: 'bg-purple-500', initial: 'P' },
  ];

  return (
    <div className="flex -space-x-1">
      {avatars.map((avatar, index) => (
        <Avatar key={index} className="w-3 h-3 border border-white">
          <AvatarFallback
            className={`${avatar.color} text-white text-[8px] font-medium`}
          >
            {avatar.initial}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
};

const CommunityProjectCard: FC<{ project: CommunityProject }> = ({
  project,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Project Image */}
      <div className="relative w-full h-60.5">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover rounded-t-lg cursor-pointer"
        />
      </div>

      {/* Project Content */}
      <div className="p-4 space-y-1 w-full">
        {/* Title and Category */}
        <div className="flex items-center gap-1">
          <h3 className="text-paragraph">{project.title}</h3>
          <div className="flex items-center gap-1">
            <IconLabel className="w-3 h-3 text-primary-brand-darker-green" />
            <span className="text-primary-brand-darker-green text-[10px] font-normal">
              {project.category}
            </span>
          </div>
        </div>

        {/* Creator, Group Avatar and Stats */}
        <div className="flex items-center gap-1">
          <p className="text-tag-label">By {project.creator}</p>
          <Dot className="w-2 h-2" />
          <GroupAvatar />
          <Dot className="w-2 h-2" />
          <span className="text-xs text-[#272727]/50">{project.installs}</span>
          <Dot className="w-2 h-2" />
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#272727]/50" />
            <span className="text-xs text-[#272727]/50">{project.rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="text-tag-label bg-[#272727]/5 p-1.5 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs font-normal line-clamp-2 text-[#272727]/50">
          {project.description}
        </p>

        {/* Play Demo Button */}
        <div className="flex gap-1 w-full">
          <Button className="flex-1" size="l">
            Play demo
          </Button>
          <Button size={'l'} variant="secondary" className="!p-1">
            <ArrowUpRight className="text-[#272727]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CommunitySection: FC<CommunitySectionProps> = ({
  projects = defaultProjects,
}) => {
  return (
    <section className="py-12 px-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-body-b1 mb-2">From the Community</div>
            <div className="text-paragraph text-sm !text-[#272727]/50">
              Explore what the community is building with ZOAN.
            </div>
          </div>
          <button className="text-paragraph !text-[#272727]/50 flex items-center gap-1.5 cursor-pointer">
            Explore all
            <VectorIcon />
          </button>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant={'secondary'}>
              Recent
              <History className="w-3 h-3" />
            </Button>
          </div>
          <div>
            <Tabs defaultValue="discover" className="w-full bg-white">
              <TabsList className="bg-white border border-[#272727]/5">
                <TabsTrigger
                  value="discover"
                  className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
                >
                  Discover
                </TabsTrigger>
                <TabsTrigger
                  value="2d"
                  className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
                >
                  2D game
                </TabsTrigger>
                <TabsTrigger
                  value="website"
                  className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
                >
                  Website
                </TabsTrigger>
                <TabsTrigger
                  value="consumer-app"
                  className="px-3 py-2 text-[#272727] data-[state=active]:bg-primary-brand-green"
                >
                  Consumer App
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <CommunityProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Default projects data
const defaultProjects: CommunityProject[] = [
  {
    id: '1',
    title: 'Mario 2D platform',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k install',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
  {
    id: '2',
    title: 'Pixel Adventure',
    category: 'Gaming',
    creator: 'PixelDev',
    installs: '3.8k install',
    rating: 4.7,
    tags: ['Pixel art', 'Adventure', '2D'],
    description: 'A charming pixel art adventure game with retro aesthetics',
    image: '/image/mario-2.png',
  },
  {
    id: '3',
    title: 'Mystic Forest',
    category: 'Gaming',
    creator: 'FantasyGames',
    installs: '2.1k install',
    rating: 4.5,
    tags: ['Fantasy', 'Exploration', 'Puzzle'],
    description: 'Explore magical forests and solve ancient mysteries',
    image: '/image/mario-3.png',
  },
  {
    id: '4',
    title: 'Space Explorer',
    category: 'Gaming',
    creator: 'CosmicDev',
    installs: '4.3k install',
    rating: 4.8,
    tags: ['Space', 'Exploration', '3D'],
    description: 'Navigate through galaxies and discover new worlds',
    image: '/image/mario-1.png',
  },
  {
    id: '5',
    title: 'Racing Pro',
    category: 'Gaming',
    creator: 'SpeedGames',
    installs: '6.7k install',
    rating: 4.6,
    tags: ['Racing', 'Multiplayer', '3D'],
    description: 'High-speed racing with realistic physics and graphics',
    image: '/image/mario-2.png',
  },
  {
    id: '6',
    title: 'Puzzle Master',
    category: 'Gaming',
    creator: 'BrainGames',
    installs: '3.2k install',
    rating: 4.4,
    tags: ['Puzzle', 'Strategy', 'Brain training'],
    description: 'Challenge your mind with intricate puzzle mechanics',
    image: '/image/mario-3.png',
  },
];

export default CommunitySection;
