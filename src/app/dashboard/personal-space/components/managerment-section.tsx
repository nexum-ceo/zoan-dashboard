import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreVertical } from 'lucide-react';
import AddPlusSquare from '../../../../../public/icon/add-plus-square';
import Search from '../../../../../public/icon/search';

// Mock data for 12 agents
const agentsData = [
  {
    id: 1,
    title: 'Generate Game AI',
    publisher: 'GamingStudio',
    category: 'Gaming',
    version: 'V1.2.1',
    tags: ['Game development', '2D/3D', 'Physics', 'AI', 'Unity'],
    description: 'Advanced coding assistant for React and Next.js development',
    chatUsage: { current: 15, total: 100 },
    isActive: true,
    icon: '🎮',
  },
  {
    id: 2,
    title: 'Code Assistant Pro',
    publisher: 'DevTools Inc',
    category: 'Development',
    version: 'V2.0.5',
    tags: ['Programming', 'Debugging', 'Code Review', 'Best Practices'],
    description:
      'Professional coding assistant for multiple programming languages',
    chatUsage: { current: 45, total: 100 },
    isActive: true,
    icon: '💻',
  },
  {
    id: 3,
    title: 'Design Helper',
    publisher: 'CreativeStudio',
    category: 'Design',
    version: 'V1.8.2',
    tags: ['UI/UX', 'Figma', 'Prototyping', 'Color Theory'],
    description:
      'AI-powered design assistant for creating beautiful interfaces',
    chatUsage: { current: 23, total: 100 },
    isActive: false,
    icon: '🎨',
  },
  {
    id: 4,
    title: 'Data Analyst',
    publisher: 'DataCorp',
    category: 'Analytics',
    version: 'V3.1.0',
    tags: ['Data Science', 'Python', 'SQL', 'Visualization'],
    description: 'Advanced data analysis and visualization assistant',
    chatUsage: { current: 67, total: 100 },
    isActive: true,
    icon: '📊',
  },
  {
    id: 5,
    title: 'Content Writer',
    publisher: 'WriteWell',
    category: 'Writing',
    version: 'V1.5.3',
    tags: ['Content', 'SEO', 'Blogging', 'Marketing'],
    description: 'Professional content creation and writing assistant',
    chatUsage: { current: 12, total: 100 },
    isActive: true,
    icon: '✍️',
  },
  {
    id: 6,
    title: 'Security Scanner',
    publisher: 'SecureTech',
    category: 'Security',
    version: 'V2.3.1',
    tags: ['Security', 'Vulnerability', 'Penetration Testing', 'Compliance'],
    description: 'Comprehensive security analysis and vulnerability scanner',
    chatUsage: { current: 89, total: 100 },
    isActive: false,
    icon: '🔒',
  },
  {
    id: 7,
    title: 'API Tester',
    publisher: 'TestLabs',
    category: 'Testing',
    version: 'V1.9.4',
    tags: ['API Testing', 'Automation', 'Performance', 'Quality Assurance'],
    description: 'Automated API testing and performance monitoring tool',
    chatUsage: { current: 34, total: 100 },
    isActive: true,
    icon: '🧪',
  },
  {
    id: 8,
    title: 'Database Manager',
    publisher: 'DataBase Pro',
    category: 'Database',
    version: 'V2.7.2',
    tags: ['Database', 'SQL', 'Optimization', 'Migration'],
    description: 'Database management and optimization assistant',
    chatUsage: { current: 56, total: 100 },
    isActive: true,
    icon: '🗄️',
  },
  {
    id: 9,
    title: 'Cloud Deployer',
    publisher: 'CloudOps',
    category: 'DevOps',
    version: 'V1.6.8',
    tags: ['Cloud', 'Deployment', 'AWS', 'Docker'],
    description: 'Automated cloud deployment and infrastructure management',
    chatUsage: { current: 78, total: 100 },
    isActive: false,
    icon: '☁️',
  },
  {
    id: 10,
    title: 'Mobile Developer',
    publisher: 'MobileFirst',
    category: 'Mobile',
    version: 'V2.1.5',
    tags: ['React Native', 'iOS', 'Android', 'Cross-platform'],
    description: 'Mobile app development and cross-platform solutions',
    chatUsage: { current: 41, total: 100 },
    isActive: true,
    icon: '📱',
  },
  {
    id: 11,
    title: 'AI Trainer',
    publisher: 'ML Solutions',
    category: 'Machine Learning',
    version: 'V3.0.1',
    tags: ['Machine Learning', 'Training', 'Models', 'Neural Networks'],
    description: 'AI model training and machine learning assistant',
    chatUsage: { current: 92, total: 100 },
    isActive: true,
    icon: '🤖',
  },
  {
    id: 12,
    title: 'Blockchain Dev',
    publisher: 'CryptoLabs',
    category: 'Blockchain',
    version: 'V1.4.7',
    tags: ['Blockchain', 'Smart Contracts', 'Web3', 'Ethereum'],
    description: 'Blockchain development and smart contract assistant',
    chatUsage: { current: 28, total: 100 },
    isActive: false,
    icon: '⛓️',
  },
];

