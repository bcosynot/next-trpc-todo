import type { NextPage } from "next";
import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { trpc } from '../utils/trpc';
import { Login, loginSchema } from '../common/validation/auth';

const SignUp: NextPage = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<Login>({
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync } = trpc.signup.signup.useMutation();

  const onSubmit = useCallback(
    async (data: Login) => {
      const result = await mutateAsync(data);
      if (result.status === 201) {
        await router.push("/");
      }
    },
    [mutateAsync, router]
  );

  return (
    <main>
      <form
        className="flex items-center justify-center h-screen w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="card w-96 bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Create an account!</h2>
            <input
              type="text"
              placeholder="Type your username..."
              className="input input-bordered w-full max-w-xs my-2"
              {...register('username')}
            />
            <input
              type="password"
              placeholder="Type your password..."
              className="input input-bordered w-full max-w-xs my-2"
              {...register('password')}
            />
            <div className="card-actions items-center justify-between">
              <button className="btn btn-secondary" type="submit">
                Sign Up
              </button>
              <Link href="/" className="link">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default SignUp;
