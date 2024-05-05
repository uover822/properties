build :
	mkdir -p app/data
	mkdir -p app/srv
	cp -r ../../../properties/properties.js app
	cp -r ../../../properties/srv/*.js app/srv
	docker build -t msr-properties:1 .
	docker build -t msr-properties-prod:1 -f Dockerfile-prod .

clean :
	rm *~

.PHONY : build clean
