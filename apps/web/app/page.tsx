"use client";

import { useState, useEffect } from "react";
import { Text, Button as MantineButton, Group, Select } from "@mantine/core";
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
  const [filter, setFilter] = useState<string | null>(null);
  const [periodIndex, setPeriodIndex] = useState(0);
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  function getPeriodRange(index: number): { from: Date; to: Date } {
    const now = new Date();
    if (filter === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const from = new Date(startOfWeek);
      from.setDate(from.getDate() - index * 7);
      const to = new Date(from);
      to.setDate(to.getDate() + 7);
      return { from, to };
    }
    if (filter === "monthly") {
      const from = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - index + 1, 1);
      return { from, to };
    }
    // daily (default)
    const from = new Date(now);
    from.setDate(from.getDate() - index);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  function buildParams() {
    if (filter === "featured") return { featured: "true" };
    const { from, to } = getPeriodRange(periodIndex);
    return { createdAtFrom: from.toISOString(), createdAtTo: to.toISOString() };
  }

  const { data, isLoading, isError } = useGetItems(buildParams());
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
        <Select
          placeholder="All"
          clearable
          data={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "featured", label: "Featured" },
          ]}
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPeriodIndex(0);
          }}
          w={140}
        />
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

      {filter && filter !== "featured" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <MantineButton
              key={i}
              variant={periodIndex === i ? "filled" : "outline"}
              size="xs"
              onClick={() => setPeriodIndex(i)}
            >
              {getPeriodLabel(i)}
            </MantineButton>
          ))}
        </div>
      )}

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
