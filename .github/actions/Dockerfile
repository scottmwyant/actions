FROM bash
RUN apk --no-cache add jq curl grep
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["bash", "/entrypoint.sh"]
