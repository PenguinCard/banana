FROM jruby:9.3.4.0-jre11

ARG MASTER_PORT=16010
ARG CLIENT_PORT=8080
ARG HBASE=3.0.0-alpha-2
ARG HBASE_HOME=hbase-${HBASE}

EXPOSE ${MASTER_PORT}
EXPOSE ${CLIENT_PORT}
 
RUN apt-get install wget -y
RUN wget https://dlcdn.apache.org/hbase/$HBASE/$HBASE_HOME-bin.tar.gz
RUN apt-get remove wget -y
RUN tar zxvf $HBASE_HOME-bin.tar.gz
RUN rm $HBASE_HOME-bin.tar.gz

ENV HBASE_HOME=/${HBASE_HOME}

WORKDIR ${HBASE_HOME}/bin

RUN touch ./hbase.sh
RUN echo exec "$HBASE_HOME/bin/hbase master start" >> ./hbase.sh

CMD bash hbase.sh && bash

