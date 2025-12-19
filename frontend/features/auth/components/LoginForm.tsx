"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "../types/auth";
import { useLogin } from "../hooks/useAuth";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { Loader } from "lucide-react";

export default function LoginForm() {
    const t = useTranslations("auth");
    const tErrors = useTranslations("auth.errors");
    const router = useRouter();
    const { mutate: login, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        login(
            { email: data.email, password: data.password },
            {
                onSuccess: async () => {
                    showSuccessToast(t("loginSuccess"));
                    router.push("/dashboard");
                },
                onError: (error: any) => {
                    showErrorToast(tErrors("invalidCredentials"));
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            {t("welcomeBack")}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t("login")}
                        </p>
                    </div>

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
                                <Link href="#" className="text-sm text-primary hover:text-primary/80">
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
                            disabled={isPending}
                            className="w-full h-11 flex items-center gap-1 bg-primary cursor-pointer hover:opacity-80 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {t("signIn")}  {isPending && <Loader className="animate-spin" />}
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
                            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                                {t("signUp")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
