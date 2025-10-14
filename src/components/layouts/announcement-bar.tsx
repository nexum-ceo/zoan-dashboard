import StarIcon from '../../../public/icon/star';

export function AnnouncementBar() {
  return (
    <div className="bg-primary-brand-green p-3 text-center text-xs flex items-center justify-center gap-2">
      <StarIcon />
      <div className="font-medium">
        <span className="font-semibold underline">Subscription!</span> So you
        can make your vision become to life
      </div>
    </div>
  );
}
