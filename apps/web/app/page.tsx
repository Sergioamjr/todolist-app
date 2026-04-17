"use client";

import { useState, useEffect } from "react";
import { Text, Button as MantineButton, Group } from "@mantine/core";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import Task from "@/components/Task";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import TaskForm from "@/components/TaskForm";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useGetItems, getItemsQueryKey } from "@/src/gen/hooks/useGetItems";
import { usePutItemsById } from "@/src/gen/hooks/usePutItemsById";
import { useDeleteItemsById } from "@/src/gen/hooks/useDeleteItemsById";

type Item = {
  id: number;
  name: string;
  description: string;
  priority: number;
  completed: boolean;
  featured: boolean;
  tags: string | null;
  createdAt: string;
};

type EditItem = {
  id: number;
  name: string;
  description: string;
  priority: number;
  completed: boolean;
  featured: boolean;
  tags: string;
};

export default function DashboardPage() {
  const [opened, setOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<EditItem | null>(null);
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { data, isLoading, isError } = useGetItems();
  const queryClient = useQueryClient();

  const { mutate: toggleItem } = usePutItemsById({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getItemsQueryKey() }),
    },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemsById();

  function handleDeleteConfirm() {
    if (deleteId === null) return;
    deleteItem(
      { id: String(deleteId) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
          setDeleteId(null);
        },
      },
    );
  }

  const items: Item[] = (Array.isArray(data) ? (data as Item[]) : [])
    .slice()
    .sort((a, b) => {
      const aC = Number(a.completed);
      const bC = Number(b.completed);
      if (aC !== bC) return aC - bC;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  useEffect(() => {
    if (!isSessionPending && session) {
      router.replace("/");
    }
  }, [isSessionPending, session, router]);

  return (
    <AppLayout>
      <div className="flex items-center gap-4 mb-4 justify-between">
        <Button onClick={() => setOpened(true)}>New</Button>
      </div>

      <Modal opened={opened} onClose={() => setOpened(false)}>
        <TaskForm onSuccess={() => setOpened(false)} />
      </Modal>

      <Modal
        opened={editItem !== null}
        onClose={() => setEditItem(null)}
        title="Edit task"
      >
        <TaskForm
          itemId={editItem?.id}
          initialValues={editItem ?? undefined}
          onSuccess={() => setEditItem(null)}
        />
      </Modal>

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete task"
      >
        <Text size="sm">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </Text>
        <Group justify="flex-end" mt="md">
          <MantineButton variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </MantineButton>
          <MantineButton
            color="red"
            onClick={handleDeleteConfirm}
            loading={isDeleting}
          >
            Delete
          </MantineButton>
        </Group>
      </Modal>

      {isLoading && <Text>Loading...</Text>}
      {isError && <Text c="red">Failed to load items.</Text>}
      {!isLoading && !isError && items.length === 0 && (
        <Text className="text-center text-accent!">
          No tasks found. Create your first task!!!!
        </Text>
      )}

      <motion.div layout className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <Task
                name={item.name}
                description={item.description}
                completed={item.completed}
                createdAt={item.createdAt}
                priority={item.priority}
                onToggle={(completed) =>
                  toggleItem({
                    id: String(item.id),
                    data: { name: item.name, completed },
                  })
                }
                onEdit={() =>
                  setEditItem({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    priority: item.priority,
                    completed: item.completed,
                    featured: item.featured,
                    tags: item.tags ?? "",
                  })
                }
                onDelete={() => setDeleteId(item.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
