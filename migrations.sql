CREATE TABLE shops (
    id SERIAL PRIMARY KEY,
    shopify_domain varchar(255) NOT NULL UNIQUE,
    access_token varchar(255) NOT NULL
);

CREATE TABLE spinner_settings (
    id SERIAL PRIMARY KEY,
    shop_id integer,
    primary_color varchar(7) NOT NULL,
    secondary_color varchar(7) NOT NULL
);

CREATE INDEX spinner_settings_shop_id ON spinner_settings(shop_id);
