"use client";

import { TextInput, Textarea, NumberInput, Checkbox, Button, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostItems } from "@/src/gen/hooks/usePostItems";
import { usePutItemsById } from "@/src/gen/hooks/usePutItemsById";
import { getItemsQueryKey } from "@/src/gen/hooks/useGetItems";

type TaskFormValues = {
  name: string;
  description: string;
  score: number;
  completed: boolean;
};

type TaskFormProps = {
  onSuccess?: () => void;
  itemId?: number;
  initialValues?: Partial<TaskFormValues>;
};

export default function TaskForm({ onSuccess, itemId, initialValues }: TaskFormProps) {
  const queryClient = useQueryClient();
  const { mutate: createItem, isPending: isCreating, isError: isCreateError } = usePostItems();
  const { mutate: updateItem, isPending: isUpdating, isError: isUpdateError } = usePutItemsById();

  const [values, setValues] = useState<TaskFormValues>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    score: initialValues?.score ?? 3,
    completed: initialValues?.completed ?? false,
  });

  const isPending = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name: values.name, description: values.description, score: values.score, completed: values.completed };
    const onSuccess_ = () => {
      queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
      onSuccess?.();
    };
    if (itemId !== undefined) {
      updateItem({ id: itemId, data: payload }, { onSuccess: onSuccess_ });
    } else {
      createItem({ data: payload }, { onSuccess: onSuccess_ });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Task name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.currentTarget.value })}
          required
        />
        <Textarea
          label="Description"
          placeholder="Task description"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.currentTarget.value })}
        />
        <NumberInput
          label="Score"
          placeholder="1–5"
          min={1}
          max={5}
          value={values.score}
          onChange={(val) => setValues({ ...values, score: Number(val) })}
        />
        <Checkbox
          label="Completed"
          checked={values.completed}
          onChange={(e) => setValues({ ...values, completed: e.currentTarget.checked })}
        />
        {isError && <Text c="red" size="sm">Failed to create item. Try again.</Text>}
        <Button type="submit" loading={isPending}>Save</Button>
      </Stack>
    </form>
  );
}
