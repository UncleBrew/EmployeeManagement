"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Dynamically import the Client from pg module to ensure compatibility
        const pg = yield Promise.resolve().then(() => __importStar(require('pg')));
        const { Client } = pg.default; // Access the Client class correctly
        function connectWithRetry() {
            return __awaiter(this, void 0, void 0, function* () {
                let client;
                let retries = 5; // Number of retries
                while (retries) {
                    try {
                        client = new Client({
                            connectionString: process.env.DATABASE_URL // Use environment variable for connection string
                        });
                        yield client.connect();
                        console.log('Database connected successfully.');
                        return client;
                    }
                    catch (error) {
                        console.error(`Failed to connect to the database. Retries left: ${retries - 1}`);
                        console.error(error);
                        retries -= 1;
                        yield new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
                    }
                }
                throw new Error('Failed to connect to the database after several retries.');
            });
        }
        const client = yield connectWithRetry();
        const questions = [
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
                when: (answers) => answers.action === 'Add a department'
            },
            {
                type: 'input',
                name: 'roleTitle',
                message: 'Enter the title of the new role:',
                when: (answers) => answers.action === 'Add a role'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'Enter the salary of the new role:',
                when: (answers) => answers.action === 'Add a role'
            },
            {
                type: 'input',
                name: 'roleDepartmentId',
                message: 'Enter the department ID for the new role:',
                when: (answers) => answers.action === 'Add a role'
            },
            {
                type: 'input',
                name: 'employeeFirstName',
                message: 'Enter the first name of the new employee:',
                when: (answers) => answers.action === 'Add an employee'
            },
            {
                type: 'input',
                name: 'employeeLastName',
                message: 'Enter the last name of the new employee:',
                when: (answers) => answers.action === 'Add an employee'
            },
            {
                type: 'input',
                name: 'employeeRoleId',
                message: 'Enter the role ID for the new employee:',
                when: (answers) => answers.action === 'Add an employee'
            },
            {
                type: 'input',
                name: 'employeeManagerId',
                message: 'Enter the manager ID for the new employee (optional):',
                when: (answers) => answers.action === 'Add an employee'
            },
            {
                type: 'input',
                name: 'employeeIdToUpdate',
                message: 'Enter the ID of the employee whose role you want to update:',
                when: (answers) => answers.action === 'Update an employee role'
            },
            {
                type: 'input',
                name: 'newRoleId',
                message: 'Enter the new role ID for the employee:',
                when: (answers) => answers.action === 'Update an employee role'
            }
        ];
        function promptUser() {
            return __awaiter(this, void 0, void 0, function* () {
                const answers = yield inquirer_1.default.prompt(questions);
                try {
                    console.log(answers);
                    switch (answers.action) {
                        case 'View all departments':
                            const departments = yield client.query('SELECT * FROM department');
                            console.log(departments.rows);
                            break;
                        case 'View all roles':
                            const roles = yield client.query('SELECT * FROM roles');
                            console.log(roles.rows);
                            break;
                        case 'View all employees':
                            const employees = yield client.query('SELECT * FROM employee');
                            console.log(employees.rows);
                            break;
                        case 'Add a department':
                            yield client.query('INSERT INTO department (department_name) VALUES ($1)', [answers.departmentName]);
                            console.log(`Department ${answers.departmentName} added successfully.`);
                            break;
                        case 'Add a role':
                            yield client.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [answers.roleTitle, answers.roleSalary, answers.roleDepartmentId]);
                            console.log(`Role ${answers.roleTitle} added successfully.`);
                            break;
                        case 'Add an employee':
                            yield client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.employeeFirstName, answers.employeeLastName, answers.employeeRoleId, answers.employeeManagerId]);
                            console.log(`Employee ${answers.employeeFirstName} ${answers.employeeLastName} added successfully.`);
                            break;
                        case 'Update an employee role':
                            yield client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.newRoleId, answers.employeeIdToUpdate]);
                            console.log(`Employee ID ${answers.employeeIdToUpdate} role updated to ${answers.newRoleId}.`);
                            break;
                        case 'Exit':
                            console.log('Exiting...');
                            yield client.end(); // Close the database connection
                            return; // Exit the loop
                    }
                }
                catch (error) {
                    console.error('Error executing query', error);
                }
                // Prompt the user again after completing the action
                yield promptUser();
            });
        }
        // Start the prompt loop
        yield promptUser();
    });
}
main();
