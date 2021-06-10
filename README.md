## Introduction
This project is Restful API that used [NestJs](https://docs.nestjs.com/) as engine. NestJs is [NodeJs Framework](https://nodejs.org/en/) a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming). <br>

*You can read more about NestJs by visit their website if necessary (https://docs.nestjs.com/).*

#### This project will follow this instruction
Detail for [assignment](assignment.docx)
```
[x]	Order transaction involves the following actors: customer and admin.

[x]	Product dictionary → free to define product metadata and values as necessary, can be hardcoded,
	1. Product has quantity; product with quantity 0 can not be ordered

[x]	Order transaction process flow and verification; single transaction has the following steps:
	1. Customer can add product to an order
	2. Customer can submit an order and the order is finalized
	3. Customers can only pay via bank transfer
	4. When placing an order the following data is required: name, phone number, email, address
	5. When an order is submitted, the quantity for the ordered product will be reduced based on the quantity.
	6. An order is successfully submitted if all ordered products are available.
	7. After an order is submitted, customer will be required to submit payment proof
	8. After an order is submitted, the order is accessible to admin and ready to be processed
	9. Admin can view order detail
	10.	Admin can verify the validity of order data: customer name, phone, email, address, payment proof
		- Given an order is valid, then Admin will prepare the ordered items for shipment
		- Given and order is invalid, then Admin can cancel the order
	11. Admin can mark the order as shipped and update the order with Shipping ID
	12.	Customer can check the order status for the submitted order
	13. Customer can check the shipment status for the submitted order using Shipping ID
```

## Features
Futures :
```
[x] JsonWenToken
[x] Server Side Pagination
[x] Support File Logging
[x] Role Management with Permission Accessibility
[x] Database Migration
```
## Prerequisites
We must to install some component to run this project
1. [NestJs](https://docs.nestjs.com/)
2. [MongoDB](https://docs.mongodb.com/) and [MongoDb Client](https://robomongo.org/)
3. [Docker](https://docs.docker.com/)
4. [Postman](https://www.postman.com/)
5. Git - [Window](https://git-scm.com/downloads), [Linux](https://git-scm.com/download/linux), [Mac](https://www.atlassian.com/git/tutorials/install-git)


## How to
Step by step implementation
1. Install *Docker* and *Docker Compose*, you can follow the step from [docker docs](https://docs.docker.com/get-docker/) and this for [docker compose docs](https://docs.docker.com/compose/install/)
2. Copy or move `config-example.yml` to `config.yml` in root dir of project.
3. Run bash script to up Docker Service `docker-compose up` or `docker-compose down` to take down Docker Service.
4.  _**THIS MIGRATE FOR INITIAL PROJECT**_ - Migrate Database `docker exec -it ack yarn migrate`, if you want to rollback run `docker exec -it ack yarn migrate:rollback`

## Test Project
After run the project, we must to check project is running well or not. 

*We gonna check with hit endpoint test*

#### Test endpoint
Assume our endpoint in `localhost:3000`
- Url `localhost:3000/api/hello`
- Method `GET`
- Url Params `null`
- Body `null`
- Header `not need credentials`
```
- Code: 200
- Body: 
{
	"statusCode": 200,
	"message": "This is test endpoint."
}
```

## Credentials
Credentials for this project
#### Database
```
- Database Name: ack
- User: ack
- Password: ack123
```
#### App
```
- Host: localhost
- Port: 3000
```
## Endpoint
All endpoints in [akar-init.collection.json](akar-init.collection.json). If we want to use json file, we must import to Postman back. [Follow this step for import into Postman](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/)

The Description about endpoints
#### General
1. `Login`: login endpoint
2. `Hello`: Test Endpoint
#### Admin
1. User
	- `Create`: Create new user based role
	- `Get By Id`: Get user by Id
	- `Delete`: Delete user by Id
	- `Get All`: Get all users
	- `Update`: Update some data about user
2. Order
	- `Get All`: Get all orders
	- `Get By Id`: Get order by id
	- `Update Payment`: Update order status to paid, status must in paid and has a payment confirmation
	- `Update Shipment`: Update order status to shipment, status must in paid
	- `Update Cancel`: Update order to cancel, if status in completed then will get error
	- `Update Completed`: Update order status to completed, status must in shipment
3. Product
	- `Get All`: Get all products
	- `Delete`: Delete product by id
	- `Create`: Create product free define field
4. Payment
	- `Get By Order Id`: Get payment by order id
	- `Delete By Order Id`: Delete payment by order id

#### Customer
1. User
	- `Profile`: Get detail by user login
	- `Profile Update`: Update some data about user by user login
2. Product
	- `List`: Get list of Active Product
3. Cart
	- `Get`: Get cart user login
	- `Add Item`: Add item into cart
	- `Remove Item`: Remove item from cart, if quantity product is 0 then item will be remove
4. Order
	- `List`: List orders with status filter and user login
	- `List Detail`: Detail about order by user login
	- `Create`: Create Order from Cart, Cart must have product at least one product
	- `Shipment`: See Order with Shipment Number / Shipment Id
5. Payment 
	- `Create`: Create Payment confirmation from order (Only One)
	- `List`: Get Payment by OrderId
