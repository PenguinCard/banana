FROM alpine

ARG PORT=29092
ARG KAFKA_HOME=/kafka

EXPOSE ${PORT}

ENV PORT=${PORT}
ENV KAFKA_HOME=${KAFKA_HOME}

RUN apk add --no-cache bash
RUN apk add openjdk11
RUN apk add wget
RUN wget https://dlcdn.apache.org/kafka/3.2.0/kafka_2.12-3.2.0.tgz
RUN tar xvf kafka_2.12-3.2.0.tgz
RUN rm kafka_2.12-3.2.0.tgz
RUN mv /kafka_2.12-3.2.0 /kafka

ENV PATH=${PATH}:${KAFKA_HOME}
WORKDIR ${KAFKA_HOME}

RUN echo listeners=PLAINTEXT://broker:$PORT >> config/server.properties
RUN echo advertised.listeners=PLAINTEXT://broker:$PORT >> config/server.properties 
RUN touch ./kafka.sh
RUN echo $KAFKA_HOME/bin/zookeeper-server-start.sh -daemon $KAFKA_HOME/config/zookeeper.properties >> ./kafka.sh
RUN echo exec "$KAFKA_HOME/bin/kafka-server-start.sh" "$KAFKA_HOME/config/server.properties" >> ./kafka.sh
ENTRYPOINT [ "sh" ]
CMD ["kafka.sh"]
