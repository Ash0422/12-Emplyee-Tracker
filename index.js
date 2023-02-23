// Import required packages
const inquirer = require("inquirer");
const Query = require("./lib/queries");
const logo = require('asciiart-logo');
const config = require('./package.json');

// Function that presents the initial prompt to the user
const selectCRUD = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'crud',
            message: 'What would you like to do?',
            choices: ['Create', 'Read', 'Update', 'Delete', 'Exit'], 
        }
    ]).then((answer) => {
        // If the user selects "Exit," terminate the process
        if (answer.crud === 'Exit') {
            process.exit();
        } 
        // Otherwise, call selectTable with the user's selection
        else {
            selectTable(answer.crud);
        }
    });
}
// Function that presents the user with a list of tables from which to select
const selectTable = async (crud) => {
    let choices = [];
    if (crud === 'Read') {
          // If the user selected "Read," display a list of read options
        choices = ['Employees', 'Employees by Manager', 'Roles', 'Departments', 'Departments with Total Budget', '<- Back'];
    } else {
        // Otherwise, display a list of create, update, and delete options
        choices = ['Employees', 'Roles', 'Departments', '<- Back'];
    }
    // Prompt the user for their selection
    let answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'table',
            message: 'On which table would you like to perform your tasks?',
            choices: choices
        }
    ]);
     // If the user selects "<- Back," return to the previous prompt
    if (answer.table === '<- Back') {
        selectCRUD();
    }
    else if (crud === 'Read') {
        selectOptions(crud, answer.table);
    } 
    // Otherwise, call displayTable to display the updated table and then call selectOptions with the selected CRUD operation and table
    else {
        await displayTable(answer.table);
        await selectOptions(crud, answer.table);
    }
}
// Function that determines what fields, where clauses, and columns are required for the selected CRUD operation and table
const selectOptions = async (crud, table) => {
 
    let fields;
    let where = '';
    let updateAnswer;
    let columns = '*';
    if (crud === 'Create' && table === 'Employees') {
        fields = await protEmployees();
    } else if (crud === 'Create' && table === 'Roles') {
        fields = await protRole();
    } else if (crud === 'Create' && table === 'Departments') {
        fields = await protDepartment();
    }
    else if (crud === 'Read' && table !== 'Employees by Manager' && table !== 'Departments with Total Budget') {
        fields = {};
    } else if (crud === 'Read' && table === 'Employees by Manager') {
        updateAnswer = await proManager();
        where = `manager_id=${updateAnswer.manager_id}`;
        crud = 'Read Where';
        table = 'Employees';
        fields = 'Employees by Manager';
    } else if (crud === 'Read' && table === 'Departments with Total Budget') {
        console.log(`crud === 'Read' && table === 'Departments with Total Budget'`);
        crud = 'Read Total Budget';
        table = 'Departments';
        columns = `
        Departments.department_id AS 'id', department_name AS 'department', 
        CONCAT(Employees.first_name, ' ', Employees.last_name) AS 'employee', salary
        `;
    }
    else if (crud === 'Update' && table === 'Employees') {
        updateAnswer = await updateEmployees();
        fields = updateAnswer.fields;
        where = updateAnswer.where;
    } else if (crud === 'Update' && table === 'Roles') {
        updateAnswer = await updateRoles();
        fields = updateAnswer.fields;
        where = updateAnswer.where;
    } else if (crud === 'Update' && table === 'Departments') {
        updateAnswer = await updateDepartment();
        fields = updateAnswer.fields;
        where = updateAnswer.where;
    } 
    else if (crud === 'Delete' && table === 'Employees') {
        updateAnswer = await deleteEmployee();
        where = `id=${updateAnswer.id}`;
    } else if (crud === 'Delete' && table === 'Roles') {
        updateAnswer = await deleteRole();
        where = `role_id=${updateAnswer.role_id}`;
    } else if (crud === 'Delete' && table === 'Departments') {
        updateAnswer = await deleteDepartment();
        where = `department_id=${updateAnswer.department_id}`;
    }
    runMainQuery(crud, table, fields, where, columns);
}

const proManager = async () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'manager_id',
            message: 'manager_id: '
        }
    ]);
}
// function to delete a department
const deleteDepartment = async () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'department_id',
            message: 'department_id: '
        }
    ]);
}

