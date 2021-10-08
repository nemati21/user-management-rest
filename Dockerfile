FROM node

RUN npm install -g nodemon

RUN mkdir -p /usr/src/user-management

WORKDIR /usr/src/user-management
 
COPY . .
RUN npm install
 
# Bundle app source
# COPY ./src /usr/src/assignment-service/src

EXPOSE 4000

CMD ["npm", "start"]
