#!/usr/bin/env bash

echo "Fixing division depreciation for SASS"

echo "Migrating LBH Frontend"
for file in ./node_modules/lbh-frontend/lbh/**/*.scss
do
  sass-migrator division "$file" > /dev/null;
done

echo "Migrating GOVUK Frontend"
for file in ./node_modules/govuk-frontend/govuk/**/*.scss
do
  sass-migrator division "$file" > /dev/null;
done

echo "Done migrating SASS files"
