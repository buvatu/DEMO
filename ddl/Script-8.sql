create table qlds.standard (
	standard_id varchar primary key,
	standard_name varchar unique not null,
	unit varchar,
	min_value varchar,
	max_value varchar,
	default_value varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.spec (
	spec_id varchar primary key,
	spec_name varchar unique not null,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.spec_standard (
    tech_spec_id serial primary key,
	spec_id varchar,
	standard_id varchar,
	standard_name varchar,
	value varchar,
	unit varchar,
	updated_timestamp timestamp,
    updated_user varchar,
    foreign key (spec_id) references qlds.spec (spec_id) on delete cascade,
    foreign key (standard_id) references qlds.standard (standard_id) 
);

create table qlds.material (
	material_id varchar primary key,
	material_name varchar unique not null,
	unit varchar,
	product_code varchar,
	material_group_id varchar,
	material_group_name varchar,
	minimum_quantity varchar,
	material_type_id varchar,
	material_type_name varchar,
	spec_id varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.engine (
	engine_id varchar primary key,
	company_id varchar,
	company_name varchar,
	engine_type varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.supplier (
	supplier_id varchar primary key,
	supplier_name varchar unique not null,
	tax_code varchar,
	phone_number varchar,
	description varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.scrap (
	material_id varchar primary key,
	material_name varchar unique not null,
	copper_volume varchar,
	aluminum_volume varchar,
	cast_iron_volume varchar,
	steel_volume varchar,
	other_volume varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.scrap_price (
	scrap_price_id serial primary key,
	company_id varchar,
	copper_price varchar,
	aluminum_price varchar,
	cast_iron_price varchar,
	steel_price varchar,
	other_price varchar,
	active_status varchar(1),
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists qlds.order_info;
create table qlds.order_info (
	order_id varchar primary key,
	company_id varchar,
	order_type varchar(1),
	order_name varchar,
	status varchar,
	consumer varchar,
	requestor varchar,
	request_note varchar,
	request_date timestamp,
	tester varchar,
	test_note varchar,
	test_date timestamp,
	approver varchar,
	approve_note varchar,
	approve_date timestamp,
	supplier varchar,
    no varchar,
    co varchar,
    recipeNo varchar,
    deliver varchar
);

create table qlds.order_details (
	order_details_id serial primary key,
	order_id varchar,
	material_id varchar,
	material_name varchar,
	unit varchar,
	quality varchar,
	quantity integer,
	amount decimal,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.order_change_history (
	order_change_id serial primary key,
	order_details_id varchar,
	changed_field varchar,
	old_value varchar,
	new_value varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.stock (
	stock_id serial primary key,
	company_id varchar,
	material_id varchar,
	quality varchar,
	quantity integer,
	amount decimal,
	updated_timestamp timestamp,
    updated_user varchar,
    unique (company_id, material_id, quality)
);

drop table if exists qlds.engine_analysis_info;
create table qlds.engine_analysis_info (
	engine_analysis_id varchar primary key,
	company_id varchar,
	engine_id varchar,
	engine_type varchar,
	repair_date date,
	repair_level varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists qlds.component;
create table qlds.component (
	component_id serial primary key,
	engine_analysis_id varchar,
	repair_part varchar,
	material_id varchar,
	material_name varchar,
	unit varchar,
	quantity integer,
	status varchar,
	measure varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

drop table if exists qlds.fuel_order;
create table qlds.fuel_order (
	fuel_order_id varchar primary key,
	fuel_order_type varchar(1),
	fuel_material_id varchar,
	fuel_material_name varchar,
	fuel_order_note varchar,
	fuel_quantity decimal,
	request_date date,
	recipe_no varchar,
	supplier varchar,
	consumer varchar,
	company_id varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

create table qlds.fuel_stock (
	fuel_material_id varchar,
	fuel_quantity decimal,
	company_id varchar,
	updated_timestamp timestamp,
    updated_user varchar
);
ALTER TABLE qlds.fuel_stock ADD CONSTRAINT material_company_key UNIQUE (fuel_material_id, company_id);

create table qlds.vcf (
	vcf_key varchar primary key,
	vcf varchar,
	company_id varchar,
	updated_timestamp timestamp,
    updated_user varchar
);

select * from qlds.material order by material_id;

update qlds.material set material_id = concat( substring(material_id, 3), '00' ) where material_id like '00%';