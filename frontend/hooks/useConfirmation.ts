import { useConfirmationStore } from "@/store/confirmationStore";
import { ReactNode } from "react";

export const useConfirmation = () => {
  const { show } = useConfirmationStore();

  const confirm = (title: string, description: string, icon?: ReactNode) => {
    return new Promise<boolean>((resolve) => {
      show(title, description, () => resolve(true), icon);
      // The hide function in the store will be called on cancel, which we can use to resolve false.
      // We need a way to subscribe to the hide event.
      const unsubscribe = useConfirmationStore.subscribe((state, prevState) => {
        if (!state.isOpen && prevState.isOpen) {
          resolve(false);
          unsubscribe();
        }
      });
    });
  };

  return confirm;
};