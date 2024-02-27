/**
 * A simple navbar component using daisyui
 */
import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  // noinspection HtmlUnknownTarget
  return (
    <div className="container mx-auto my-5 px-2">
      <nav className="navbar bg-base-100 shadow-xl rounded-box">
        <div className="navbar-start">
          <Link href="/dashboard">
            <span className="btn">Home</span>
          </Link>
        </div>
        <div className="navbar-end">
          {session ? (
            <Link href="#" onClick={() => signOut()}>
              <button className="btn btn-ghost">Sign out</button>
            </Link>
          ) : ''
          }
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
