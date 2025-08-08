import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Eye, Play, X } from 'lucide-react';
import { FC, useState } from 'react';

type ExploreProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const Explore: FC<ExploreProps> = ({ isOpen, onClose }) => {
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{
            type: 'tween',
            ease: [0.25, 0.1, 0.25, 1],
            duration: 0.3,
          }}
          className="w-96 border-l border-gray-200 bg-white flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Explore</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Game Title */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Flappy Bird Game
              </h3>
              <p className="text-sm text-gray-600">
                Your generated game is ready to play!
              </p>
            </div>

            {/* Game Version Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Game Version
              </label>
              <Select defaultValue="version-1.0">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="version-1.0">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Version 1.0</span>
                      <span className="text-xs text-gray-500">
                        5 minutes ago • Initial Flappy Bird game
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Game Preview Card */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl p-6 text-center space-y-4">
              {/* Game Icon */}
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Game Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Flappy Bird
                </h4>
                <p className="text-sm text-gray-600 mb-3">Version 1.0</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Navigate the bird through pipes by clicking or pressing
                  spacebar
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Dialog
                  open={isGameModalOpen}
                  onOpenChange={setIsGameModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Play Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-full h-[95vh] p-0">
                    <div className="w-full h-full p-4">
                      <div className="h-3"></div>
                      <iframe
                        src="https://minio.buymed.site/builds/truck_town/index.html"
                        className="w-full h-full border-0 rounded"
                        title="Truck Town Game"
                        allowFullScreen
                      />
                      <div className="h-4"></div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View Code
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Version Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Version Details</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Initial Flappy Bird game
                </p>
                <p className="text-sm text-gray-500">Generated 5 minutes ago</p>
              </div>
            </div>

            {/* Additional Games Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">More Games</h4>
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-green-600 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Snake Game</h5>
                      <p className="text-xs text-gray-500">
                        Classic snake game
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Pong Game</h5>
                      <p className="text-xs text-gray-500">Retro ping pong</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-yellow-600 rounded-lg"></div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Tetris</h5>
                      <p className="text-xs text-gray-500">Block puzzle game</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
