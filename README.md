### DEMO Architechture

- shop-api-gateway:
  + Cloud gateway using spring-cloud-starter-gateway.
  + Implement JWT Filter for some modules.
- shop-auth-service: 
  + Authentication service (authorization is not included).
  + Generate JWT for signin function using jjwt
  + Waiting functions: refresh token, PASETO v2 (It's much more secure than JWT)
- shop-management-service:
  + CRUD API using JPA.
- shop-main-service:
  + Get Product List with paging and dynamic filters.
  + Get Product Details.
  + Create Order and Order Details
  + Update Order/Order Details with many scenarios
  + Checkout function

For more information, please see in code.
Sorry for that :(