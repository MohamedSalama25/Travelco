"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-gray-900 group-[.toaster]:text-white group-[.toaster]:border-gray-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-400",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-gray-800 group-[.toast]:text-gray-300",
          success: "group-[.toast]:bg-green-900 group-[.toast]:text-green-100 group-[.toast]:border-green-800",
          error: "group-[.toast]:bg-red-900 group-[.toast]:text-red-100 group-[.toast]:border-red-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

