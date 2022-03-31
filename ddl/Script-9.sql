create table shop.users (
	id serial primary key,
	username varchar(20) unique not null,
	password varchar(120) not null,
	email varchar(50) unique not null,
	role varchar(20) not null,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists shop.standards;
create table shop.standards (
	id serial primary key,
	standard_name varchar(200) unique not null,
	updated_timestamp timestamp,
    updated_user varchar
);