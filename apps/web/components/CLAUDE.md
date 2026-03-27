# CLAUDE.md

Every component in this folder should have its own folder, and an `index.tsx` file that exports the component. This allows us to easily import components from other parts of the app, and also keeps our code organized.

## Component Structure

Each component should follow this structure:

```
ComponentName/
├── index.tsx       # The main component file
├── types.ts        # Optional TypeScript types for the component
└── README.md       # Optional documentation for the component
```

## Folder Nameing

The folder name should be the same as the component name, and should be in PascalCase. For example, if the component is called `Button`, the folder should be named `Button`.

## Component Example

```
import { useState } from 'react';
export default function ComponentName() {
  const [state, setState] = useState(null);
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
```
