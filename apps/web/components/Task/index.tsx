"use client";

import { useState } from "react";
import { Menu } from "@mantine/core";
import { BsThreeDots } from "react-icons/bs";

type TaskProps = {
  name: string;
  description: string;
  completed: boolean;
  createdAt: string;
  score: number;
  onToggle?: (completed: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function Task({ name, description, completed: initialCompleted, createdAt, score, onToggle, onEdit, onDelete }: TaskProps) {
  const [completed, setCompleted] = useState(initialCompleted);

  function handleChange() {
    const next = !completed;
    setCompleted(next);
    onToggle?.(next);
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <input
        type="checkbox"
        checked={completed}
        onChange={handleChange}
        className="h-4 w-4 accent-primary cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-dark ${completed ? "line-through text-gray-400" : ""}`}>
          {name}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-gray-400">{createdAt}</span>
        <span className="text-xs font-semibold text-primary">Score {score}/5</span>
      </div>
      <Menu shadow="md" width={160} position="bottom-end">
        <Menu.Target>
          <button type="button" className="p-1 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <BsThreeDots size={16} />
          </button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={onEdit}>Edit task</Menu.Item>
          <Menu.Item color="red" onClick={onDelete}>Delete task</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
