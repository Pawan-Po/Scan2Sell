import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/inventory');
  return null; // redirect will prevent this from rendering
}
