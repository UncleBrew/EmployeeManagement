DO $$
DECLARE
BEGIN
    INSERT INTO department(id, department_name)
    VALUES
        (000, 'Analytics'),
        (001, 'Transportation'),
        (002, 'Athletics'),
        (003, 'Education'),
        (004, 'Agriculture');

    INSERT INTO roles(id, title, salary, department_id)
    VALUES
        (000, 'Software Engineer', 100000.00, 000),
        (001, 'teacher', 60000.00, 001),
        (002, 'Cat', 80000.00, 002),
        (003, 'Mom', 90000.00, 003),
        (004, 'Loan Officer', 110000.00, 004);

    INSERT INTO employee(id, first_name, last_name, role_id, manager_id)
    VALUES
        (000, 'Jesse', 'Lehrer', 000, 001),
        (001, 'Jerad', 'Lehrer', 001, 002),
        (002, 'Zuk', 'Lehrer', 002, 003),
        (003, 'Mary', 'Lehrer', 003, 004),
        (004, 'Jake', 'Lehrer', 004, 005);

    RAISE NOTICE 'Transaction complete';
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'An error occurred: %', SQLERRM;
        ROLLBACK;
END $$;

SELECT * FROM department;
SELECT * FROM roles;
SELECT * FROM employee;
