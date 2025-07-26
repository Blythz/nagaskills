import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div className="flex items-center">
        <Link href="/">
          <a className="text-lg font-bold">Nagaland Freelance</a>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/jobs">
          <a className="text-gray-600 hover:text-gray-900">Jobs</a>
        </Link>
        <Link href="/professionals">
          <a className="text-gray-600 hover:text-gray-900">Professionals</a>
        </Link>
        <Link href="/post-job">
          <a className="text-gray-600 hover:text-gray-900">Post a Job</a>
        </Link>
        <Link href="/signin">
          <a className="text-gray-600 hover:text-gray-900">Sign In</a>
        </Link>
      </div>
    </nav>
  );
}
