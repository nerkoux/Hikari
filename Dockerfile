FROM node:slim

# install pnpm
RUN npm install -g pnpm

# install ffmpeg, python
RUN apt-get update && \
	apt-get install -y \
	git \
	ffmpeg \
	python3 \
	build-essential \
        autoconf \
        automake \
        g++ \
        libtool && \
	apt-get purge -y --auto-remove

# setup workdir
RUN mkdir -p /app
WORKDIR /app
ADD . /app

# install sodium instead of libsodium-wrappers
# also install dependencies too
RUN pnpm rm libsodium-wrappers && pnpm install sodium

# set SHELL env for dokdo
ENV SHELL="/bin/bash"

# set python aliases for distube(youtube-dl)
RUN ln -s /usr/bin/python3 /usr/bin/python

ENTRYPOINT [ "pnpm", "start" ]
