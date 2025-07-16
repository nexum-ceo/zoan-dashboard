import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Download, Edit, FileDown, List, Plus, Trash } from 'lucide-react';

export default function Workflow() {
  return (
    <div className="flex flex-col gap-4 w-full h-full p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="text-lg font-medium flex flex-row gap-2 items-center">
            <List />
            Flow list
          </div>
          <div className="text-sm text-muted-foreground flex flex-row gap-2">
            <Button variant="outline">
              <Download /> Import FAQs
            </Button>
            <Button variant="outline">
              <Plus /> Add New Workflow
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Publish Version</TableHead>
                <TableHead>Trigger Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Workflow 1</TableCell>
                <TableCell>1.0.0</TableCell>
                <TableCell>Trigger Condition</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-600 dark:bg-green-600"
                  >
                    Published
                  </Badge>
                </TableCell>
                <TableCell>2021-01-01</TableCell>
                <TableCell>
                  <Button variant="ghost">
                    <FileDown />
                  </Button>
                  <Button variant="ghost">
                    <Edit />
                  </Button>
                  <Button variant="ghost">
                    <Trash color="red" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
