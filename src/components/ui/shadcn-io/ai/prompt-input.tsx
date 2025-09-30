'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getMediaTypeFromFilename } from '@/lib/s3';
import { cn } from '@/lib/utils';
import type { ChatStatus } from 'ai';
import {
  Archive,
  File,
  FileText,
  Image,
  Loader2Icon,
  Music,
  SquareIcon,
  Video,
  XIcon,
} from 'lucide-react';
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEventHandler,
} from 'react';
import { Children } from 'react';
import ChevronRightDuo from '../../../../../public/icon/chevron-right-duo';

// File preview utilities
const getFileIcon = (file: File) => {
  const mediaType = getMediaTypeFromFilename(file.name);

  switch (mediaType) {
    case 'image':
      return <Image className="w-3 h-3" />;
    case 'audio':
      return <Music className="w-3 h-3" />;
    case 'video':
      return <Video className="w-3 h-3" />;
    case 'archive':
      return <Archive className="w-3 h-3" />;
    case 'document':
      return <FileText className="w-3 h-3" />;
    default:
      return <File className="w-3 h-3" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File preview component
interface FilePreviewProps {
  file: File;
  url?: string;
  onRemove?: () => void;
}

const FilePreview = ({ file, url, onRemove }: FilePreviewProps) => {
  const mediaType = getMediaTypeFromFilename(file.name);
  const isImage = mediaType === 'image';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 max-w-xs hover:bg-gray-200 transition-colors">
      {/* File Icon or Image Preview */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {isImage && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={file.name}
            className="w-5 h-5 rounded object-cover"
          />
        ) : (
          getFileIcon(file)
        )}
      </div>

      {/* File Name */}
      <span className="truncate flex-1 min-w-0 font-medium">{file.name}</span>

      {/* File Size */}
      <span className="text-gray-500 text-xs">{formatFileSize(file.size)}</span>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
        >
          <XIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export type PromptInputProps = HTMLAttributes<HTMLFormElement> & {
  attachedFiles?: Array<{
    id: string;
    file: File;
    url?: string;
    onRemove?: (id: string) => void;
  }>;
  children?: React.ReactNode;
};

export const PromptInput = ({
  className,
  attachedFiles,
  children,
  ...props
}: PromptInputProps) => (
  <form
    className={cn(
      'w-full overflow-hidden rounded-xl bg-background shadow-sm',
      className,
    )}
    {...props}
  >
    {/* Attached Files Preview */}
    {attachedFiles && attachedFiles.length > 0 && (
      <div className="flex flex-wrap gap-2 px-2 py-1.5">
        {attachedFiles.map((attachedFile) => (
          <FilePreview
            key={attachedFile.id}
            file={attachedFile.file}
            url={attachedFile.url}
            onRemove={() => attachedFile.onRemove?.(attachedFile.id)}
          />
        ))}
      </div>
    )}
    {/* Render children (PromptInputTextarea, PromptInputToolbar, etc.) */}
    {children}
  </form>
);

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
};

export const PromptInputTextarea = ({
  onChange,
  className,
  placeholder = 'What would you like to know?',
  disabled = false,
  // minHeight = 48,
  // maxHeight = 164,
  ...props
}: PromptInputTextareaProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Don't submit if disabled
      if (disabled) {
        e.preventDefault();
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Textarea
      className={cn(
        'w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0',
        'field-sizing-content max-h-[6lh] bg-transparent dark:bg-transparent',
        'focus-visible:ring-0',
        className,
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputToolbarProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputToolbar = ({
  className,
  ...props
}: PromptInputToolbarProps) => (
  <div
    className={cn('flex items-center justify-between p-1', className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn(
      'flex items-center gap-1',
      '[&_button:first-child]:rounded-bl-xl',
      className,
    )}
    {...props}
  />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({
  variant = 'ghost',
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    size ?? Children.count(props.children) > 1 ? 'default' : 'icon';

  return (
    <Button
      className={cn(
        'shrink-0 gap-1.5 rounded-lg',
        variant === 'ghost' && 'text-muted-foreground',
        newSize === 'default' && 'px-3',
        className,
      )}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus;
};

export const PromptInputSubmit = ({
  className,
  variant = 'default',
  size = 'icon',
  status,
  children,
  ...props
}: PromptInputSubmitProps) => {
  let Icon = <ChevronRightDuo className="size-2" />;

  if (status === 'submitted') {
    Icon = <Loader2Icon className="size-4 animate-spin" />;
  } else if (status === 'streaming') {
    Icon = <SquareIcon className="size-4" />;
  } else if (status === 'error') {
    Icon = <XIcon className="size-4" />;
  }

  return (
    <Button
      className={cn('gap-1.5 rounded-lg', className)}
      size={size}
      type="submit"
      variant={variant}
      {...props}
    >
      {children ?? Icon}
    </Button>
  );
};

export type PromptInputModelSelectProps = ComponentProps<typeof Select>;

export const PromptInputModelSelect = (props: PromptInputModelSelectProps) => (
  <Select {...props} />
);

export type PromptInputModelSelectTriggerProps = ComponentProps<
  typeof SelectTrigger
>;

export const PromptInputModelSelectTrigger = ({
  className,
  ...props
}: PromptInputModelSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors',
      'hover:bg-accent hover:text-foreground [&[aria-expanded="true"]]:bg-accent [&[aria-expanded="true"]]:text-foreground',
      className,
    )}
    {...props}
  />
);

export type PromptInputModelSelectContentProps = ComponentProps<
  typeof SelectContent
>;

export const PromptInputModelSelectContent = ({
  className,
  ...props
}: PromptInputModelSelectContentProps) => (
  <SelectContent className={cn(className)} {...props} />
);

export type PromptInputModelSelectItemProps = ComponentProps<typeof SelectItem>;

export const PromptInputModelSelectItem = ({
  className,
  ...props
}: PromptInputModelSelectItemProps) => (
  <SelectItem className={cn(className)} {...props} />
);

export type PromptInputModelSelectValueProps = ComponentProps<
  typeof SelectValue
>;

export const PromptInputModelSelectValue = ({
  className,
  ...props
}: PromptInputModelSelectValueProps) => (
  <SelectValue className={cn(className)} {...props} />
);
