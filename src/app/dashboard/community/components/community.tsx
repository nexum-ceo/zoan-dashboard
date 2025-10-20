'use client';
import { Avatar, AvatarFallback, Button } from '@/components/ui';
import {
  useGetCommunityAgent,
  useInstallCommunityAgent,
} from '@/hooks/data/community';
import { TCommunityAgentData } from '@/types/community';
import { IconLabel } from '@tabler/icons-react';
import { Dot, Star } from 'lucide-react';
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

const CommunityProjectCard: FC<{ project: TCommunityAgentData }> = ({
  project,
}) => {
  const { mutate: installAgent } = useInstallCommunityAgent();

  const handleInstallAgent = () => {
    installAgent(project.agent.id);
  };

  return (
    <div className="p-3 flex items-center gap-2 bg-white rounded-lg border border-[#272727]/5 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Project Image */}
      <div className="relative size-13 rounded-lg overflow-hidden aspect-square shrink-0">
        <Image
          src={'/image/mario-1.png'}
          alt={project.agent.id}
          fill
          className="object-cover w-full h-full cursor-pointer"
        />
      </div>

      {/* Project Content */}
      <div className="flex-1 min-w-0">
        {/* Title and Category */}
        <div className="flex items-center gap-1">
          <h3 className="text-paragraph">{project.agent.name}</h3>
        </div>
        {/* Description */}
        <p className="text-xs font-normal line-clamp-1 text-[#272727]/50">
          {project.agent.description}
        </p>

        {/* Creator, Group Avatar and Stats */}
        <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap min-w-0">
          <div className="flex items-center gap-1">
            <IconLabel className="w-3 h-3 text-primary-brand-darker-green" />
            <span className="text-primary-brand-darker-green text-[10px] font-normal">
              {'game'}
            </span>
          </div>
          <Dot className="w-2 h-2" />
          <div className="shrink-0">
            <GroupAvatar />
          </div>
          <span className="text-xs text-[#272727]/50 shrink-0">
            {project.community.install_count} Install
          </span>
          <Dot className="w-2 h-2" />
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 text-[#272727]/50" />
            <span className="text-xs text-[#272727]/50">
              {project.community.rating_avg}
            </span>
          </div>
        </div>
      </div>
      <Button
        size={'l'}
        variant="secondary"
        className="!p-1"
        onClick={handleInstallAgent}
        disabled={project.agent.is_installed || project.agent.is_owner}
      >
        {/* <ArrowUpRight className="text-[#272727]" /> */}
        {project.agent.is_owner
          ? 'Owned'
          : project.agent.is_installed
          ? 'Installed'
          : 'Install'}
      </Button>
    </div>
  );
};

export const Community: FC<CommunityProps> = (
  {
    // projects = defaultProjects,
  },
) => {
  const { data: communityAgents } = useGetCommunityAgent();

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
          {communityAgents?.data.data.map((project) => (
            <CommunityProjectCard
              key={project.community.id}
              project={project}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Community;
