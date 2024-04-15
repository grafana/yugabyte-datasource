-- Clear out the tables if they already exist.
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;

-- Create the four tables necessary to store the data.
\i share/schema.sql;

-- Now load the data into the tables.
\i share/products.sql;
\i share/users.sql;
\i share/orders.sql;
\i share/reviews.sql;
