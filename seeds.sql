USE employees_DB;

INSERT INTO Departments (department_name) 
VALUES ('HR'), ('IT'), ('Warehouse'), ('Poduction'), ('Shipping'), ('Recieving');

INSERT INTO Roles (title, salary, department_id) 
VALUES ('Recruiter', 19000, 1), ('HR Manager', 70000, 1),
('Web Developer', 100000, 2), ('Warehouse Manager', 80000, 3), ('IT Manager', 90000, 2),
('Software Engineer', 130000, 3), ('Production Manager', 70000, 4), ('Shipping Manager', 70000, 5), ('Warehouse Manager 2', 120000, 3),
('Recieving Manager', 75000, 6);

INSERT INTO Employees (first_name, last_name, role_id, manager_id) 
VALUES ('Achraf', 'Chibane', 1, 4), ('Daniel', 'Conditt', 2, 4), ('Jaime', 'Laara', 3, 4), ('Steven', 'Stencil', 4, NULL),
('Eldwin', 'Morales', 5, 8), ('Sam', 'Smith', 6, 8);

SELECT * FROM Departments;
SELECT * FROM Roles;
SELECT * FROM Employees;



SELECT *
FROM Employees, Roles, Departments
WHERE Employees.role_id = Roles.role_id AND Roles.department_id = Departments.department_id;




SELECT Employees.id, CONCAT(Employees.first_name, ' ', Employees.last_name) AS 'employee', 
Employees.role_id, title AS 'role', Roles.department_id, department_name AS 'department', 
salary as 'salary', Employees.manager_id, CONCAT(Managers.first_name, ' ', 
Managers.last_name) AS 'manager'
FROM Employees
LEFT JOIN Roles ON Employees.role_id = Roles.role_id
LEFT JOIN Departments ON Roles.department_id = Departments.department_id
LEFT JOIN Employees AS Managers ON Employees.manager_id = Managers.id;


SELECT * FROM Employees
WHERE manager_id = 8;


SELECT Departments.department_id AS 'id', department_name AS 'department', 
CONCAT(Employees.first_name, ' ', Employees.last_name) AS 'employee', salary
FROM Departments
LEFT JOIN Roles ON Departments.department_id = Roles.department_id
LEFT JOIN Employees ON Employees.role_id = Roles.role_id;


SELECT Departments.department_id AS 'id', department_name AS 'department', SUM(salary)
FROM Departments
LEFT JOIN Roles ON Departments.department_id = Roles.department_id
LEFT JOIN Employees ON Employees.role_id = Roles.role_id
GROUP BY Departments.department_id, department_name



