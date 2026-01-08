import Link from 'next/link';

export default function AuthCodeError() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Authentication Error
                </h1>
                <p className="text-slate-600 mb-6">
                    We couldn&apos;t verify your email. This can happen if:
                </p>

                {/* Reasons List */}
                <ul className="text-left text-slate-600 mb-8 space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>The confirmation link has expired (links are valid for 24 hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>The link has already been used</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>There was a network error during verification</span>
                    </li>
                </ul>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Try Signing In Again
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
