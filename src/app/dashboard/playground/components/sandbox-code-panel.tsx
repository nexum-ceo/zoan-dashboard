'use client';

import {
  SandboxCodeEditor,
  SandboxFileExplorer,
  SandboxLayout,
  SandboxProvider,
} from '@/components/ui/shadcn-io/sandbox';
import { useSandpack } from '@codesandbox/sandpack-react';
import { ChevronRight } from 'lucide-react';
import { FC } from 'react';

export type SandboxCodePanelProps = {
  files: Parameters<typeof SandboxProvider>[0]['files'];
  template?: Parameters<typeof SandboxProvider>[0]['template'];
  theme?: Parameters<typeof SandboxProvider>[0]['theme'];
  className?: string;
  activeView?: 'code' | 'view';
  activeFile?: string;
  minioUrl?: string;
  gameUrl?: string;
};

const SandpackBreadcrumb: FC = () => {
  const { sandpack } = useSandpack();
  const activePath = sandpack?.activeFile || '/App/page.tsx';
  const parts = activePath.replace(/^\//, '').split('/');
  const root = parts[0] || 'App';
  const file = parts.slice(1).join('/') || 'page.tsx';
  return (
    <div className="pt-2 bg-white text-paragraph flex items-center gap-1">
      <span className="font-medium !text-[#272727]/50">{root}</span>
      <ChevronRight className="w-4 h-4 stroke-[#272727]/50" />
      <span className="font-medium">{file}</span>
    </div>
  );
};

export const SandboxCodePanel: FC<SandboxCodePanelProps> = ({
  files,
  template = 'react',
  theme = 'light',
  className,
  activeView = 'code',
  activeFile,
  minioUrl,
  gameUrl,
}) => {
  // Construct the iframe URL for preview mode
  const iframeUrl =
    minioUrl && gameUrl ? `${minioUrl}${gameUrl}/index.html` : '';

  return (
    <div className={'flex-1 h-full ' + (className || '')}>
      {activeView === 'code' ? (
        <SandboxProvider
          template={template}
          files={files}
          theme={theme}
          className="h-full border-none"
          options={{ activeFile }}
        >
          <div className="flex gap-1 h-full">
            <div className=" bg-white overflow-hidden h-full">
              <div className="h-full">
                <SandboxLayout className="!h-full">
                  <SandboxFileExplorer className="!border-none !h-full" />
                </SandboxLayout>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white flex flex-col h-full">
              <SandpackBreadcrumb />
              <SandboxLayout className="!h-full">
                <SandboxCodeEditor showTabs={false} showLineNumbers={true} />
              </SandboxLayout>
            </div>
          </div>
        </SandboxProvider>
      ) : (
        <div className="h-full w-full px-10 bg-white">
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              title="Game Preview"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No preview available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SandboxCodePanel;
