import { Download, Play, Star } from 'lucide-react';
import Image from 'next/image';
import { FC } from 'react';

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

const CommunityProjectCard: FC<{ project: CommunityProject }> = ({
  project,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Project Image */}
      <div className="relative w-full h-60.5">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover rounded-t-xl"
        />
      </div>

      {/* Project Content */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            {project.title}
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-xs">🎮</span>
            </div>
            <span className="text-xs text-gray-600">{project.category}</span>
          </div>
        </div>

        {/* Creator */}
        <p className="text-xs text-gray-500">By {project.creator}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{project.installs}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{project.rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed">
          {project.description}
        </p>

        {/* Play Demo Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200">
          <Play className="w-3 h-3" />
          Play demo
        </button>
      </div>
    </div>
  );
};

export const CommunitySection: FC<CommunitySectionProps> = ({
  projects = defaultProjects,
}) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              From the Community
            </h2>
            <p className="text-gray-600">
              Explore what the community is building with ZOAN.
            </p>
          </div>
          <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
            Explore all
            <span className="text-lg">→</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
