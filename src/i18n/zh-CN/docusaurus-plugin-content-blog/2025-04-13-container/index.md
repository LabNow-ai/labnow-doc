---
slug: 2025-labnow-dev-container-practice
title: "基于容器化的开发和DevOps的实践和经验"
authors: [haobibo]
tags: [LabNow, docs]
---

本文简述我们在进行开发和DevOps工作中使用容器化的实践、经验和理念。

## A. 我们对容器使用的理念

容器技术在软件开发和应用部署等领域广泛应用以来，在下面几方面相较于传统的开发和部署模式带来了新的改变。

### A1. 提供一致的环境

无论开发者是在本地的开发环境，如Linux（ubuntu/centos）、Windows(WSL)、macOS（Intel/M系列芯片）等平台上，还是在构建环境（如CI/CD流水线）、还是运行环境（如生产环境），
都可以使用容器，确保使用相同的环境，消除各种因为环境、版本、配置等的差异，带来的协调困难，减少“在我机器上没问题”的情况。

<!-- truncate -->

### A2. 降低复杂环境管理和配置难度

通过容器镜像的统一管理、团队在各种环境均使用相同的镜像，可以大幅减少每位开发者花费大量时间，在自己的环境中安装软件、进行配置的时间。

一些常见的痛点包括：

- 对AI和算法类工程师：在不同的环境中安装配置NVIDIA cuda系列套件，并维护cuda版本的更新，十分花费时间，尤其是在企业局域网内网环境；
- 对前端开发者：需要处理NodeJS，以及npm/yarn/pnpm自身版本的管理和更新问题，每次版本的更新均需要花费一定的时间来更新配置；
- 对后端开发者：同样对于Golang/Java/Python/Rust/C++等环境的程序包安装、配置、更新，需要花费较大精力进行更新、维护和管理；
- 对数据科学家：在使用Python/R等数据科学工具包时，跨平台版工具包版本的管十分头疼，例如：Windows/Linux/macOS上不同版本的pytorch等包，有一些包需要进行C++编译才能安装，还有一些包通过rJava/py4j调用Java程序时候又涉及JRE/JDK的管理。

而如果通过维护一套统一的容器镜像栈，就可以消除这些困难。当然，对这些容器镜像的管理，也需要通过“代码定义的配置（Code defined configuration）”来确保这些镜像的可维护性。具体来说：

- 需要使用Dockerfile而不是通过docker commit来管理镜像，保证镜像构建的可重复性和可维护性；
- 建议把Dockerfile中进行的操作抽象提取到shell脚本中，用shell脚本函数来定义大部分操作，而在Dockerfile中只执行函数的调用，这样的脚本更易于维护、易读（相较于Dockerfile）、并且可以在其他平台环境执行。

