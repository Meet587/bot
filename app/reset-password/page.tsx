"use client";

import { useActionState } from "react";
import { resetPassword } from "./actions";

const initialState = {
    error: null as string | null,
};

export default function ResetPasswordPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await resetPassword(formData);
        if (result?.error) {
            return { error: result.error };
        }
        return { error: null };
    }, initialState);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>

                {state.error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {state.error}
                    </div>
                )}

                <form action={formAction} className="mt-8 space-y-6">
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="New Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                        >
                            {isPending ? "Updating..." : "Update password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
