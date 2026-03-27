"use client";

import { useState } from "react";
import { Text, UnstyledButton, Group, Button as MantineButton } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { CiCalendarDate } from "react-icons/ci";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import Task from "@/components/Task";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import TaskForm from "@/components/TaskForm";
import { useGetItems, getItemsQueryKey } from "@/src/gen/hooks/useGetItems";
import { usePatchItemsByIdToggle } from "@/src/gen/hooks/usePatchItemsByIdToggle";
import { useDeleteItemsById } from "@/src/gen/hooks/useDeleteItemsById";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";

type Item = {
  id: number;
  name: string;
  description: string;
  score: number;
  completed: boolean;
  createdAt: string;
};

type EditItem = { id: number; name: string; description: string; score: number; completed: boolean };

export default function DashboardPage() {
  const [opened, setOpened] = useState(false);
  const [editItem, setEditItem] = useState<EditItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [date, setDate] = useState(dayjs());
  const { data, isLoading, isError } = useGetItems({
    createdAtFrom: date.startOf("day").toISOString(),
    createdAtTo: date.endOf("day").toISOString(),
  });
  const queryClient = useQueryClient();
  const { mutate: toggleItem } = usePatchItemsByIdToggle({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getItemsQueryKey() }),
    },
  });
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItemsById();

  function handleDeleteConfirm() {
    if (deleteId === null) return;
    deleteItem({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
        setDeleteId(null);
      },
    });
  }

  const [datePickerOpened, { open: openDatePicker, close: closeDatePicker }] =
    useDisclosure(false);

  const items: Item[] = (Array.isArray(data) ? (data as Item[]) : [])
    .slice()
    .sort((a, b) => {
      const aC = Number(a.completed);
      const bC = Number(b.completed);
      if (aC !== bC) return aC - bC;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const formatDate = (date: dayjs.Dayjs) => date.format("D MMMM");

  const onChangeDate = (date: dayjs.Dayjs) => {
    setDate(date);
  };

  return (
    <AppLayout>
      <div className="flex items-center gap-4 mb-4 justify-between">
        <Button onClick={() => setOpened(true)}>New</Button>
        <UnstyledButton onClick={openDatePicker}>
          <CiCalendarDate className="text-gray-600 size-8" />
        </UnstyledButton>
      </div>
      <Modal
        title="Select Date"
        opened={datePickerOpened}
        onClose={closeDatePicker}
      >
        <DatePicker
          defaultDate={date.toDate()}
          value={date.toDate()}
          onChange={(d) => onChangeDate(dayjs(d))}
        />
      </Modal>
      <div className="flex items-center mb-6 justify-center ">
        <button onClick={() => onChangeDate(date.subtract(2, "day"))}>
          <p className="text-dark font-medium border rounded_ p-2.5 border-gray-300 min-w-20 border-r-0">
            {date.subtract(2, "day").format("YYYY-MM-DD") ===
            dayjs().format("YYYY-MM-DD")
              ? "Today"
              : formatDate(date.subtract(2, "day"))}
          </p>
        </button>
        <button onClick={() => onChangeDate(date.subtract(1, "day"))}>
          <p className="text-dark font-medium border rounded_ p-2.5 border-gray-300 min-w-20">
            {date.subtract(1, "day").format("YYYY-MM-DD") ===
            dayjs().format("YYYY-MM-DD")
              ? "Today"
              : formatDate(date.subtract(1, "day"))}
          </p>
        </button>
        <h3 className="text-center font-medium text-primary p-2.5">
          {date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
            ? "Today"
            : formatDate(date)}
        </h3>
        <button onClick={() => onChangeDate(date.add(1, "day"))}>
          <p className="text-dark font-medium border rounded_ p-2.5 border-gray-300 min-w-20">
            {date.add(1, "day").format("YYYY-MM-DD") ===
            dayjs().format("YYYY-MM-DD")
              ? "Today"
              : formatDate(date.add(1, "day"))}
          </p>
        </button>
        <button onClick={() => onChangeDate(date.add(2, "day"))}>
          <p className="text-dark font-medium border rounded_ p-2.5 border-gray-300 border-l-0 min-w-20">
            {date.add(2, "day").format("YYYY-MM-DD") ===
            dayjs().format("YYYY-MM-DD")
              ? "Today"
              : formatDate(date.add(2, "day"))}
          </p>
        </button>
      </div>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <TaskForm onSuccess={() => setOpened(false)} />
      </Modal>

      <Modal opened={editItem !== null} onClose={() => setEditItem(null)} title="Edit task">
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
        <Text size="sm">Are you sure you want to delete this task? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <MantineButton variant="outline" onClick={() => setDeleteId(null)}>Cancel</MantineButton>
          <MantineButton color="red" onClick={handleDeleteConfirm} loading={isDeleting}>Delete</MantineButton>
        </Group>
      </Modal>

      {isLoading && <Text>Loading...</Text>}
      {isError && <Text c="red">Failed to load items.</Text>}

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
                score={item.score}
                onToggle={(completed) =>
                  toggleItem({ id: item.id, data: { completed } })
                }
                onEdit={() => setEditItem({ id: item.id, name: item.name, description: item.description, score: item.score, completed: item.completed })}
                onDelete={() => setDeleteId(item.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
