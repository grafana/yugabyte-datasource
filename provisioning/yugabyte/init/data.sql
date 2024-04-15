DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    employee_no integer,
    name text,
    department text,
    salary integer
);

INSERT INTO
    employees
VALUES
    (1, 'John Doe', 'Marketing', 2000),
    (2, 'Jane Smith', 'Legal', 2200),
    (3, 'Bob Johnson', 'Marketing', 3000),
    (4, 'Foo Bar', 'Engineering', 6000);