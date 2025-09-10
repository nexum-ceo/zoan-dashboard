import { FC } from 'react';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

export const PlaceholderImage: FC<PlaceholderImageProps> = ({
  width = 300,
  height = 200,
  className = '',
  children,
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      {children || (
        <div className="text-gray-400 text-sm">
          {width}x{height}
        </div>
      )}
    </div>
  );
};

export default PlaceholderImage;
