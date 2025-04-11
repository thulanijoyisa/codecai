import { Suspense } from 'react';
import AuthCallback from './AuthCallback';

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}

export default Page