# CI CD Pipelines

CI/CD stands for "Continuous Integration and Continuous Delivery/Deployment". Now, it's all about making a proper workflow that tests whether the software is working correctly, and initiates the deployment process. So today, lets check out how to use github actions to implement this easily.

So first of all, it comes down to the file structure.

- **`.github/workflows/`**: This is the directory where all your GitHub Actions workflow files will reside.
- **`main.yml`**: This is an example workflow file that defines the steps for your CI/CD pipeline.

Here is my `main.yml` file for this website:

```yaml
name: Build Check

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run build
        run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy application
        run: echo "Deploying application..."
```

This workflow will trigger on every push/pr to all the branches (though we could also specify the branch, as you'll see in the example below), install dependencies, and check if it builds. I dont need to do anything else in this project atleast as it's just a frontend project. And most of the times, there's just a random build error. You can also make the `on` parameter look like this:

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
```

## Explaining the YML File

This file defines a GitHub Actions workflow for automating tasks like building and deploying your application. Let's break down the major components.

### Name: Workflow Name

This defines the name of the workflow as it appears in the GitHub Actions UI. In this case, it's: `Build Check`.

### On: Trigger Events

This tells GitHub when to run the workflow. You can specify events like `push`, `pull_request`, etc. In this, you can also specify the branch it's supposed to work on.

### Jobs: Define Individual Tasks

Each job is a set of steps that runs in the specified environment. In our case, there are two jobs: `build` and `deploy`.

- **`runs-on`**: This tells GitHub which VM to use. In this case, we chose the latest Ubuntu virtual environment.
- **`steps`**: They just consist of the name and the terminal command based on the VM selected.
