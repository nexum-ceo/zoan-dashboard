import { BaseHandle } from '@/components/base-handle';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/base-node';
import { Button } from '@/components/ui/button';
import { Position } from '@xyflow/react';
import { Rocket } from 'lucide-react';
import { memo } from 'react';

type NodeData = {
  label: string;
  type: string;
  config: Record<string, unknown>;
};

const BaseHandleCustom = memo(
  ({ data, id }: { data?: NodeData; id?: string }) => {
    return (
      <BaseNode className="w-96 relative">
        <BaseHandle
          type="source"
          position={Position.Right}
          id={id ? `${id}-source` : undefined}
          style={{
            position: 'absolute',
            top: '50%',
            right: -6,
            zIndex: 20,
            transform: 'translateY(-50%)',
          }}
        />
        <BaseHandle
          type="target"
          position={Position.Left}
          id={id ? `${id}-target` : undefined}
          style={{
            position: 'absolute',
            top: '50%',
            left: -6,
            zIndex: 20,
            transform: 'translateY(-50%)',
          }}
        />
        <BaseNodeHeader className="border-b">
          <Rocket className="size-4" />
          <BaseNodeHeaderTitle>{data?.label ?? 'Header'}</BaseNodeHeaderTitle>
        </BaseNodeHeader>
        <BaseNodeContent>
          <div className="mb-2">
            <span className="font-semibold">Type:</span> {data?.type}
          </div>
          {data?.config && (
            <div className="text-xs">
              <span className="font-semibold">Config:</span>
              <ul className="list-disc ml-4">
                {Object.entries(data.config).map(([key, value]) => (
                  <li key={key}>
                    <span className="font-bold">{key}:</span> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </BaseNodeContent>
        <BaseNodeFooter>
          <Button variant="outline" className="nodrag w-full">
            Action
          </Button>
        </BaseNodeFooter>
      </BaseNode>
    );
  },
);
BaseHandleCustom.displayName = 'BaseHandleCustom';

export default BaseHandleCustom;
