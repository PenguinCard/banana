FROM alpine

ARG PORT=29092
ARG KAFKA_HOME=/kafka
ARG SCALA=2.12
ARG KAFKA=3.2.0

EXPOSE ${PORT}

ENV PORT=${PORT}
ENV KAFKA_HOME=${KAFKA_HOME}_${SCALA}-${KAFKA}

RUN apk add --no-cache bash
RUN apk add openjdk11-jre
RUN apk add wget
RUN wget https://dlcdn.apache.org/kafka/$KAFKA/$KAFKA_HOME.tgz
RUN apk del wget
RUN tar xvf $KAFKA_HOME.tgz
RUN rm $KAFKA_HOME.tgz
RUN rm -rf $KAFKA_HOME/bin/windows

ENV PATH=${PATH}:${KAFKA_HOME}
WORKDIR ${KAFKA_HOME}

RUN echo listeners=PLAINTEXT://broker:$PORT >> config/server.properties
RUN echo advertised.listeners=PLAINTEXT://broker:$PORT >> config/server.properties 
RUN touch ./kafka.sh
RUN echo $KAFKA_HOME/bin/zookeeper-server-start.sh -daemon $KAFKA_HOME/config/zookeeper.properties >> ./kafka.sh
RUN echo exec "$KAFKA_HOME/bin/kafka-server-start.sh" "$KAFKA_HOME/config/server.properties" >> ./kafka.sh
RUN echo $KAFKA_HOME/bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server broker:$PORT >> ./kafka.sh

ENTRYPOINT [ "sh" ]
CMD ["kafka.sh"]