// function to delete a role
const deleteRole = async () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'role_id',
            message: 'role_id: '
        }
    ]);
}
// function to delete an employee
const deleteEmployee = async () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'id: '
        }
    ]);
}
// function to update a department
const updateDepartment = async () => {
    let answer1 = await inquirer.prompt([
        {
            type: 'input',
            name: 'department_id',
            message: 'department_id: '
        }
    ]);

    const query5 = await new Query('Read Where', 'Departments', [{}], `department_id=${answer1.department_id}`, '*').buildQuery();
    let answer2 = await inquirer.prompt([
        {
            type: 'input',
            name: 'department_name',
            message: 'department_name:',
            default: query5.data[0].department_name
        }
    ]);
    return { where: `department_id=${answer1.department_id}`, fields: answer2 }
}

// function to update a Role
const updateRoles = async () => {
    let answer1 = await inquirer.prompt([
        {
            type: 'input',
            name: 'role_id',
            message: 'role_id: '
        }
    ]);
    const query4 = await new Query('Read Where', 'Roles', [{}], `role_id=${answer1.role_id}`, '*').buildQuery();
    let answer2 = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'title:',
            default: query4.data[0].title
        },
        {
            type: 'input',
            name: 'salary',
            message: 'salary:',
            default: query4.data[0].salary
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'department_id:',
            default: query4.data[0].department_id
        }
    ]);
    return { where: `role_id=${answer1.role_id}`, fields: answer2 }
}

// function to update an employee
const updateEmployees = async () => {
    let answer1 = await inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'id: '
        }
    ]);
    const query3 = await new Query('Read Where', 'Employees', [{}], `id=${answer1.id}`, '*').buildQuery();
    let answer2 = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'first_name:',
            default: query3.data[0].first_name
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'last_name:',
            default: query3.data[0].last_name
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'role_id:',
            default: query3.data[0].role_id
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'manager_id:',
            default: query3.data[0].manager_id
        }
    ]);
    return { where: `id=${answer1.id}`, fields: answer2 }
}


// function to prompt a department
const protDepartment = async () => {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'department_name',
            message: 'department_name: '
        }
    ]);
}
// function to prompt a role
const protRole = async () => {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'title: '
        },
        {
            type: 'input',
            name: 'salary',
            message: 'salary: '
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'department_id: '
        },
    ]);
}
// function to prompt an employee
const protEmployees = async () => {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'first_name: '
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'last_name: '
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'role_id: '
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'manager_id: '
        }
    ]);
}
// run the main query
const runMainQuery = async (crud, table, fields, where, ...columns) => {
    const queryTwo = await new Query(crud, table, [fields], where, columns).buildQuery();
    console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n✅ ${queryTwo.message}`)
    if (crud === 'Read' || crud === 'Read Where' && queryTwo.fields[0] === 'Employees by Manager' || crud === 'Read Total Budget') {
        console.table(queryTwo.data);
    } else {
        await displayTable(table, queryTwo.message);
    }
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to continue'
        }
    ]);
    await disAll();
    await selectCRUD();
}
// display table
const displayTable = async (table, queryTwoMessage) => {
    const queryOne = await new Query('Read', table, [{}], '', '*').buildQuery();
    if (queryTwoMessage === true) {
        console.log(`${queryOne.message}`)
    } else {
        console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n${queryOne.message}`)
    }
    
    console.table(queryOne.data);
}
//  display All queries
const disAll = async () => {
    const queryZero = await new Query('Read All', 'Employees', [{}], '', `
        Employees.id, CONCAT(Employees.first_name, ' ', Employees.last_name) AS 'employee', 
        Employees.role_id, title AS 'role', Roles.department_id, department_name AS 'department', 
        salary as 'salary', Employees.manager_id, CONCAT(Managers.first_name, ' ', 
        Managers.last_name) AS 'manager'
    `).buildQuery();
    console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n${queryZero.message}`)
    console.table(queryZero.data);
}

const init = async () => {
    displayAscii();
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to start'
        }
    ]);
    await disAll();
    await selectCRUD();
}

// display ascii logo on screen
const displayAscii = () => {
    console.log(logo(config).render());
}

init();