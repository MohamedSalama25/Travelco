"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormData } from "../types/auth";
import { useRegister } from "../hooks/useAuth";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { Loader } from "lucide-react";

export default function RegisterForm() {
    const t = useTranslations("auth");
    const tErrors = useTranslations("auth.errors");
    const router = useRouter();
    const { mutate: registerUser, isPending } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        registerUser(
            {
                user_name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password
            },
            {
                onSuccess: async () => {
                    showSuccessToast(t("registerSuccess"));
                    // Wait a bit for cookie to be set
                    await new Promise(resolve => setTimeout(resolve, 500));
                    router.push("/dashboard");
                },
                onError: (error: any) => {
                    showErrorToast(
                        t("registerError"),
                        error?.response?.data?.message
                    );
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            {t("createAccount")}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t("register")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                {t("name")}
                            </Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder={t("name")}
                                className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {tErrors(errors.name.message as any)}
                                </p>
                            )}
                        </div>

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

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">
                                {t("phone", { defaultValue: "رقم الهاتف" })}
                            </Label>
                            <Input
                                id="phone"
                                type="text"
                                {...register("phone")}
                                placeholder={t("phone", { defaultValue: "رقم الهاتف" })}
                                className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">
                                    {tErrors(errors.phone.message as any)}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                {t("password")}
                            </Label>
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                {t("confirmPassword")}
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                placeholder={t("password")}
                                className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">
                                    {tErrors(errors.confirmPassword.message as any)}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-11 bg-primary flex items-center gap-1 cursor-pointer hover:opacity-80 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {t("signUp")} {isPending && <Loader className="animate-spin" />}
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

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t("haveAccount")}{" "}
                            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                                {t("signIn")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
