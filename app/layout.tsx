import type { Metadata } from 'next';
import '../src/index.css';
export const metadata: Metadata = { title: 'SkillSwap — Exchange Skills, Not Money', description: 'A reciprocal peer-to-peer skill exchange community.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
