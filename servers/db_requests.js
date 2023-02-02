
class DB {
    constructor() {
        this.prepareDB();
    }

    // TODO prepare DB method
    prepareDB()

    // TODO method that create user by object(user)
    // user = {first_name, second_name, role_id, email, password, photo_path}
    createUser(user)

    // TODO method that remove user with user_id = user_id
    removeUser(user_id)

    // TODO method that renames user
    // names = {first_name, second_name}
    renameUser(user_id, names)

    // TODO method that sets new photo
    editPhoto(user_id, photo)

    // TODO method that sets new password
    editPassword(user_id, password)

    // TODO method that sets new email
    editEmail(user_id, email)

    // TODO method that returns: user_id, first_name,
    // second_name, role, email, photo
    getInfo(user_id)

    // TODO method that returns password hash
    getPasswordHash(user_id)

    // TODO method that sets role of user
    setRole(user_id, new_role)

    // TODO method that sets new group
    setGroup(user_id, new_group_id)

    // TODO method that returns group_id
    getGroup(user_id)

    // TODO method that sets student as accepted
    acceptStudent(user_id)

    // TODO method that sets students as denied
    denyStudent(user_id)

    // TODO method that checks if student is verified
    isVerified(user_id)

    // TODO method that returns id of department where he is head.
    whoseHead(user_id)

    // TODO method that pin teacher to discipline
    pinToDiscipline(user_id, discipline_id)

    // TODO method that unpin teacher from discipline
    unpinFromDiscipline(user_id, discipline_id)

    // TODO method that returns list of disciplines of
    // teacher that he pinned to
    getDisciplineListOfTeacher(user_id)

    // TODO method that creates group from object
    // group = {department_id, full_name, short_name, train_area_code, form_year, course}
    createGroup(group)

    // TODO method that removes group with id
    removeGroup(group_id)

    // TODO method that returns group list
    getGroupList(department_id)

    // TODO method that return info about group
    // group_id, department_id, full_name, short_name,
    // train_code, form_year, course
    groupInfo(group_id)

    // TODO method that returns student list of group
    studentListOfGroup(group_id)
    

    // TODO method that returns all discipline of group
    disciplineList(group_id)

    // TODO method that returns can user see group
    canSeeGroup(group_id, user_id)

    // TODO method that creates new discipline in department
    // discipline = {department_id, name}
    createDiscipline(department_id, discipline)

    // TODO method that removes discipline by id
    removeDiscipline(discipline_id)

    // TODO method that sets new name of discipline
    setDisciplineName(discipline_id, name)

    // TODO method that info about discipline
    disciplineInfo(discipline_id)

    // TODO method that returns list of disciplines of department
    disciplineList(department_id)

    // TODO method that pins discipline to group
    pinDisciplineToGroup(group_id, discipline_id)

    // TODO method that unpins discipline from group
    unpinDisciplineFromGroup(group_id, discipline_id)

    // TODO method that returns can this user see this discipline
    canSeeDiscipline(user_id, discipline_id)

    // TODO method that creates department
    // department = {head_id, full_name, short_name}
    createDepartment(department)

    // TODO method that removes department
    removeDepartment(department_id)

    // TODO method that returns info about department
    departmentInfo(department_id)

    // TODO method that renames department
    // name = {full_name, short_name}
    renameDepartment(department_id, name)

    // TODO method that sets new head of department
    setDepartmentHead(department_id, user_id)
    
    // TODO method that returns list of students of department
    studentListOfDepartment(department_id)

    // TODO method that returns can user see this department
    canSeeDepartment(user_id, department_id)

    // TODO method that creates topic
    // topic = {subject_id, name}
    createTopic(topic)

    // TODO method that removes topic
    removeTopic(topic_id)

    // TODO method that renames topic
    renameTopic(topic_id, name)

    // TODO method that creates message
    // message = {user_id, topic_id, text, date, file}
    createsMessage(message)

    // TODO method that removes message
    removeMessage(message_id)

    // TODO method that edits text and date of message
    // info = {text, date}
    editMessage(message_id, info)

    // TODO method that edits message file
    editMessageFile(message_id, new_file)

    // TODO method that returns information about message
    messageInfo(message_id)

    // TODO method that returns messages in topic
    getTopicMessages(topic_id)

    // TODO method that returns can see user this topic
    canSeeTopic(user_id, topic_id)

};

let db = new DB();
module.exports = db;