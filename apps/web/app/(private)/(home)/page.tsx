"use client";

import { useState } from "react";
import { Text, Button as MantineButton, Group, Select } from "@mantine/core";
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
import dayjs from "dayjs";
import _ from "lodash";

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
  // const [filter, setFilter] = useState<string | null>(null);

  const session = useServerSession();

  const startOfDay = (d: Date) => {
    const n = new Date(d);
    n.setHours(0, 0, 0, 0);
    return n;
  };
  const endOfDay = (d: Date) => {
    const n = new Date(d);
    n.setHours(23, 59, 59, 999);
    return n;
  };

  const startOfWeek = (d: Date) => {
    return dayjs(d).startOf("week").toDate();
  };

  const selectedDate = startOfDay(new Date());

  function getPeriodRange(date: Date): { from: Date; to: Date } {
    return { from: startOfWeek(date), to: endOfDay(date) };
  }

  function buildParams() {
    const { from, to } = getPeriodRange(selectedDate);
    return {
      createdAtFrom: from.toISOString().substring(0, 10),
      createdAtTo: to.toISOString().substring(0, 10),
    };
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

  console.log("items", items);

  const formattedItems: Record<string, Item[]> = items.reduce((acc, cur) => {
    const date = cur.createdAt.substring(0, 10);
    const items = _.get(acc, date, []);

    return {
      ...acc,
      [date]: [...items, cur],
    };
  }, {});

  console.log("formattedItems", formattedItems);

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
          What are your plans today?
        </Text>
      )}

      <div className="flex flex-col gap-3">
        {Object.entries(formattedItems).map(([k, items]) => {
          return (
            <div key={k}>
              <p className="sticky top-8 text-dark ">
                {dayjs(k).format("DD/MM/YYYY")}
              </p>
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className="mb-3 last-of-type:mb-0"
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
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
