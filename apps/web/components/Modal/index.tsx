"use client";

import { Modal as MantineModal, ModalProps } from "@mantine/core";

export default function Modal({
  opened,
  children,
  onClose,
  ...props
}: ModalProps) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      className="text-dark"
      {...props}
      size="auto"
    >
      {children}
    </MantineModal>
  );
}
