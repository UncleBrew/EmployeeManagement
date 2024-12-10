import inquirer from 'inquirer';
import { QuestionCollection } from 'inquirer';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    // Dynamically import the Client from pg module to ensure compatibility
    const pg = await import('pg');
    const { Client } = pg.default; // Access the Client class correctly

    async function connectWithRetry() {
        let client;
        let retries = 5; // Number of retries
        while (retries) {
            try {
                client = new Client({
                    connectionString: process.env.DATABASE_URL // Use environment variable for connection string
                });
                await client.connect();
                console.log('Database connected successfully.');
                return client;
            } catch (error) {
                console.error(`Failed to connect to the database. Retries left: ${retries - 1}`);
                console.error(error);
                retries -= 1;
                await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
            }
        }
        throw new Error('Failed to connect to the database after several retries.');
    }

    const client = await connectWithRetry();

    type Answers = {
        action: string;
        departmentName?: string;
        roleTitle?: string;
        roleSalary?: string;
        roleDepartmentId?: string;
        employeeFirstName?: string;
        employeeLastName?: string;
        employeeRoleId?: string;
        employeeManagerId?: string;
        employeeIdToUpdate?: string;
        newRoleId?: string;
    };

    const questions: QuestionCollection<Answers> = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        },
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:',
            when: (answers: Answers) => answers.action === 'Add a department'
        },
        {
            type: 'input',
            name: 'roleTitle',
            message: 'Enter the title of the new role:',
            when: (answers: Answers) => answers.action === 'Add a role'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'Enter the salary of the new role:',
            when: (answers: Answers) => answers.action === 'Add a role'
        },
        {
            type: 'input',
            name: 'roleDepartmentId',
            message: 'Enter the department ID for the new role:',
            when: (answers: Answers) => answers.action === 'Add a role'
        },
        {
            type: 'input',
            name: 'employeeFirstName',
            message: 'Enter the first name of the new employee:',
            when: (answers: Answers) => answers.action === 'Add an employee'
        },
        {
            type: 'input',
            name: 'employeeLastName',
            message: 'Enter the last name of the new employee:',
            when: (answers: Answers) => answers.action === 'Add an employee'
        },
        {
            type: 'input',
            name: 'employeeRoleId',
            message: 'Enter the role ID for the new employee:',
            when: (answers: Answers) => answers.action === 'Add an employee'
        },
        {
            type: 'input',
            name: 'employeeManagerId',
            message: 'Enter the manager ID for the new employee (optional):',
            when: (answers: Answers) => answers.action === 'Add an employee'
        },
        {
            type: 'input',
            name: 'employeeIdToUpdate',
            message: 'Enter the ID of the employee whose role you want to update:',
            when: (answers: Answers) => answers.action === 'Update an employee role'
        },
        {
            type: 'input',
            name: 'newRoleId',
            message: 'Enter the new role ID for the employee:',
            when: (answers: Answers) => answers.action === 'Update an employee role'
        }
    ];

    async function promptUser() {
        const answers = await inquirer.prompt<Answers>(questions);
        try {
            console.log(answers);
            switch (answers.action) {
                case 'View all departments':
                    const departments = await client.query('SELECT * FROM department');
                    console.log(departments.rows);
                    break;
                case 'View all roles':
                    const roles = await client.query('SELECT * FROM roles');
                    console.log(roles.rows);
                    break;
                case 'View all employees':
                    const employees = await client.query('SELECT * FROM employee');
                    console.log(employees.rows);
                    break;
                case 'Add a department':
                    await client.query('INSERT INTO department (department_name) VALUES ($1)', [answers.departmentName]);
                    console.log(`Department ${answers.departmentName} added successfully.`);
                    break;
                case 'Add a role':
                    await client.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [answers.roleTitle, answers.roleSalary, answers.roleDepartmentId]);
                    console.log(`Role ${answers.roleTitle} added successfully.`);
                    break;
                case 'Add an employee':
                    await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.employeeFirstName, answers.employeeLastName, answers.employeeRoleId, answers.employeeManagerId]);
                    console.log(`Employee ${answers.employeeFirstName} ${answers.employeeLastName} added successfully.`);
                    break;
                case 'Update an employee role':
                    await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.newRoleId, answers.employeeIdToUpdate]);
                    console.log(`Employee ID ${answers.employeeIdToUpdate} role updated to ${answers.newRoleId}.`);
                    break;
                case 'Exit':
                    console.log('Exiting...');
                    await client.end(); // Close the database connection
                    return; // Exit the loop
            }
        } catch (error) {
            console.error('Error executing query', error);
        }

        // Prompt the user again after completing the action
        await promptUser();
    }

    // Start the prompt loop
    await promptUser();
}

main();
