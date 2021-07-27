create table if not exists users
(
    id           serial                not null
        constraint users_pk
            primary key,
    firstname    varchar(25)           not null,
    lastname     varchar(25)           not null,
    username     varchar(25)           not null,
    email        varchar(50)           not null,
    address      varchar(200)          not null,
    phone_number varchar(25)           not null,
    user_type    varchar(25)           not null,
    password     varchar(100)          not null,
    verified     boolean default false not null,
    balance      integer default 0     not null
);

alter table users
    owner to movus;

create unique index if not exists users_email_uindex
    on users (email);

create unique index if not exists users_username_uindex
    on users (username);

create table if not exists verification_token
(
    id         serial      not null
        constraint verification_table_pk
            primary key,
    token      varchar(50) not null,
    user_id    integer     not null
        constraint verification_table_users_id_fk
            references users
            on update cascade on delete cascade,
    expiration bigint      not null
);

alter table verification_token
    owner to movus;

create unique index if not exists verification_table_token_uindex
    on verification_token (token);

create table if not exists password_token
(
    id         serial  not null
        constraint password_token_pk
            primary key,
    token      varchar not null,
    user_id    integer not null
        constraint password_token_users_id_fk
            references users
            on update cascade on delete cascade,
    expiration bigint  not null
);

alter table password_token
    owner to movus;

create unique index if not exists password_token_token_uindex
    on password_token (token);

create table if not exists cars
(
    id              serial                not null
        constraint cars_pk
            primary key,
    car_type        varchar               not null,
    brand           varchar               not null,
    color           varchar               not null,
    production_year integer               not null,
    cost            integer               not null,
    quantity        integer default 0     not null,
    created_at      date    default now() not null,
    deleted_at      date,
    image_url       varchar
);

alter table cars
    owner to movus;

create table if not exists ongoing_transactions
(
    id         serial             not null,
    user_id    integer            not null
        constraint ongoing_transactions_users_id_fk
            references users
            on update cascade on delete cascade,
    cars_id    integer            not null
        constraint ongoing_transactions_cars_id_fk
            references cars
            on update cascade on delete cascade,
    created_at date default now() not null,
    constraint ongoing_transactions_pk
        primary key (user_id, cars_id)
);

alter table ongoing_transactions
    owner to movus;

create table if not exists finished_transaction
(
    id         serial             not null
        constraint finished_transaction_pk
            primary key,
    user_id    integer            not null
        constraint finished_transaction_users_id_fk
            references users
            on update cascade on delete cascade,
    cars_id    integer            not null
        constraint finished_transaction_cars_id_fk
            references cars
            on update cascade on delete cascade,
    status     varchar            not null,
    created_at date default now() not null
);

alter table finished_transaction
    owner to movus;