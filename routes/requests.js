const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require("../config/config.js");

const db = require('../servers/db_requests.js');
const auth = require('../servers/auth.js');
const {
    encode_body
} = require('../config/config.js');


router.use('/create_user', async (req, res) => {

    if (await db.existsUserEmail(res.locals.request.email))
        res.locals.result = {
            code: 1
        }
    else {
        res.locals.result = {
            code: 0,
            user_id: await db.createUser(res.locals.request)
        }
        if (res.locals.request.role_id == 1)
            db.setGroup(res.locals.result.user_id, req.locals.request.group_id)
    }
    res.json(res.locals.result)
})

router.use('/remove_user', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        db.removeUser(res.locals.request.user_id)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/update_user', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        db.renameUser(res.locals.request.user_id, res.locals.request)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result);
})

router.use('/update_user_photo', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        if (typeof res.locals.request.photo == "string") {
            db.editPhoto(res.locals.request.user_id, res.locals.request.photo)
            res.locals.result = {
                code: 0
            }
        } else {
            res.locals.result = {
                code: 2
            }
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/update_password', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        db.editPassword(res.locals.request.user_id, config.get_password_hash(res.locals.request.password))
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/update_email', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        if (await db.userEmailExists(res.locals.request.email)) {
            db.editEmail(res.locals.request.user_id, res.locals.request.email);
            res.locals.result = {
                code: 0
            }
        } else {
            res.locals.result = {
                code: 2
            }
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result);
})

