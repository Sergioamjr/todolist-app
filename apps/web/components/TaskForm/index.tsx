"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  TextInput,
  NumberInput,
  Switch,
  Button,
  Stack,
  Text,
  Group,
  Combobox,
  PillsInput,
  Pill,
  useCombobox,
  InputWrapper,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { usePostItems } from "@/src/gen/hooks/usePostItems";
import { usePutItemsById } from "@/src/gen/hooks/usePutItemsById";
import { getItemsQueryKey } from "@/src/gen/hooks/useGetItems";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const PRESET_TAGS = ["work", "urgent", "personal", "health", "study"];

type TaskFormValues = {
  name: string;
  description: string;
  priority: number;
  completed: boolean;
  featured: boolean;
  tags: string[];
};

type TaskFormProps = {
  onSuccess?: () => void;
  itemId?: number;
  initialValues?: Partial<Omit<TaskFormValues, "tags"> & { tags?: string }>;
};

function TagsCombobox({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState("");

  const exactMatch =
    value.includes(search.trim()) ||
    PRESET_TAGS.includes(search.trim().toLowerCase());

  const options = PRESET_TAGS.filter(
    (t) =>
      !value.includes(t) && t.toLowerCase().includes(search.toLowerCase()),
  ).map((t) => (
    <Combobox.Option value={t} key={t}>
      {t}
    </Combobox.Option>
  ));

  return (
    <InputWrapper label="Tags">
      <Combobox
        store={combobox}
        onOptionSubmit={(val) => {
          const tag = val === "$create" ? search.trim() : val;
          if (tag && !value.includes(tag)) onChange([...value, tag]);
          setSearch("");
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <PillsInput onClick={() => combobox.openDropdown()}>
            <Pill.Group>
              {value.map((tag) => (
                <Pill
                  key={tag}
                  withRemoveButton
                  onRemove={() => onChange(value.filter((v) => v !== tag))}
                >
                  {tag}
                </Pill>
              ))}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  value={search}
                  placeholder="Add tags…"
                  onChange={(e) => {
                    combobox.openDropdown();
                    combobox.updateSelectedOptionIndex();
                    setSearch(e.currentTarget.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && search.length === 0) {
                      onChange(value.slice(0, -1));
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>
            {options}
            {!exactMatch && search.trim().length > 0 && (
              <Combobox.Option value="$create">
                + Create &quot;{search.trim()}&quot;
              </Combobox.Option>
            )}
            {options.length === 0 && search.trim().length === 0 && (
              <Combobox.Empty>Type to add tags</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </InputWrapper>
  );
}

export default function TaskForm({ onSuccess, itemId, initialValues }: TaskFormProps) {
  const queryClient = useQueryClient();
  const { mutate: createItem, isPending: isCreating, isError: isCreateError } = usePostItems();
  const { mutate: updateItem, isPending: isUpdating, isError: isUpdateError } = usePutItemsById();

  const [values, setValues] = useState<TaskFormValues>({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    priority: initialValues?.priority ?? 3,
    completed: initialValues?.completed ?? false,
    featured: initialValues?.featured ?? false,
    tags: initialValues?.tags?.split(",").filter(Boolean) ?? [],
  });

  const isPending = isCreating || isUpdating;
  const isError = isCreateError || isUpdateError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: values.name,
      description: values.description,
      priority: values.priority,
      completed: values.completed,
      featured: values.featured,
      tags: values.tags.join(","),
    };
    const onSuccess_ = () => {
      queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
      onSuccess?.();
    };
    if (itemId !== undefined) {
      updateItem({ id: String(itemId), data: payload }, { onSuccess: onSuccess_ });
    } else {
      createItem({ data: payload }, { onSuccess: onSuccess_ });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Task name"
          placeholder="What needs to be done?"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.currentTarget.value })}
          required
        />

        <TagsCombobox
          value={values.tags}
          onChange={(tags) => setValues({ ...values, tags })}
        />

        <InputWrapper label="Description">
          <ReactQuill
            theme="snow"
            value={values.description}
            onChange={(val) => setValues({ ...values, description: val })}
            style={{ borderRadius: 8 }}
          />
        </InputWrapper>

        <NumberInput
          label="Priority"
          description="1 = low, 5 = high"
          placeholder="1–5"
          min={1}
          max={5}
          value={values.priority}
          onChange={(val) => setValues({ ...values, priority: Number(val) })}
        />

        <Group grow>
          <Switch
            label="Completed"
            checked={values.completed}
            onChange={(e) => setValues({ ...values, completed: e.currentTarget.checked })}
          />
          <Switch
            label="Featured"
            checked={values.featured}
            onChange={(e) => setValues({ ...values, featured: e.currentTarget.checked })}
          />
        </Group>

        {isError && (
          <Text c="red" size="sm">
            Failed to save task. Try again.
          </Text>
        )}

        <Button type="submit" loading={isPending} fullWidth>
          Save task
        </Button>
      </Stack>
    </form>
  );
}
