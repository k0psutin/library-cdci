FROM node:16.3.0-alpine

WORKDIR /opt/app
COPY /backend .

ARG MONGODB_URI 
ARG JWT_SECRET

ENV MONGODB_URI ${MONGODB_URI}
ENV JWT_SECRET ${JWT_SECRET}

RUN printenv > .env

CMD ["npm", "run", "start"]