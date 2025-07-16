import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Trainning() {
  return (
    <div className="flex flex-col gap-4 w-full h-full p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="text-lg font-medium">FAQ(0)</div>
          <div className="text-sm text-muted-foreground flex flex-row gap-2">
            <Button>
              <Plus /> Import FAQs
            </Button>
            <Button>
              <Plus /> Add FAQs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
