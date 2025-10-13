'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useUserQuery } from '@/contexts/UserContext';
import { UserProfileUpdateSchema, UserProfileUpdateType } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Github from '../../../../../public/icon/github';
import Globe from '../../../../../public/icon/globe';
import MapPin from '../../../../../public/icon/map-pin';
import X from '../../../../../public/icon/x';

export default function ProfileSidebar() {
  const [editing, setEditing] = useState(false);
  const { userProfile } = useUserQuery();

  const emailLocal = userProfile?.email?.split('@')[0] || '';
  const displayUsername = userProfile?.username || emailLocal;

  const form = useForm<UserProfileUpdateType>({
    resolver: zodResolver(UserProfileUpdateSchema),
    defaultValues: {
      name: userProfile?.name || '',
      username: userProfile?.username || '',
      social_link: userProfile?.social_link || [],
    },
  });

  useEffect(() => {
    if (!userProfile) return;
    form.reset({
      name: userProfile?.name || '',
      username: userProfile?.username || '',
      social_link: userProfile?.social_link || [],
    });
  }, [userProfile, form]);

  const socialLinks = form.watch('social_link');
  const socialLinksByType = useMemo(() => {
    const map: Record<string, string> = {};
    (socialLinks || []).forEach((s) => {
      map[s.type] = s.url;
    });
    return map;
  }, [socialLinks]);

  const setSocialLink = (type: string, url: string) => {
    const current = form.getValues('social_link') || [];
    const index = current.findIndex((s) => s.type === type);
    if (index >= 0) {
      const next = [...current];
      next[index] = { ...next[index], url };
      form.setValue('social_link', next, { shouldDirty: true });
    } else {
      form.setValue('social_link', [...current, { type, url }], {
        shouldDirty: true,
      });
    }
  };

  const onSubmit = () => {
    // TODO: Wire API update when endpoint is available
    // For now, just close editing view
    setEditing(false);
    // console.log('Submit profile', values);
  };

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
                  {userProfile?.email || 'loading'}
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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-4 p-1"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">Display name</Label>
                <Input
                  placeholder="Display name"
                  {...form.register('name')}
                  className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#272727]">UserName</Label>
                <Input
                  placeholder="Username"
                  {...form.register('username')}
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
                      value={socialLinksByType['location'] ?? ''}
                      onChange={(e) =>
                        setSocialLink('location', e.target.value)
                      }
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <X className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="X"
                      value={socialLinksByType['x'] ?? ''}
                      onChange={(e) => setSocialLink('x', e.target.value)}
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <Github className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="Github"
                      value={socialLinksByType['github'] ?? ''}
                      onChange={(e) => setSocialLink('github', e.target.value)}
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>

                  <div className="relative w-full">
                    <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                    <Input
                      placeholder="Website"
                      value={socialLinksByType['website'] ?? ''}
                      onChange={(e) => setSocialLink('website', e.target.value)}
                      className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <Button type="submit" className="w-full ">
                  Save changes
                </Button>
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
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
