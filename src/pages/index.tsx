import { Login, loginSchema } from 'common/validation/auth';
import { getSession, signIn } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/router';


export default function IndexPage() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(async (data: Login) => {
    await signIn('credentials', { ...data, callbackUrl: '/dashboard' });
  }, []);

  useEffect(() => {
    const forwardLoggedInUser = async () => {
      const session = await getSession();
      if (session) {
        await router.push('/dashboard');
      } else {
        console.log('no session');
      }
      setLoading(false);
    };
    forwardLoggedInUser().catch(console.error);
  }, [router]);

  return loading ?
    (<>
      <main>
        <div className="flex items-center justify-center h-screen w-full">
          <div className="card w-96 bg-base-100 shadow">
            <div className="card-body">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      </main>
    </>
)
: (
  <>
    <main>
    <form
          className="flex items-center justify-center h-screen w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="card w-96 bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Welcome back!</h2>
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered w-full max-w-xs mt-2"
                {...register('username')}
              />
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered w-full max-w-xs my-2"
                {...register('password')}
              />
              <div className="card-actions items-center justify-between">
                <Link href="/signup" className="link">
                  Create account
                </Link>
                <button className="btn btn-secondary" type="submit">
                  Login
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
