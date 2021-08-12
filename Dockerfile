FROM node:slim

# install pnpm
RUN npm install -g pnpm

# install ffmpeg, python
RUN apt-get update && \
	apt-get install -y \
	ffmpeg \
	python3 \
	build-essential && \
	apt-get purge -y --auto-remove

# setup workdir
RUN mkdir -p /app
WORKDIR /app
ADD . /app

# install dependencies
RUN pnpm install

# set SHELL env for dokdo
ENV SHELL="/bin/bash"

ENTRYPOINT [ "pnpm", "start" ]