router.use('/user_info', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id)) {
        res.locals.result = await db.userInfo(res.locals.request.user_id);
        res.locals.result.code = 0;
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/check_password', async (req, res) => {
    if (await db.userExists(res.locals))
        res.locals.result = {
            code: db.getPasswordHash(res.locals.request.password) ==
                config.get_password_hash(res.locals.request.password)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/set_role', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id))
        if (res.locals.request.role_id <= 4 && res.locals.request.role_id > 0)
            if (await db.groupExists(res.locals.request.group_id))
                res.locals.result = {
                    code: 0
                }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/set_group', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id))
        if (res.locals.request.role_id == 1)
            if (await db.groupExists(res.locals.request.group_id)) {
                db.setGroup(res.locals.request.user_id, res.locals.request.group_id)
                res.locals.result = {
                    code: 0
                }
            }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/get_group', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id))
        if (await db.userInfo(res.locals.request.user_id).role_id == 1)
            res.locals.result = {
                code: 0,
                group_id: await db.getGroup(res.locals.request.user_id)
            }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/verify', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id))
        if (await db.userInfo(res.locals.request.user_id).role_id == 1 &&
            await db.isVerified(res.locals.request.user_id) == 0) {
            db.acceptStudent(res.locals.request.user_id, await db.getGroup(res.locals.request.user_id))
            res.locals.result = {
                code: 0
            }
        }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/reject', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id))
        if (await db.userInfo(res.locals.request.user_id).role_id == 1 &&
            await db.isVerified(res.locals.request.user_id) == 0) {
            db.removeUser(res.locals.request.user_id)
            res.locals.result = {
                code: 0
            }
        }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/is_verified', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.userInfo(res.locals.request.user_id).role_id == 1)
        res.locals.result = {
            code: 0,
            is_verified: await db.isVerified(res.locals.request.user_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/whose_head', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.userInfo(res.locals.request.user_id).role_id == 2)
        res.locals.result = {
            code: 0,
            department_id: await db.whoseHead(res.locals.request.user_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/pin_teacher', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.userInfo(res.locals.request.user_id).role_id == 2)
        if (await db.disciplineExists(res.locals.request.subject_id)) {
            db.pinToDiscipline(res.locals.request.user_id, res.locals.request.subject_id)
            res.locals.result = {
                code: 0
            }
        } else {
            res.locals.result = {
                code: 2
            }
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/unpin_teacher', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.userInfo(res.locals.request.user_id).role_id == 2)
        if (await db.disciplineExists(res.locals.request.subject_id)) {
            db.unpinFromDiscipline(res.locals.request.user_id, res.locals.request.subject_id)
            res.locals.result = {
                code: 0
            }
        } else {
            res.locals.result = {
                code: 2
            }
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/teacher_subjects', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.userInfo(res.locals.request.user_id).role_id == 2)
        res.locals.result = {
            code: 0,
            subjects: await db.getSubjectsListOfTeacher(res.locals.request.user_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/create_group', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id))
        res.locals.result = {
            code: 0,
            group_id: await db.createGroup(res.locals.request)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/create_group', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id)) {
        db.removeMessage(res.locals.request.group_id)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/group_info', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id)) {
        res.locals.result = await db.groupInfo(res.locals.request.group_id)
        res.locals.code = 0
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/group_list', async (req, res) => {
    res.locals.result = {
        code: 0,
        groups: await db.groupList()
    }

    res.json(res.locals.result)
})

router.use('/dep_group_list', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id))
        res.locals.result = {
            code: 0,
            groups: await db.getGroupList(res.locals.request.department_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/group_studs', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id))
        res.locals.result = {
            code: 0,
            students: await db.studentListOfGroup(res.locals.request.group_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/group_subjects', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id))
        res.locals.result = {
            code: 0,
            subjects: await db.disciplineList(res.locals.request.group_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/can_see_group', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id) &&
        await db.userExists(res.locals.request.user_id)) {
        let user_info = await db.userInfo(res.locals.request.user_id)
        res.locals.result = {
            code: 0
        }
        if (user_info.role_id == 2)
            res.locals.result.can_see = 0
        else {
            if (user_info.role_id == 1) {
                res.locals.result.can_see = res.locals.request.group_id == await db.getGroup(res.locals.request.user_id)
            } else {
                let group_info = db.groupInfo(res.locals.request.group_id)
                let whose_head = db.whoseHead(res.locals.request.user_id)
                res.locals.result.can_see = await group_info.department_id == await whose_head
            }
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/create_discipline', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id))
        res.locals.result = {
            code: 0,
            discipline_id: await db.createDiscipline(res.locals.request.department_id, {
                name: res.locals.request.name
            })
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locale.result)
})

router.use('/remove_discipline', async (req, res) => {
    if (await db.disciplineExists(res.locals.request.discipline_id)) {
        db.removeDiscipline(res.locals.request)
        res.locals.result = {
            code: 0,
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/rename_discipline', async (req, res) => {
    if (await db.disciplineExists(res.locals.request.discipline_id)) {
        await db.renameDiscipline(res.locals.request.discipline_id, res.locals.request.name)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/discipline_info', async (req, res) => {
    if (await db.disciplineExists(res.locals.request.discipline_id)) {
        res.locals.result = await db.disciplineInfo(res.locals.request.discipline_id)
        res.locals.result.code = 0
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/discipline_list', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id))
        res.locals.result = {
            code: 0,
            subjects: await db.disciplineList(res.locals.request.department_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})


router.use('/add_subject', async (req, res) => {
    if (await db.groupExists(res.locals.request.group_id) &&
        await db.disciplineExists(res.locals.request.discipline_id))
        res.locals.result = {
            code: 0,
            subject_id: await db.pinDisciplineToGroup(res.locals.request.group_id, res.locals.request.subject_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/subject_info', async (req, res) => {
    if (await db.subjectExists(res.locals.request.subject_id)) {
        res.locals.result = await db.subjectInfo(res.locals.request.subject_id)
        res.locals.result.code = 0
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/remove_subject', async (req, res) => {
    if (await db.subjectExists(res.locals.request.subject_id)) {
        let subject_info = await db.subjectInfo(res.locals.request.subject_id)
        db.unpinFromDiscipline(subject_info.teacher_id, res.locals.request.subject_id)
        db.unpinDisciplineFromGroup()
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/can_see_subject', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.subjectExists(res.local.request.subject_id)) {
        let subject_info = db.subjectInfo(res.locals.request.subject_id)
        let user_info = await db.userInfo(res.locals.request.user_id)
        res.locals.result = {
            code: 0
        }

        if (user_info.role_id == 1) {
            res.locals.result.can_see = await db.getGroup(res.locals.request.user_id) == subject_info.group_id
        } else
        if (subject_info.teacher_id == res.locals.request.user_id)
            res.locals.result.can_see = 1;
        else
            res.locals.result.can_see = (
                await db.groupInfo(subject_info.group_id)).department_id ==
            await db.whoseHead(res.locals.request.user_id)
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/create_department', async (req, res) => {
    res.locals.result = db.createDepartment(res.locals.request)
    res.locals.code = 0

    res.json(res.locals.result)
})

router.use('/remove_department', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id)) {
        db.removeDepartment(res.locals.request.department_id)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/department_info', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id)) {
        res.locals.result = await db.departmentInfo(res.locals.request.department_id)
        res.locals.code = 0
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/rename_department', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id)) {
        db.renameDepartment(res.locals.request.department_id, res.locals.request.name)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/department_list', async (req, res) => {
    res.locals.result = {
        code: 0,
        departments: await db.departmentList()
    }

    res.json(res.locals.result)
})

router.use('/make_head', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id) &&
        await db.userExists(res.locals.request.user_id)) {
        let old_head = (await db.departmentInfo(res.locals.request.department_id)).head_id
        db.setDepartmentHead(res.locals.request.department_id, res.locals.request.user_id)
        res.locals.result = {
            code: 0,
            prev_head_id: old_head,
            new_head_id: res.locals.request.user_id
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/dep_verify_list', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id))
        res.locals.result = {
            code: 0,
            students: await db.verifyList(res.locals.request.department_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/can_see_dep', async (req, res) => {
    if (await db.departmentExists(res.locals.request.department_id) &&
        await db.userExists(res.locals.request.user_id))
        res.locals.result = {
            code: 0,
            can_see: (await db.userInfo(res.locals.request.user_id)).role_id == 2 &&
                await db.whoseHead(res.locals.request.user_id) == res.locals.request.department_id
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/create_topic', async (req, res) => {
    if (await db.subjectExists(res.locals.request.subject_id))
        res.locals.result = {
            code: 0,
            topic_id: await db.createTopic(res.locals.request)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/remove_topic', async (req, res) => {
    if (await db.topicExists(res.locals.request.topic_id)) {
        db.removeTopic(res.locals.request.topic_id)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/rename_topic', async (req, res) => {
    if (await db.topicExists(res.locals.request.topic_id)) {
        db.renameTopic(res.locals.request.topic_id, res.locals.request.name)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/topic_list', async (req, res) => {
    if (await db.subjectExists(res.locals.request.subject_id))
        res.locals.result = {
            code: 0,
            topics: await db.topicList(res.locals.request.subject_id)
        }
    else 
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/create_message', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.topicExists(res.locals.request.topic_id))
        if (typeof res.locals.request.file == "string")
            res.locals.result = {
                code: 0,
                message_id: await db.createsMessage(res.locals.request)
            }
    else
        res.locals.result = {
            code: 2
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/remove_message', async (req, res) => {
    if (await db.messageExists(res.locals.request.message_id)) {
        db.removeMessage(res.locals.request.message_id)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/edit_message', async (req, res) => {
    if (await db.messageExists(res.locals.request.message_id)) {
        db.editMessage(res.locals.request)
        res.locals.result = {
            code: 0
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/edit_message_file', async (req, res) => {
    if (await db.messageExists(res.locals.request.message_id)) {
        if (typeof res.locals.request.file == "string") {
            db.editMessageFile(res.locals.request.message_id, res.locals.request.file)
            res.locals.result = {
                code: 0
            }
        } else {
            res.locals.result = {
                code: 2
            }
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/message_info', async (req, res) => {
    if (await db.messageExists(res.locals.request.message_id)) {
        res.locals.result = await db.messageInfo(res.local.request.message_id)
        res.locals.result.code = 0
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})

router.use('/topic_message', async (req, res) => {
    if (await db.topicExists(res.locals.request.topic_id))
        res.locals.result = {
            code: 0,
            messages: await db.getTopicMessages(res.locals.request.topic_id)
        }
    else
        res.locals.result = {
            code: 1
        }

    res.json(res.locals.result)
})

router.use('/can_see_topic', async (req, res) => {
    if (await db.userExists(res.locals.request.user_id) &&
        await db.topicExists(res.locals.request.topic_id)) {
        res.locals.result = {
            code: 0
        }

        let user_info = await db.userInfo(res.locals.request.user_id)
        let topic_info = await db.topicInfo(res.locals.request.topic_id)

        let subject_info = await db.subjectInfo(topic_info.subject_id);
        let group_info;

        if (user_info.role == 2) {
            if (subject_info.teacher_id == res.locals.request.user_id) {
                res.locals.result.can_see = 1
            } else {
                group_id = await db.groupInfo(subject_info.group_id)

                res.locals.result.can_see = group_id.department_id == await db.whoseHead(res.locals.request.user_id)
            }
        } else {
            res.locals.result.can_see = subject_info.group_id == await db.getGroup(res.locals.request.user_id)
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.locals.result)
})



router.use('/get_jwt_by_login', async (req, res) => {
    let user_id = await db.findUserByEmail(res.locals.request.login)
    if (user_id != 0) {
        if (await db.getPasswordHash(user_id) == config.get_password_hash(res.locals.request.password)) {
            let refresh_token_id = db.addRefreshToken(user_id)

            res.locals.result = {
                code: 0,
                access_token: jwt.sign({
                    usr: user_id,
                    exp: (new Date()).now() + 900000
                }, config.access_token_secret_key),
                refresh_token: jwt.sign({
                    jti: await refresh_token_id
                }, config.refresh_token_secret_key)
            }
        } else {
            res.locals.result = {
                code: 1
            }
        }
    } else {
        res.locals.result = {
            code: 1
        }
    }

    res.json(res.local.result)
})

router.use('/check_jwt', async (req, res) => {
    await jwt.verify(res.locals.request.access_token, config.access_token_secret_key, async (err, dec) => {
        if (err) {
            if (err.name == "TokenExpiredError") {
                await jwt.verify(res.locals.request.refresh_token, config.refresh_token_secret_key, async (err, dec) => {
                    if (err) {
                        res.locals.result = {
                            code: 1
                        }
                    } else {
                        let user_id = await db.getRefreshToken(dec.jti)
                        let refresh_token_id = db.addRefreshToken(user_id)

                        res.locals.result = {
                            code: 0,
                            need_update: 1,
                            user_id: user_id,
                            access_token: jwt.sign({
                                usr: user_id,
                                exp: (new Date()).now() + 900000
                            }, config.access_token_secret_key),
                            refresh_token: jwt.sign({
                                jti: await refresh_token_id
                            }, config.refresh_token_secret_key)
                        }
                    }
                })
            } else {
                res.locals.result = {
                    code: 1
                }
            }
        } else {
            res.locals.result = {
                code: 0,
                need_update: 0,
                user_id: dec.usr
            }
        }
    })

    res.json(res.locals.result)
})

module.exports = router;
db.removeUser(res.locals.request.user_id)