经过多年的迭代，我们不断打磨我们的实践，形成了[LabNow Stack](https://hub.docker.com/r/LabNow)系列镜像，其源代码也完全开源：https://github.com/LabNow-ai/lab-foundation 。这一些列的镜像是我们的理念的实践，并且使用GitHub Actions（这一免费的资源）进行构建和管理。

当然您也完全可以构建自己的镜像栈，维护自己的软件供应链体系。

这一实践带来的好处显而易见：

1. 当开发者需要某一个系列的开发环境时（例如Golang，或者包含了pytorch的环境），那么只要选取一个镜像，docker pull到自己的环境就可以进行开发，只需要把源代码通过docker volume mount到启动的容器中即可。
2. 当开发者需要更新环境中的软件或package（例如NVIDIA cuda）版本时，只需要拉取最新版本（latest）或指定版本的镜像即可，无需从主机上下载、安装、配置环境。
3. 将镜像、环境的管理交由专人（或者可信任的开源社区）管理、维护、开发，一方面可以确保代码定义的环境的可追溯管理和软件供应链安全，另一方面这在在该领域有专长的开发者更能够进行合理的安装和配置（例如：当你在你的笔记本上运行pytorch程序时，如果配置不当则会安装GPU版本的pytorch，无端占用更多存储空间）。

### A3. 简化部署和运维

对开发人员来说，在开发测试环境的环境搭建工作中，希望尽可能简单的操作，例如：

- 快速搭建启动一个数据库；
- 快速启动一个中间件（例如Nginx）而且只需要关心其中最核心的配置部分（例如Nginx的server和location部分）。

对运维人员来说：在生产环境的运维工作，希望有尽可能简单的操作，例如通过docker-compose文件或helm chart等，来实现：

- 拉取最新版本的artifact（构建，例如docker images）；
- 不必关心各种软件包的安装、更新等管理、不必关心环境变量等的配置；
- 仅仅通过一两个简单的命令操作实现服务的停止、启动、重启；
- 将生产环境密码、secrets、certificates等独立管理，不让未授权的人员访问（如开发人员）。

这些需求和痛点都可以通过编写不同环境的docker-compose文件或helm chart来实现。

### A5. 其他的好处

- 资源利用率提升：与传统虚拟机相比，容器更轻量级，能够在单一主机上运行更多实例，有效利用计算资源。
- 应用隔离与安全：容器为每个应用提供隔离环境，降低了应用之间的相互影响风险，同时通过镜像控制与权限管理增强了安全性。

## B. 一些具体的实践细节

### B1. 统一镜像栈的代码管理和CI/CD

我们的源代码完全公开在GitHub上：https://github.com/LabNow-ai/lab-foundation

镜像的构建完全通过（免费的）GitHub Actions来构建：https://github.com/LabNow-ai/lab-foundation/blob/main/.github/workflows/build-docker.yml

我们也针对几个不同的开发领域构建几个代码库来分别管理各个系列的镜像栈：

- [lab-foundation](https://github.com/LabNow-ai/lab-foundation)：维护了一些列基础镜像，例如各前后端编程语言环境，以及NVIDIA cuda和torch等基础环境；
- [lab-data](https://github.com/LabNow-ai/lab-data)：维护了一些列常用数据库（Postgresql及附加插件）、大数据处理组件（spark/flink）等；
- [lab-dev](https://github.com/LabNow-ai/lab-dev)：维护了一些列开发和线上应用中常用的组件，例如：nginx、网页内IDE（如VSCode和Jupyter）等；
- [lab-media](https://github.com/LabNow-ai/lab-media)：维护了一些列多媒体/多模态内容处理的组件，如OpenCV、PaddleOCR、HuggingFace Model等。

现有代码中，对各种软件包的安装，都会默认选取最新的release/stable版本，因此当有软件更新后，只需重新执行一下GitHub Actions，版本最新版本软件包的镜像就会被构建并推送到镜像库当中。

### B2. 不同运行环境下的差异化处理

镜像会在不同的环境下使用，例如：不同的时区、不同的数据中心（例如北美、中国）、不同云服务提供商（例如Azure、AWS、aliyun）。
为了更好的在不同环境下使用这些镜像，仍需要在容器启动后，执行特定的个性化配置。

为此，我们定义了一系列脚本，用于处理在不同环境时需要执行的个性化配置操作。
例如，您的镜像运行在中国大陆地区的互联网上（或者你的个人电脑连接了中国大陆的互联网），[这个脚本](https://github.com/LabNow-ai/lab-foundation/blob/main/docker_atom/work/localize/run-config-mirror-aliyun-pub.sh)执行的个性化的配置将会：

- 在镜像内进行恰当的时区配置；
- 检测镜像内操作系统环境（Ubuntu/Debian），并把其镜像源修改为aliyun面向互联网的镜像；
- 检测是否有Python安装，如果有则：将Python的pip下载安装源配置到：http://mirrors.aliyun.com/pypi/simple/
- 检测是否有npm/yarn/pnpm的存在，如果有则：配置镜像源为：registry https://registry.npmmirror.com
- 检测是否有Golang开发环境存在，如果有则：配置GOPROXY=https://mirrors.aliyun.com/goproxy/
- 检测是否有R语言运行环境存在，如果有则：配置CRAN源为：https://mirrors.aliyun.com/CRAN/

### B3. 在开发环境进行代码开发时的一些实践

如A2小节中提及的，开发者在自己的Windows(WSL)、macOS、Linux环境像，使用这些基础环境进行开发时候，可以：

- 通过`docker run`来启动一个镜像，启动时用`-v`来把源代码的目录挂载到容器内，然后`docker exec -it`进入容器中，在容器内启动程序（例如：`python main.py`、`npm run dev`、`go run`等）。

- 编写一个docker-compose文件来实现上述逻辑，其中容器启动的command设置为：`tail -f /dev/null`，这样容器就会保持启动而不会运行即逝，然后再通过`docker exec -it`进入容器启动代码。

- 如果您希望在网页IDE（包括VSCode、JupyterLab、RStudio）中进行开发，还可以使用我们维护的这个容器来进行开发：https://github.com/LabNow-ai/lab-dev/tree/main/docker_devbox

## C. 总结

经过多年的开发、DevOps、运维实践，我们通过实践积累和打磨了上面的开源项目，形成了自己的实践来提升开发运维效率。

希望这些构建好的镜像、用于构建的源代码、我们的开发实践能对您和您的团队的开发有帮助，如果您有更多的需求想要交流、或者想要对这一项目进行贡献，也欢迎您到对应的GitHub repo当中提PR/issue。
