'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useUserQuery } from '@/contexts/UserContext';
import { handleErrorApi } from '@/lib/utils';
import {
  useCheckUsernameExistsMutation,
  useUpdateUserProfileMutation,
} from '@/queries/useUser';
import { UserProfileUpdateSchema, UserProfileUpdateType } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Github from '../../../../../public/icon/github';
import Globe from '../../../../../public/icon/globe';
import MapPin from '../../../../../public/icon/map-pin';
import X from '../../../../../public/icon/x';

export default function ProfileSidebar() {
  const [editing, setEditing] = useState(false);
  const { userProfile } = useUserQuery();
  const updateUserProfile = useUpdateUserProfileMutation();
  const checkUsernameExistsMutation = useCheckUsernameExistsMutation();

  const emailLocal = userProfile?.email?.split('@')[0] || '';
  const displayUsername = userProfile?.username || emailLocal;
  const normalizeSocialLinks = (
    links: { type: string; url: string }[] | undefined,
  ) => {
    const desiredOrder = ['x', 'github', 'website'];
    const map = new Map((links || []).map((l) => [l.type, l.url]));
    return desiredOrder.map((t) => ({ type: t, url: map.get(t) ?? '' }));
  };

  const form = useForm<UserProfileUpdateType>({
    resolver: zodResolver(UserProfileUpdateSchema),
    defaultValues: {
      name: '',
      username: '',
      location: '',
      social_link: normalizeSocialLinks([]),
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: emailLocal || '',
        username: userProfile.username || '',
        location: userProfile.location || '',
        social_link: normalizeSocialLinks(userProfile.social_link),
      });
    }
  }, [userProfile, form, emailLocal]);

  const socialLinks = form.watch('social_link');

  const onSubmit = async () => {
    const values = form.getValues();
    if (!userProfile?.id) return;
    if (updateUserProfile.isPending) return;

    // Filter out empty social links to avoid unnecessary validation
    const filteredSocialLinks =
      values.social_link?.filter(
        (link) => link.url && link.url.trim() !== '',
      ) || [];

    const payload = {
      ...values,
      social_link: filteredSocialLinks,
    };

    try {
      await updateUserProfile.mutateAsync({
        userId: userProfile.id,
        body: payload,
      });
      setEditing(false);
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleCancel = () => {
    setEditing(false);
    form.reset();
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-1 space-y-4 p-1"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-[#272727]">
                        Display name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Display name"
                          className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-[#272727]">
                        UserName
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Username"
                          className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                          {...field}
                          onBlur={async (e) => {
                            field.onBlur();
                            // run schema validation for username immediately on blur
                            await form.trigger('username');
                            const value = e.target.value.trim();
                            if (
                              !value ||
                              value === (userProfile?.username || '')
                            )
                              return;
                            try {
                              const exists =
                                await checkUsernameExistsMutation.mutateAsync(
                                  value,
                                );
                              if (exists) {
                                form.setError('username', {
                                  type: 'validate',
                                  message: 'Username already exists',
                                });
                              } else {
                                form.clearErrors('username');
                              }
                            } catch {
                              // ignore network errors for blur validation
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-1">
                  <Label className="text-sm text-[#272727]">Location</Label>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full">
                        <InputGroup className="bg-gray-100">
                          <InputGroupAddon>
                            <MapPin className="w-3.5 h-3.5 text-[#272727]" />
                          </InputGroupAddon>
                          <FormControl>
                            <InputGroupInput
                              {...field}
                              aria-invalid={!!fieldState.error}
                              placeholder={'Location'}
                              className="text-sm"
                            />
                          </FormControl>
                        </InputGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-[#272727]">Bio</Label>
                  <Textarea
                    placeholder="Bio"
                    className="w-full min-h-30 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-[#272727]">Socials</Label>
                  <div className="space-y-2">
                    {socialLinks?.map((entry, index) => (
                      <div key={entry.type}>
                        <input
                          type="hidden"
                          {...form.register(
                            `social_link.${index}.type` as const,
                          )}
                          defaultValue={entry.type}
                        />

                        <FormField
                          control={form.control}
                          name={`social_link.${index}.url` as const}
                          render={({ field, fieldState }) => (
                            <FormItem className="w-full">
                              <InputGroup className="bg-gray-100">
                                <InputGroupAddon>
                                  {entry.type === 'x' && (
                                    <X className="w-3.5 h-3.5 text-[#272727]" />
                                  )}
                                  {entry.type === 'github' && (
                                    <Github className="w-3.5 h-3.5 text-[#272727]" />
                                  )}
                                  {entry.type === 'website' && (
                                    <Globe className="w-3.5 h-3.5 text-[#272727]" />
                                  )}
                                </InputGroupAddon>
                                <FormControl>
                                  <InputGroupInput
                                    {...field}
                                    aria-invalid={!!fieldState.error}
                                    placeholder={
                                      entry.type === 'x'
                                        ? 'X'
                                        : entry.type === 'github'
                                        ? 'Github'
                                        : 'Website'
                                    }
                                    className="text-sm"
                                  />
                                </FormControl>
                              </InputGroup>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <Button type="submit" className="w-full ">
                    Save changes
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleCancel}
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
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
