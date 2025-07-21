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
import { useState } from 'react';
// Dynamic import để tránh lỗi SSR với ReactFlow
const Flow = dynamic(() => import('./Flow'), { ssr: false });

export default function Workflow() {
  const [showFlow, setShowFlow] = useState(false);
  const handleFlowClick = () => {
    setShowFlow(true);
  };
  const handleCloseFlow = () => {
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
              <TableRow onClick={handleFlowClick} style={{ cursor: 'pointer' }}>
                <TableCell className="hover:bg-gray-100">Workflow 1</TableCell>
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

      {/* Popup full màn hình hiển thị Flow */}
      {showFlow && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100vw',
              height: '100vh',
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              onClick={handleCloseFlow}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Đóng"
            >
              <X size={24} />
            </button>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Flow />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
