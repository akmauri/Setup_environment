import SignInButton from '@/components/auth/SignInButton';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm text-center">
        <h1 className="text-4xl font-bold mb-4">MPCAS2</h1>
        <p className="text-xl mb-8">Multi-Platform Content Automation System</p>
        <p className="mt-4 text-gray-600 mb-8">Development environment is set up and ready!</p>
        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
