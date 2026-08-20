import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for might have been removed or does not exist.</p>
      <Link href="/" className="btn-primary">
        <span>Back to Home</span>
      </Link>
    </div>
  );
}
