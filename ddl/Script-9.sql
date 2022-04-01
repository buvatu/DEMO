-- AUTH --
drop table if exists shop.users;
create table shop.users (
	id serial primary key,
	username varchar(20) unique not null,
	password varchar(120) not null,
	fullname varchar(200),
	email varchar(50) unique not null,
	role varchar(20) not null,
	updated_timestamp timestamp,
    updated_user varchar
);

-- OTHERS --
drop table if exists shop.categories;
create table shop.categories (
	id serial primary key,
	category_name varchar(200) unique not null,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists shop.specs;
create table shop.specs (
	id serial primary key,
	spec_name varchar(200) unique not null,
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

drop table if exists shop.spec_standard;
create table shop.spec_standard (
	id serial primary key,
	spec_id integer not null,
	standard_id integer not null,
	standard_value varchar(200),
	updated_timestamp timestamp,
    updated_user varchar,
    foreign key (spec_id) references shop.specs (id) on delete cascade,
    foreign key (standard_id) references shop.standards (id)
);

drop table if exists shop.products;
create table shop.products (
	id serial primary key,
	product_name varchar(200) unique not null,
	cost_price numeric,
	selling_price numeric,
	description varchar(500),
	category_id integer,
	spec_id integer,
	updated_timestamp timestamp,
    updated_user varchar,
    foreign key (spec_id) references shop.specs (id) on delete cascade,
    foreign key (category_id) references shop.categories (id)
);

