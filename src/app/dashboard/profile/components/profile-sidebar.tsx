'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useUserQuery } from '@/contexts/UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Github from '../../../../../public/icon/github';
import Globe from '../../../../../public/icon/globe';
import MapPin from '../../../../../public/icon/map-pin';
import X from '../../../../../public/icon/x';

export default function ProfileSidebar() {
  const [editing, setEditing] = useState(false);
  const { userProfile } = useUserQuery();
  if (!userProfile) return null;
  const emailLocal = userProfile.email?.split('@')[0] || '';
  const displayName = userProfile.name || userProfile.email || emailLocal;
  const displayUsername = userProfile.username || emailLocal;

  return (
    <aside className="bg-white w-full">
      <AnimatePresence initial={false} mode="wait">
        {!editing ? (
          <motion.div
            key="summary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden p-1"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
              <div>
                <div className="text-[#272727] text-sm font-medium">
                  {userProfile.email || 'loading'}
                </div>
                <div className="text-[10px] text-[#272727]/50">
                  @{displayUsername}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="my-4 flex justify-between text-[16px] text-[#272727]/50 leading-4 font-medium">
              Total prompts
              <span className="text-[#272727] font-medium">
                {/* TODO: udpate total prompts in the future */}
                10
              </span>
            </div>
            <div className="space-y-1">
              <Button className="w-full" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
              <Button variant={'secondary'} className="w-full">
                Set profile to private
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-4 p-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">Display name</Label>
                <Input
                  placeholder="Display name"
                  defaultValue={displayName}
                  className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">UserName</Label>
                <Input
                  placeholder="Username"
                  defaultValue={displayUsername}
                  className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">Bio</Label>
                <Textarea
                  placeholder="Bio"
                  defaultValue={displayUsername}
                  className="w-full min-h-30 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">Socials</Label>
                <div className="space-y-2">
                  <div className="relative w-full">
                    <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="Location"
                      defaultValue={userProfile.username}
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <X className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="X"
                      defaultValue={userProfile.username}
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <Github className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="Github"
                      defaultValue={
                        userProfile.social_link?.find(
                          (s) => s.type === 'github',
                        )?.url ?? ''
                      }
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="Website"
                      defaultValue={
                        userProfile.social_link?.find(
                          (s) => s.type === 'website',
                        )?.url ?? ''
                      }
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <Button className="w-full ">Save changes</Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
              <Separator className="my-5" />

              <div className="my-4 flex justify-between text-[16px] text-[#272727]/50 leading-4 font-medium">
                Total prompts
                <span className="text-[#272727] font-medium">0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
