import AppNavbar from '@/components/app-navbar';

export default function ZoanBaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  );
}
