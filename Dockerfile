FROM ubuntu:latest

RUN apt-get update && apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

COPY . /src/mcp-proxy-server

RUN cd /src/mcp-proxy-server && \
    rm -rf node_modules && rm -rf build && \
    npm install && \
    npm install -g .

ENTRYPOINT ["/usr/bin/mcp-proxy-server"]
