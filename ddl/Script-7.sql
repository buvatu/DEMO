drop table if exists qlds.company;
create table qlds.company (
	company_id varchar primary key,
	company_name varchar unique not null,
	address varchar,
	phone_number varchar,
	tax_code varchar,
	director varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists qlds.user;
create table qlds.user (
	user_id varchar primary key,
	username varchar,
	hashed_password varchar not null,
	email varchar unique not null,
	sex varchar(1),
	dob date,
	phone_number varchar,
	role varchar,
	role_name varchar,
	address varchar,
	active_status varchar,
	salt varchar not null,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists qlds.account;
create table qlds.account (
   account_id serial primary key,
   user_id varchar,
   company_id varchar,
   updated_timestamp timestamp,
   updated_user varchar,
   foreign key (user_id) references qlds.user (user_id) on delete cascade,
   foreign key (company_id) references qlds.company (company_id) 
);

delete from qlds.material;
select count (*) from qlds.material;