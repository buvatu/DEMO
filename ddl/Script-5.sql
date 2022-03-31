DROP TABLE IF EXISTS qlvt.role;
create table qlvt.role (
   role_id SERIAL PRIMARY KEY,
   role_name varchar unique not null,
   updated_timestamp timestamp,
   updated_user varchar
);

DROP TABLE IF EXISTS qlvt.company;
create table qlvt.company (
	company_id varchar primary key,
	company_name varchar unique not null,
	updated_timestamp timestamp,
    updated_user varchar
);

DROP TABLE IF EXISTS qlvt.user;
create table qlvt.user (
	user_id SERIAL PRIMARY KEY,
	username varchar unique not null,
	hashed_password varchar not null,
	email varchar unique not null,
	mobile_number varchar,
	role varchar,
	company_id varchar,
	updated_timestamp timestamp,
    updated_user varchar
);