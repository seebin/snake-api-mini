FROM node:10.16.3

LABEL maintainer="seebin <iseebin@qq.com>"

#COPY ../package*.json /app/

WORKDIR /app

#RUN npm install

#COPY ../ /app/

EXPOSE 3004

# CMD ["npm","run","start"]