"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConfirmationStore } from "@/store/confirmationStore";
import { useTranslations } from "next-intl";

export function ConfirmationDialog() {
  const t = useTranslations("general");
  const { isOpen, title, description, onConfirm, hide, icon } = useConfirmationStore();

  const handleConfirm = () => {
    onConfirm();
    hide();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={hide}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-col items-center text-center">
          {icon}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t("confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}