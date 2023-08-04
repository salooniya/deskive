const { DB, Users } = $.deskive;

const checkDocExists = function (doc, res) {
    if (doc) return true;
    else return res.status(404).json({
        status: 'fail',
        message: 'No document found'
    });
};

const getAllUsers = async (req, res) => {
    res.status(200).json({
        status: 'success',
        length: Users.docs.length,
        data: {
            users: Users.docs
        }
    });
};

const getUser = async (req, res) => {
    const doc = Users.getOneById(req.params.id);
    if (!checkDocExists(doc, res)) return;

    res.status(200).json({
        status: 'success',
        data: {
            user: doc
        }
    });
};

const createUser = async (req, res) => {
    const doc = Users.create(req.body);
    await DB.save();
    res.status(201).json({
        status: 'success',
        data: {
            user: doc
        }
    });
};

const updateUser = async (req, res) => {
    const doc = Users.updateOneById(req.params.id, req.body);
    if (!checkDocExists(doc, res)) return;

    await DB.save();
    res.status(200).json({
        status: 'success',
        data: {
            user: doc
        }
    });
};

const deleteUser = async (req, res) => {
    const doc = Users.deleteOneById(req.params.id);
    if (!checkDocExists(doc, res)) return;

    await DB.save();
    res.status(204).json({
        status: 'success',
        data: {
            user: doc
        }
    });
};

export default {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}
