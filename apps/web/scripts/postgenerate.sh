#!/usr/bin/env bash

# Fix queryKey assignment pattern in suspense hooks
perl -i -0pe 's/query\.queryKey = queryKey as TQueryKey\s*\n\s*return query/return Object.assign(query, { queryKey: queryKey as TQueryKey })/g' src/gen/hooks/useGet*.ts

# Remove .ts extensions from imports in generated files
perl -i -pe 's/(from "[^"]+)\.ts(")/$1$2/g' src/gen/client.ts src/gen/hooks/*.ts src/gen/*.ts
