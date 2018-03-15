.PHONY: run

NAME=branded_spinner
BASE_TAG=shaneburkhart/${NAME}

all: run

build:
	 docker build -t ${BASE_TAG} .

run:
	docker-compose -p ${NAME} up -d

stop:
	docker stop $$(docker ps -q) || echo "Nothing to stop..."

clean: stop
	docker rm $$(docker ps -aq) || echo "Nothing to remove..."

ps:
	docker ps -a

logs:
	docker-compose -p ${NAME} logs -f

c:
	docker-compose -p ${NAME} run --rm web /bin/bash
