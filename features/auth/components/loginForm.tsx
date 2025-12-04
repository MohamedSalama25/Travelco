"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "../types/auth";
import { useAuth } from "../context/authContext";

export default function LoginForm() {
    const t = useTranslations("auth");
    const tErrors = useTranslations("auth.errors");
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError("");
        const success = await login(data.email, data.password);

        if (success) {
            router.push("/");
        } else {
            setError(tErrors("invalidCredentials"));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {t("welcomeBack")}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t("login")}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                {t("email")}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                placeholder={t("email")}
                                className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {tErrors(errors.email.message as any)}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    {t("password")}
                                </Label>
                                <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                    {t("forgotPassword")}
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                placeholder={t("password")}
                                className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {tErrors(errors.password.message as any)}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isSubmitting ? "..." : t("signIn")}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                {t("or", { defaultValue: "or" })}
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("noAccount")}{" "}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                {t("signUp")}
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-2">{t("demoCredentials", { defaultValue: "Demo Credentials" })}:</p>
                        <p>Admin: admin@example.com / admin123</p>
                        <p>User: user@example.com / user123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
