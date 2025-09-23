import type { SandboxFiles } from '@/lib/sandbox-utils';

/**
 * Create and download a ZIP from in-memory sandbox files
 */
export async function downloadSandboxZip(
  files: SandboxFiles,
  zipName: string = 'project.zip',
): Promise<void> {
  const { default: JSZip } = await import('jszip');

  const zip = new JSZip();

  Object.entries(files).forEach(([path, file]) => {
    const normalized = path.startsWith('/') ? path.slice(1) : path;
    if (!normalized) return;
    zip.file(normalized, file.code ?? '');
  });

  const blob = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
