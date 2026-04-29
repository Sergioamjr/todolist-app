"use client";

import { useState } from "react";
import {
  Text,
  Button as MantineButton,
  Group,
  Select,
  ActionIcon,
} from "@mantine/core";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import Task from "@/components/Task";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import TaskForm from "@/components/TaskForm";
import { useServerSession } from "@/components/SessionProvider";
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
  const [anchorDate, setAnchorDate] = useState<Date>(() =>
    startOfDay(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    startOfDay(new Date()),
  );

  const session = useServerSession();

  function startOfDay(d: Date) {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  }
  function endOfDay(d: Date) {
    const n = new Date(d);
    n.setHours(23, 59, 59, 999);
    return n;
  }

  function getDayLabel(d: Date) {
    return d.toLocaleDateString("en", { day: "2-digit", month: "short" });
  }

  function goBack() {
    const d = new Date(anchorDate);
    d.setDate(d.getDate() - 1);
    setAnchorDate(d);
    setSelectedDate(d);
  }

  function goForward() {
    const todayStart = startOfDay(new Date());
    if (anchorDate >= todayStart) return;
    const d = new Date(anchorDate);
    d.setDate(d.getDate() + 1);
    setAnchorDate(d);
    setSelectedDate(d);
  }

  function getPeriodRange(date: Date): { from: Date; to: Date } {
    return { from: startOfDay(date), to: endOfDay(date) };
  }

  function buildParams() {
    if (filter === "featured") return { featured: "true" };
    if (filter === "weekly" || filter === "monthly") {
      const { from, to } = getPeriodRange(selectedDate);
      return {
        createdAtFrom: from.toISOString(),
        createdAtTo: to.toISOString(),
      };
    }
    return { createdAt: selectedDate.toISOString().substring(0, 10) };
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
            setAnchorDate(startOfDay(new Date()));
            setSelectedDate(startOfDay(new Date()));
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
        <div className="flex items-center gap-2 mb-4 justify-center">
          <ActionIcon variant="subtle" onClick={goBack}>
            <FiChevronLeft />
          </ActionIcon>

          {[4, 3, 2, 1, 0].map((offset) => {
            const d = new Date(anchorDate);
            d.setDate(d.getDate() - offset);
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <MantineButton
                key={offset}
                variant={isSelected ? "filled" : "outline"}
                size="xs"
                onClick={() => {
                  setAnchorDate(d);
                  setSelectedDate(d);
                }}
              >
                {getDayLabel(d)}
              </MantineButton>
            );
          })}

          <ActionIcon
            variant="subtle"
            disabled={
              anchorDate.toDateString() ===
              startOfDay(new Date()).toDateString()
            }
            onClick={goForward}
          >
            <FiChevronRight />
          </ActionIcon>
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
