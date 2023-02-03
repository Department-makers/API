const sqlite3 = require('sqlite3');

class DB {

    constructor() {
        this.db = new sqlite3.Database('../data/Departament.db', (err) => {
            if (err)
                return console.error(err.message)
            console.log('Connected to Departament database')
        })
        this.db.run(`PRAGMA foreign_keys = 1`)
    }

    // user = {first_name, second_name, role_id, email, password, photo_path, is_verified}
    async createUser(user) {
        return new Promise( (resolve, reject) => {

            this.db.serialize( () => {
                this.db.get(
                    `INSERT INTO Users (first_name, second_name, role_id, email, password, photo_path, is_verified)
                VALUES ($first_name, $second_name, $role_id, $email, $password, $photo_path, $is_verified) 
                RETURNING user_id;`,
                    {
                        $first_name: user.first_name,
                        $second_name: user.second_name,
                        $role_id: user.role_id,
                        $email: user.email,
                        $password: user.password,
                        $photo_path: user.photo_path,
                        $is_verified: user.is_verified
                    }, (err, row) => {
                        if (err) {
                            reject(err)
                            console.log(err)
                        }
                        resolve(row)
                    })
            } )
        })
    }

    async addStudentWait(student_id, group_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `INSERT INTO Add_Students(student_id, group_id) 
                 VALUES($student_id, $group_id)`,
                {
                    $student_id : student_id,
                    $group_id : group_id
                }, (err) => {
                    if (err) {
                        reject(err)
                        console.log(err)
                    }
                    resolve()
                }
            )
        } )
    }

    async removeUser(user_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(`DELETE FROM Users WHERE user_id = ?;`,
                user_id, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    // names = {first_name, second_name}
    async renameUser(user_id, names) {
        return new Promise( (resolve, reject) => {
            this.db.run(`UPDATE Users
                     SET first_name = $first_name,
                         second_name = $second_name
                     WHERE user_id = $user_id;`,
                {
                    $first_name: names.first_name,
                    $second_name: names.second_name,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    async editPhoto(user_id, photo) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Users
            SET photo_path = $photo
            WHERE user_id = $user_id;`,
                {
                    $photo: photo,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    async editPassword(user_id, password) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Users 
                    SET password = $password
                    WHERE user_id = $user_id;`,
                {
                    $password: password,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    async editEmail(user_id, email) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Users
                     SET email = $email
                     WHERE user_id = $user_id;`,
                {
                    $email: email,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        })
    }

    // second_name, role, email, photo
    async getUserInfo(user_id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM Users_v
                     INNER JOIN Roles USING (role_id)
                     WHERE user_id = ?`, user_id,
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                })
        })
    }

    async getPasswordHash(user_id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT password FROM Users
                            WHERE user_id = ?`, user_id,
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                })
        })
    }

    async setRole(user_id, new_role) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Users 
                    SET role_id = $new_role
                    WHERE user_id = $user_id`,
                {
                    $new_role: new_role,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    //  method that sets new group
    async setGroup(user_id, new_group_id) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE Students SET group_id = $new_group
                     WHERE student_id = $user_id`,
                {
                    $new_group: new_group_id,
                    $user_id: user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        })
    }

    //  method that returns group_id
    async getGroup(student_id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT group_id FROM Students
                     WHERE student_id = ?`, student_id,
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                })
        })
    }

    async verifyList(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
                    s.student_id, 
                    u.first_name, 
                    u.second_name,
                    g.group_id, 
                    short_name,
                    full_name, 
                    course 
                 FROM Add_Students s
	             INNER JOIN Groups g ON s.group_id = g.group_id AND g.departament_id = $id
	             INNER JOIN Users u ON s.student_id = u.user_id;`,
                { $id : department_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    async departmentList() {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
                departament_id AS department_id,
                head_id, 
                full_name, 
                short_name
                FROM Departaments`,
                {}, (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        })
    }

    async groupList() {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
                group_id,
                departament_id AS department_id,
                full_name,
                short_name,
                train_area_code,
                form_year,
                course
                FROM Groups`, {} ,
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    //  method that sets student as accepted
    async acceptStudent(student_id, group_id) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(
                    `UPDATE Users
                    SET is_verified = 1
                    WHERE user_id = $id`,
                    { $id: student_id },
                    (err) => {
                        if (err)
                            reject(err)
                    }
                ).run(
                    `DELETE FROM Add_Students
                     WHERE student_id = $id`,
                    { $id : student_id },
                    (err) => {
                        if (err)
                            reject(err)
                    }
                ).run(
                    `INSERT INTO Students(student_id, group_id)
                     VALUES($id, $group_id)`,
                    {
                        $id : student_id,
                        $group_id : group_id
                    }, (err) => {
                        if (err)
                            reject(err)
                        resolve()
                    }
                )
            })
        })
    }

    //  method that sets students as denied
    async denyStudent(student_id) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(
                    `DELETE FROM Add_Students WHERE student_id = $id`,
                    {$id: student_id},
                    (err) => {
                        if (err)
                            reject(err)
                    }
                ).run(
                    `DELETE FROM Users WHERE user_id = $id`,
                    {$id: student_id},
                    (err) => {
                        if (err)
                            reject(err)
                        resolve()
                    }
                )
            })
        })
    }

    async isVerified(user_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(`SELECT is_verified FROM Users u 
                           WHERE user_id = ?;`, user_id,
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_verified)
                })
        } )
    }

    //  method that returns id of department where he is head.
    async whoseHead(teacher_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(`SELECT whose_head FROM Teachers
                    WHERE teacher_id = ?`, teacher_id,
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                })
        })
    }

    //  method that pin teacher to discipline
    async pinToSubject(teacher_id, subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(`UPDATE Groups_Subjects
                     SET teacher_id = $teacher_id
                     WHERE group_subj_id = $group_subj_id;`,
                {
                    $teacher_id : teacher_id,
                    $group_subj_id : subject_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        } )
    }

    //  method that unpin teacher from discipline
    async unpinFromSubject(subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(`UPDATE Groups_Subjects
                     SET teacher_id = NULL
                     WHERE group_subj_id = $group_subj_id;`,
                { $group_subj_id : subject_id },
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        } )
    }

    async subjectInfo(subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT group_subj_id AS subject_id, 
	            subject_id AS discipline_id,
	            group_id, 
	            s.name AS subject_name,
	            g.full_name AS group_fname, 
	            g.short_name AS group_sname,
	            g.course AS course
                FROM Groups_Subjects gs 
	            INNER JOIN Groups g USING(group_id)
	            INNER JOIN Subjects s USING(subject_id)
                WHERE group_subj_id = $id
                ORDER BY course;`,
                { $id : subject_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that returns list of groups_subjects of
    // teacher that he pinned to
    async getSubjectListOfTeacher(teacher_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT group_subj_id, 
	        subject_id,
	        group_id, 
	        s.name AS subject_name,
	        g.full_name AS group_fname, 
	        g.short_name AS group_sname,
	        g.course AS course
            FROM Groups_Subjects gs 
	        INNER JOIN Groups g USING(group_id)
	        INNER JOIN Subjects s USING(subject_id)
            WHERE teacher_id = $teacher_id
            ORDER BY course;`,
                { $teacher_id : teacher_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                })
        } )
    }

    // method that creates group from object
    // group = {department_id, full_name, short_name, train_area_code, form_year, course}
    async createGroup(group) {
        return new Promise( (resolve, reject) => {
            this.db.get(`
            INSERT INTO Groups(departament_id, full_name, short_name, train_area_code, form_year, course)
            VALUES
	        ($departament_id, $full_name, $short_name, $train_area_code, $form_year, $course)
            RETURNING group_id;`,
                {
                    $departament_id : group.department_id,
                    $full_name : group.full_name,
                    $short_name : group.short_name,
                    $train_area_code : group.train_area_code,
                    $form_year : group.form_year,
                    $course : group.course
                }, (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that removes group with id
    async removeGroup(group_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Groups 
             WHERE group_id = $group_id`,
                {$group_id : group_id},
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                })
        } )
    }

    //  method that returns group list
    async getGroupList(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
                    group_id, 
                    departament_id AS department_id,
                    full_name,
                    short_name, 
                    train_area_code,
                    form_year, 
                    course
                FROM Groups g
            WHERE departament_id = $departament_id
            ORDER BY course;`,
                { $departament_id : department_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    //  method that return info about group
    // group_id, department_id, full_name, short_name,
    // train_code, form_year, course
    async groupInfo(group_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT
                    group_id, 
                    departament_id AS department_id,
                    full_name,
                    short_name, 
                    train_area_code,
                    form_year, 
                    course
                 FROM Groups g 
             WHERE group_id = $group_id;`,
                { $group_id : group_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that returns student list of group
    async studentListOfGroup(group_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT u.user_id, u.first_name, u.second_name, u.photo_path
             FROM Users_v u 
             INNER JOIN Students s ON s.group_id = $group_id AND u.user_id = s.student_id`,
                { $group_id : group_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }


    //  method that returns all discipline of group
    async subjectList(group_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT group_subj_id AS subject_id, 
	        subject_id AS discipline_id, 
	        s.name
            FROM Groups_Subjects gs 
	        INNER JOIN Subjects s USING (subject_id)
            WHERE group_id = $group_id;`,
                { $group_id : group_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    //  method that returns can student see group
    async canStudentSeeGroup(group_id, student_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT group_id FROM Students
             WHERE student_id = $id AND group_id = $group_id`,
                {
                    $id : student_id,
                    $group_id : group_id
                }, (err, row) => {
                    if (err)
                        reject(err)
                    if (row.length === 0)
                        resolve(false)
                    else resolve(true)
                }
            )
        } )
    }

    //  method that returns can user see group
    async canHeadSeeGroup(group_id, head_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT group_id FROM Groups g
               INNER JOIN Departaments USING (departament_id)
            WHERE head_id = $id AND group_id = $group_id`,
                {
                    $id : head_id,
                    $group_id : group_id
                }, (err, row) => {
                    if (err)
                        reject(err)
                    if (row.length === 0)
                        resolve(false)
                    else resolve(true)
                }
            )
        } )
    }

    //  method that creates new subject in department
    // subject = {department_id, name}
    async createDiscipline(discipline) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `INSERT INTO Subjects (departament_id, name)
             VALUES ($departament_id, $name)
             RETURNING subject_id AS discipline_id;`,
                {
                    $departament_id : discipline.departament_id,
                    $name : discipline.name
                }, (err, row) => {
                    if (err)
                        return reject(err)
                    return resolve(row)
                }
            )
        } )
    }

    //  method that removes discipline by id
    async removeDiscipline(discipline_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Subjects WHERE subject_id = $subject_id;`,
                { $subject_id : discipline_id },
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that sets new name of discipline
    async setDisciplineName(discipline_id, name) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `UPDATE Subjects
             SET name = $name
             WHERE subject_id = $id;`,
                {
                    $id : discipline_id,
                    $name : name
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that info about discipline
    async disciplineInfo(discipline_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT 
                    subject_id AS discipline_id,
                    departament_id AS department_id,
                    name
                 FROM Subjects WHERE subject_id = $subject_id`,
                { $subject_id : discipline_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that returns list of disciplines of department
    async disciplineList(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
                    subject_id AS discipline_id,
                    departament_id AS department_id,
                    name
                FROM Subjects WHERE departament_id = $departament_id`,
                { $departament_id : department_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    //  method that pins subject to group
    async pinDisciplineToGroup(group_id, discipline_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `INSERT INTO Groups_Subjects (subject_id, group_id)
             VALUES ($subject_id, $group_id)
             RETURNING group_subj_id AS subject_id;`,
                {
                    $subject_id : discipline_id,
                    $group_id : group_id
                }, (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                } )
        } )
    }

    //  method that unpins discipline from group
    async unpinDisciplineFromGroup(subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Groups_Subjects WHERE group_subj_id = $id`,
                { $id : subject_id },
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        })
    }

    //  method that creates department.
    // department = {head_id, full_name, short_name}
    async createDepartment(department) {
        return new Promise ( (resolve, reject) => {
            this.db.get(
                `INSERT INTO Departaments (head_id, full_name, short_name)
             VALUES ($head_id, $full_name, $short_name)
             RETURNING departament_id; AS department_id`,
                {
                    $head_id : department.head_id,
                    $full_name : department.full_name,
                    $short_name : department.short_name
                }, (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that removes department
    async removeDepartment(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Departaments WHERE departament_id = $id`,
                { $id : department_id },
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that returns info about department
    async departmentInfo(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT 
                    departament_id AS department_id,
                    head_id, full_name, short_name
                FROM Departaments WHERE departament_id = $id;`,
                { $id : department_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that renames department
    // name = {full_name, short_name}
    async renameDepartment(department_id, name) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `UPDATE Departaments 
             SET full_name = $fname,
                short_name = $sname
             WHERE departament_id = $id`,
                {
                    $fname : name.full_name,
                    $sname : name.short_name,
                    $id : department_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that sets new head of department
    async setDepartmentHead(department_id, head_id) {
        return new Promise((resolve, reject) => {
            this.db.serialize( () => {
                this.db.run(
                    `UPDATE Departaments
                    SET head_id = $head_id 
                    WHERE departament_id = $departament_id`,
                    {
                        $head_id : head_id,
                        $departament_id : department_id
                    }, (err) => {
                        if (err)
                            return reject(err)
                        resolve()
                    }
                )
            } )
        })
    }

    //  method that returns list of students of department
    async studentListOfDepartment(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT 
	            u.user_id,
	            u.first_name,
	            u.second_name,
	            g.group_id,
	            g.full_name
            FROM Departaments d 
	            INNER JOIN Groups g ON d.departament_id = g.departament_id AND d.departament_id = $id
	            INNER JOIN Students s USING (group_id)
	            INNER JOIN Users u ON s.student_id = u.user_id
            ORDER BY g.course, g.group_id`,
                { $id : department_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    //  method that returns can user see this department
    async canSeeDepartment(user_id, department_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT department_id AS departament_id 
                FROM Departaments 
                WHERE departament_id = $dep_id AND head_id = $id`,
                {
                    $dep_id : department_id,
                    $id : user_id
                }, (err, row) => {
                    if (err)
                        reject(err)
                    if (row.length === 0)
                        resolve(false)
                    resolve(true)
                }
            )
        } )
    }

    //  method that creates topic
    // topic = {subject_id, name}
    async createTopic(topic) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `INSERT INTO Chapters (group_subj_id, name)
            VALUES
	            ($group_subj_id, $name)
	        RETURNING chapter_id AS topic_id;`,
                {
                    $group_subj_id : topic.subject_id,
                    $name : topic.name
                }, (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    // method that removes topic
    async removeTopic(topic_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Chapters WHERE chapter_id = $id;`,
                { $id : topic_id },
                (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    // method that renames topic
    async renameTopic(topic_id, name) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `UPDATE Chapters
                SET name = $name
                WHERE chapter_id = $topic_id;`,
                {
                    $name : name,
                    $topic_id : topic_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that creates message
    // message = {user_id, topic_id, text, date, file}
    async createMessage(message) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `INSERT INTO Messages (chapter_id, user_id, send_time, message, png_file)
            VALUES ($chapter_id, $user_id, $date, $message, $file)
            RETURNING message_id`,
                {
                    $chapter_id : message.topic_id,
                    $user_id : message.user_id,
                    $date : message.date,
                    $message : message.text,
                    $file : message.file
                }, (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that removes message
    async removeMessage(message_id, user_id) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `DELETE FROM Messages
                 WHERE message_id = $id AND user_id = $user_id;`,
                {
                    $id : message_id,
                    $user_id : user_id
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that edits text and date of message
    async editMessage(user_id, message_id, text) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `UPDATE Messages 
            SET message = $text,
	        is_changed = 1
            WHERE message_id = $id AND user_id = $user_id;`,
                {
                    $id : message_id,
                    $user_id : user_id,
                    $text : text
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that edits message file
    async editMessageFile(user_id, message_id, new_file) {
        return new Promise( (resolve, reject) => {
            this.db.run(
                `UPDATE Messages
            SET 
           	is_changed = 1, 
	        png_file = $file
            WHERE message_id = $id AND user_id = $user_id;`,
                {
                    $id : message_id,
                    $user_id : user_id,
                    $file : new_file
                }, (err) => {
                    if (err)
                        reject(err)
                    resolve()
                }
            )
        } )
    }

    //  method that returns information about message
    async getMessageInfo(message_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT * FROM Messages
                WHERE message_id = $id`,
                { $id : message_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    //  method that returns messages in topic
    async getTopicMessages(topic_id) {
        return new Promise( (resolve, reject) => {
            this.db.all(
                `SELECT * FROM Messages 
                WHERE chapter_id = $id;`,
                { $id : topic_id },
                (err, rows) => {
                    if (err)
                        reject(err)
                    resolve(rows)
                }
            )
        } )
    }

    // method that returns user_id of user with such email
    async findUserByEmail(email) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT user_id FROM Users_v 
                WHERE email = $email`,
                { $email : email },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }

    // check does user exist with this email
    async userEmailExists(email) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT email
                FROM Users
                WHERE email = $email
            ) AS is_exist`,
                { $email : email },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does user exist with this user_id
    async userExists(user_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT user_id
                FROM Users
                WHERE user_id = $id
            ) AS is_exist`,
                { $id : user_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does group exist with this group_id
    async groupExists(group_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT group_id
                FROM Groups
                WHERE group_id = $id
            ) AS is_exist`,
                { $id : group_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does subject exist with this subject_id
    async disciplineExists(subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT subject_id
                FROM Subjects
                WHERE subject_id = $id
            ) AS is_exist`,
                { $id : subject_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does department exist with this department_id
    async departmentExists(department_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT departament_id AS department_id
                FROM Departaments
                WHERE departament_id = $id
            ) AS is_exist`,
                { $id : department_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does group-subject exist with this id
    async subjectExists(subject_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT group_subj_id AS subject_id
                FROM Groups_Subjects
                WHERE group_subj_id = $id
            ) AS is_exist`,
                { $id : subject_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does topic exist with this topic_id
    async topicExists(topic_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT chapter_id
                FROM Chapters
                WHERE chapter_id = $id
            ) AS is_exist`,
                { $id : topic_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    // check does message exist with this message_id
    async messageExists(message_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `SELECT EXISTS(
                SELECT message_id
                FROM Messages
                WHERE message_id = $id
            ) AS is_exist`,
                { $id : message_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(!!row.is_exist)
                }
            )
        } )
    }

    async addRefreshToken(user_id) {
        return new Promise( (resolve, reject) => {
                this.db.get(
                    `INSERT INTO RefreshTokens(user_id)
                 VALUES($user_id) 
                 RETURNING token_id`,
                    { $user_id : user_id },
                    (err, row) => {
                        if (err)
                            reject(err)
                        resolve(row)
                    })
            }
        )
    }

    async getRefreshToken(token_id) {
        return new Promise( (resolve, reject) => {
            this.db.get(
                `DELETE FROM RefreshTokens
                 WHERE token_id = $id 
                 RETURNING user_id`,
                { $id : token_id },
                (err, row) => {
                    if (err)
                        reject(err)
                    resolve(row)
                }
            )
        } )
    }


}

let db = new DB();
module.exports = db;