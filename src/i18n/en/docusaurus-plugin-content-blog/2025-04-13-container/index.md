---
slug: 2025-labnow-dev-container-practice
title: "Containerized Development and DevOps: Practices and Experience"
authors: [haobibo]
tags: [LabNow, docs]
---

This post summarizes our practices, experience, and philosophy for using containers in development and DevOps.

## A. Our Philosophy for Using Containers

Since container technology became widely adopted in software development and application delivery, it has introduced clear improvements over traditional approaches in several areas.

### A1. Consistent Environments

Whether developers work on local machines such as Linux (Ubuntu/CentOS), Windows (WSL), or macOS (Intel/Apple Silicon), in build environments (for example CI/CD pipelines), or in runtime environments (for example production), they can use containers to standardize environments. This eliminates coordination issues caused by differences in versions and configurations, and greatly reduces the classic "it works on my machine" problem.

<!-- truncate -->

### A2. Lower Complexity in Environment Setup and Management

With centralized container image management, teams can use the same images across environments. This significantly reduces the time each developer spends installing and configuring software locally.

Common pain points include:

- For AI and algorithm engineers: installing and maintaining NVIDIA CUDA toolchains across different environments is time-consuming, especially in enterprise intranet environments.
- For frontend developers: managing Node.js and npm/yarn/pnpm versions, plus periodic upgrades, requires continuous maintenance.
- For backend developers: installing, configuring, and maintaining package ecosystems for Golang/Java/Python/Rust/C++ also consumes substantial effort.
- For data scientists: cross-platform package management in Python/R can be painful. For example, different PyTorch builds on Windows/Linux/macOS, packages requiring local C++ compilation, or Java runtime dependencies introduced through rJava/py4j.

By maintaining a unified container image stack, most of these issues can be removed. Of course, image management itself should be maintained through **code-defined configuration** to ensure long-term maintainability. In practice:

- Use Dockerfiles rather than `docker commit`, so image builds stay reproducible and maintainable.
- Extract Dockerfile operations into shell scripts and reusable shell functions. Then keep Dockerfiles focused on invoking those functions. This is often easier to read and maintain, and the scripts can run on other platforms too.

After years of iteration, we refined these practices into the [LabNow Stack](https://hub.docker.com/r/LabNow) image series. The source code is fully open source: https://github.com/LabNow-ai/lab-foundation. The images are built and managed through GitHub Actions.

You can absolutely build and maintain your own image stack and software supply chain as well.

The benefits are straightforward:

1. When developers need a specific environment (for example Golang, or an environment with PyTorch), they can simply choose an image, `docker pull` it, and start development by mounting source code with Docker volumes.
2. When a dependency in the environment needs an upgrade (for example NVIDIA CUDA), they only need to pull the latest or target image version, without re-installing and re-configuring software on the host.
3. Delegating image/environment management to designated maintainers (or a trusted open-source community) improves traceability and supply-chain security. It also helps with correct installation/configuration decisions by domain experts.

### A3. Simplified Deployment and Operations

For developers setting up dev/test environments, they want simple operations such as:

- quickly launching a database;
- quickly starting middleware (for example Nginx), while focusing only on core configuration (for example `server` and `location`).

For operations teams in production, they also want simple workflows, typically through `docker-compose` or Helm charts, to:

- pull the latest artifact versions (for example Docker images);
- avoid managing host-level package installation/updates and complex environment setup;
- stop/start/restart services with one or two commands;
- isolate and manage production passwords, secrets, and certificates so unauthorized users cannot access them.

These requirements can be implemented cleanly with environment-specific `docker-compose` files or Helm charts.

### A5. Additional Benefits

- Better resource utilization: containers are lighter than virtual machines, allowing more instances on the same host.
- Isolation and security: containers isolate applications to reduce cross-impact risks; image controls and permission management can further improve security.

## B. Practical Details

### B1. Unified Image Stack Code Management and CI/CD

Our source code is fully public on GitHub: https://github.com/LabNow-ai/lab-foundation

Image builds are fully automated using (free) GitHub Actions: https://github.com/LabNow-ai/lab-foundation/blob/main/.github/workflows/build-docker.yml

We also maintain several repositories for different development domains:

- [lab-foundation](https://github.com/LabNow-ai/lab-foundation): base images for programming languages, NVIDIA CUDA, Torch, and more;
- [lab-data](https://github.com/LabNow-ai/lab-data): common databases (PostgreSQL and extensions), plus big-data components such as Spark/Flink;
- [lab-dev](https://github.com/LabNow-ai/lab-dev): common developer and runtime components, such as Nginx and web IDEs (VS Code and Jupyter);
- [lab-media](https://github.com/LabNow-ai/lab-media): multimedia and multimodal processing components, such as OpenCV, PaddleOCR, and Hugging Face models.

In current code, package installation generally tracks the latest stable releases. After upstream updates, rerunning GitHub Actions can rebuild and push refreshed images.

### B2. Handling Differences Across Runtime Environments

Images may run across different time zones, data centers (for example North America vs. China), and cloud providers (for example Azure, AWS, Aliyun). To support these differences well, some environment-specific configuration is still needed after container startup.

For this purpose, we define scripts for environment-specific personalization. For example, if your image runs on the public internet in mainland China (or your local machine is connected to the mainland internet), [this script](https://github.com/LabNow-ai/lab-foundation/blob/main/docker_atom/work/localize/run-config-mirror-aliyun-pub.sh) can:

- configure timezone settings inside the image;
- detect OS family (Ubuntu/Debian) and switch apt mirrors to Aliyun mirrors;
- detect Python and configure pip index to `http://mirrors.aliyun.com/pypi/simple/`;
- detect npm/yarn/pnpm and configure registry to `https://registry.npmmirror.com`;
- detect Golang and configure `GOPROXY=https://mirrors.aliyun.com/goproxy/`;
- detect R runtime and configure CRAN mirror to `https://mirrors.aliyun.com/CRAN/`.

### B3. Practical Development Workflow in Local Environments

As mentioned in section A2, developers can use these base environments on Windows (WSL), macOS, and Linux in the following ways:

- Start a container via `docker run`, mount source code into the container with `-v`, then enter with `docker exec -it` and run programs inside the container (for example `python main.py`, `npm run dev`, `go run`).

- Write a `docker-compose` file for the same flow, with container `command: tail -f /dev/null` to keep it running, then enter using `docker exec -it`.

- If you prefer browser-based IDEs (VS Code, JupyterLab, RStudio), you can use this container we maintain: https://github.com/LabNow-ai/lab-dev/tree/main/docker_devbox

## C. Summary

After years of development, DevOps, and operations practice, we have accumulated and refined these open-source projects to improve development and operations efficiency.

We hope these prebuilt images, open build scripts, and practical experience can help you and your team. If you want to discuss more requirements or contribute to the project, feel free to open a PR or issue in the corresponding GitHub repositories.
