// Import the mysql2 library for connecting to a MySQL database
const mysql = require("mysql2/promise");
// Define a Query class for executing CRUD operations on a database
class Query {
    // Constructor that initializes the object properties
    constructor(crud, table, options, where, ...columns) {
        this.crud = crud;
        this.table = table;
        this.options = options;
        this.where = where;
        this.columns = columns;
        this.query = '';
        this.data;
        this.message;
    }
    // Method that builds and executes the SQL query based on the CRUD operation
    async buildQuery() {
        // Switch statement that builds a different SQL query based on the CRUD operation
        switch (this.crud) {
            // If the CRUD operation is Create, insert a new record into the table
            case 'Create':
                this.query = `INSERT INTO ${this.table} SET ?`;
                this.data = await this.runQuery();
                this.message = `New record has been created.`
                break;
            // If the CRUD operation is Read, select all columns from the table
            case 'Read':
                this.query = `SELECT ${this.columns} FROM ${this.table}`;
                this.data = await this.runQuery();
                this.message = `Table: ${this.table}`
                break;
             // If the CRUD operation is Update, update the record that matches the where clause
            case 'Update':
                this.query = `UPDATE ${this.table} SET ? WHERE ${this.where}`;
                this.data = await this.runQuery();
                this.message = `Record has been updated`;
                break;
            // If the CRUD operation is Delete, delete the record that matches the where clause
            case 'Delete':
                this.query = `DELETE FROM ${this.table} WHERE ${this.where}`
                this.data = await this.runQuery();
                this.message = `Record has been deleted`
                break;
             // If the CRUD operation is Read Where, select records that match the where clause
            case 'Read Where':
                this.query = `SELECT ${this.columns} FROM ${this.table} WHERE ${this.where}`;
                this.data = await this.runQuery();
                this.message = `Employees with ${this.where}`
                break;
            // If the CRUD operation is Read All, select all columns from multiple tables using JOIN statements
            case 'Read All':
                this.query = `
                    SELECT ${this.columns} FROM ${this.table}
                    LEFT JOIN Roles ON Employees.role_id = Roles.role_id
                    LEFT JOIN Departments ON Roles.department_id = Departments.department_id
                    LEFT JOIN Employees AS Managers ON Employees.manager_id = Managers.id;
                `;
                this.data = await this.runQuery();
                this.message = `You are currently in the main view.`
                break;
            // If the CRUD operation is Read Total Budget, select the total budget by department
            case 'Read Total Budget':
                this.query = `
                    SELECT ${this.columns} FROM ${this.table}
                    LEFT JOIN Roles ON Departments.department_id = Roles.department_id
                    LEFT JOIN Employees ON Employees.role_id = Roles.role_id;
                `;
                this.data = await this.runQuery();
                this.message = `Total Budget By Department`
                break;
        }
        // Return an object containing the query results, a message, and query options
        return { data: this.data, message: this.message, fields: this.options };
    }
    // Method that runs the SQL query and returns the query results
    async runQuery() {
        try {
            const connection = await mysql.createConnection({
                port: 3306,
                user: 'root',
                password: 'TaekwondoSigus4989@$',
                database: 'employees_DB'
            });
            const [data] = await connection.query(this.query, this.options);
            await connection.end();
            return data;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Query;