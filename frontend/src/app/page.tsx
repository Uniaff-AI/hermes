import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Hermes CRM
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Modular CRM system with Next.js frontend and NestJS backend
        </p>
        <div className="space-x-4">
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 