// Agent Card Component
function AgentCard({ agent }: { agent: (typeof agentsData)[0] }) {
  return (
    <div className="bg-white rounded-lg border border-[#272727]/5 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-lg">
            {agent.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-[#272727] font-semibold text-base">
              {agent.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-[#272727]/60">
                By {agent.publisher}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-500 font-medium">
                  {agent.category}
                </span>
              </div>
            </div>
          </div>
        </div>
        <MoreVertical className="w-4 h-4 text-[#272727]/40" />
      </div>

      {/* Version and Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 bg-[#272727]/5 text-xs text-[#272727]/70 rounded-full">
          {agent.version}
        </span>
        {agent.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-[#272727]/5 text-xs text-[#272727]/70 rounded-full"
          >
            {tag}
          </span>
        ))}
        {agent.tags.length > 3 && (
          <span className="px-2 py-1 bg-[#272727]/5 text-xs text-[#272727]/70 rounded-full">
            +{agent.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#272727]/70 leading-relaxed">
        {agent.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#272727]/60">Chat Usage</span>
            <span className="text-xs text-green-500 font-medium">
              {agent.chatUsage.current}/{agent.chatUsage.total}
            </span>
          </div>
          <Progress
            value={(agent.chatUsage.current / agent.chatUsage.total) * 100}
            className="h-2"
          />
        </div>
        <div className="flex items-center space-x-4 ml-6">
          <div className="flex items-center space-x-2">
            <Switch checked={agent.isActive} />
            <span className="text-sm text-[#272727]">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagermentSection() {
  return (
    <div className="space-y-4">
      {/*Header Bar*/}
      <div className="text-[#272727] text-body-b1">Managerment</div>
      <div className="flex items-center justify-between">
        <div>
          <Tabs defaultValue="discover" className="w-full bg-white">
            <TabsList className="bg-white border border-[#272727]/5">
              <TabsTrigger
                value="discover"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                Installed
              </TabsTrigger>
              <TabsTrigger
                value="2d"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                AI dApps
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative w-80 mx-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#272727]" />
            <Input
              placeholder="Search all AI agents"
              className="w-full h-6.5 px-2 py-1.5 pl-8 bg-gray-100 border-0 rounded-lg text-xs placeholder:text-[#272727]/50"
            />
          </div>
          <Button size={'l'}>
            <AddPlusSquare />
            Install Agent
          </Button>
        </div>
      </div>

      {/*Agent Card*/}
      <div className="space-y-3">
        <div className="text-sm font-medium leading-3.5 text-[#272727]">
          Agents
        </div>
        {/* Agent Card List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentsData.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
