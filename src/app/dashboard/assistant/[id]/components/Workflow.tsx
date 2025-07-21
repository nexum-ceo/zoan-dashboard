'use client';
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

import { Download, Edit, FileDown, List, Plus, Trash, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
// Dynamic import
const Flow = dynamic(() => import('./Flow'), { ssr: false });

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Workflow() {
  const [showFlow, setShowFlow] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const FAKE_FLOW_ID = 'demo-flow-123';

  useEffect(() => {
    setLoading(true);
    fetch('/api/workflow')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWorkflows(data);
        else if (Array.isArray(data.data)) setWorkflows(data.data);
        else setWorkflows([]);
        setError(null);
      })
      .catch((err) => {
        setError('Lỗi khi lấy workflow');
        setWorkflows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFlowClick = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('flow_id', FAKE_FLOW_ID);
    router.replace(`${pathname}?${params.toString()}`);
    setShowFlow(true);
  };

  const handleCloseFlow = () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('flow_id');
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl);
    setShowFlow(false);
  };

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
          {loading ? (
            <div className="text-center py-8">Đang tải workflow...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
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
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Không có workflow nào
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((wf, idx) => (
                    <TableRow
                      key={wf.id || idx}
                      onClick={handleFlowClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className="hover:bg-gray-100">
                        {wf.name || 'No name'}
                      </TableCell>
                      <TableCell>{wf.publishVersion || '-'}</TableCell>
                      <TableCell>{wf.triggerCondition || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-600 dark:bg-green-600"
                        >
                          {wf.status || 'Published'}
                        </Badge>
                      </TableCell>
                      <TableCell>{wf.updatedAt || '-'}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Popup full màn hình hiển thị Flow */}
      {showFlow && (
        <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[2000] flex items-center justify-center">
          <div className="relative w-screen h-screen bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={handleCloseFlow}
              className="absolute top-4 right-4 z-10 bg-black/5 border-none rounded-lg p-2 cursor-pointer flex items-center justify-center"
              title="Đóng"
            >
              <X size={24} />
            </button>
            <div className="flex-1 min-h-0">
              <Flow onClose={handleCloseFlow} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
