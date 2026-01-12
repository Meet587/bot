"use client";

import { useActionState } from "react";
import { sendResetLink } from "./actions";
import Link from "next/link";

const initialState = {
    error: null as string | null,
    success: null as string | null,
};

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await sendResetLink(formData);
        if (result?.error) {
            return { error: result.error, success: null };
        }
        if (result?.success) {
            return { error: null, success: result.success };
        }
        return { error: null, success: null };
    }, initialState);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {state.error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {state.error}
                    </div>
                )}

                {state.success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                        {state.success}
                    </div>
                )}

                <form action={formAction} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email-address" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Email address"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                        >
                            {isPending ? "Sending..." : "Send reset link"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
