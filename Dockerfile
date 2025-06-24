FROM debian:latest

RUN apt-get update && apt-get install -y curl python3 python3-dev python3-pip

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

RUN apt-get update && \
    apt-get install ca-certificates -y && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install docker-ce-cli -y

COPY . /src/mcp-proxy-server

RUN cd /src/mcp-proxy-server && \
    rm -rf node_modules && rm -rf build && \
    npm install && \
    npm install -g .