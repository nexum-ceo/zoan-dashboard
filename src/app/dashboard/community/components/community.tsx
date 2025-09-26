import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IconLabel } from '@tabler/icons-react';
import { ArrowUpRight, Dot, Star } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';
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

type CommunityProps = {
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
    <div className="p-3 flex items-center gap-2 bg-white rounded-lg border border-[#272727]/5 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Project Image */}
      <div className="relative size-13 rounded-lg overflow-hidden aspect-square shrink-0">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover w-full h-full cursor-pointer"
        />
      </div>

      {/* Project Content */}
      <div className="flex-1 min-w-0">
        {/* Title and Category */}
        <div className="flex items-center gap-1">
          <h3 className="text-paragraph">{project.title}</h3>
        </div>
        {/* Description */}
        <p className="text-xs font-normal line-clamp-1 text-[#272727]/50">
          {project.description}
        </p>

        {/* Creator, Group Avatar and Stats */}
        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap min-w-0">
          <div className="flex items-center gap-1">
            <IconLabel className="w-3 h-3 text-primary-brand-darker-green" />
            <span className="text-primary-brand-darker-green text-[10px] font-normal">
              {project.category}
            </span>
          </div>
          <Dot className="w-2 h-2" />
          <div className="shrink-0">
            <GroupAvatar />
          </div>
          <span className="text-xs text-[#272727]/50 shrink-0">
            {project.installs} Install
          </span>
          <Dot className="w-2 h-2" />
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 text-[#272727]/50" />
            <span className="text-xs text-[#272727]/50">{project.rating}</span>
          </div>
        </div>
      </div>
      <Button size={'l'} variant="secondary" className="!p-1">
        <ArrowUpRight className="text-[#272727]" />
      </Button>
    </div>
  );
};

export const Community: FC<CommunityProps> = ({
  projects = defaultProjects,
}) => {
  return (
    <section className="py-2 px-4">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-body-b1 mb-2">Community</div>
            <div className="text-paragraph text-sm !text-[#272727]/50">
              Discover all the Featured AI agents created by the community
            </div>
          </div>
          <button className="text-paragraph !text-[#272727]/50 flex items-center gap-1.5 cursor-pointer">
            Browse all
            <VectorIcon />
          </button>
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
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
  {
    id: '2',
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
  {
    id: '3',
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },

  {
    id: '4',
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
  {
    id: '5',
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
  {
    id: '6',
    title: 'Generate Game AI',
    category: 'Gaming',
    creator: 'GamingStudio',
    installs: '5.2k',
    rating: 4.9,
    tags: ['Game development', '2D/3D', 'Physics'],
    description: 'Designs and optimizes database schemas and queries',
    image: '/image/mario-1.png',
  },
];

export default Community;
